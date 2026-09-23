"use client";

import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "@/lib/motion";
import { PATTERNS } from "@/lib/patterns";
import { Morph } from "./morph";

/* Swarm. Tens of thousands of glowing particles, simulated on the GPU
   (WebGL2 transform feedback): every frame a vertex shader integrates
   each particle's spring toward its place in the current pattern, a
   flowing current field, the pointer, and the hold/release forces, and
   writes the new state back to a buffer. A second pass draws them as
   soft additive points, so dense areas glow.

   Patterns (rings, phyllotaxis, Lissajous, ridgelines, a rose, a lensed
   grid) re-form every few seconds, each turning slowly in place; between
   them the current field is turned up, so the swarm streams across the
   stage like smoke before it condenses. Pointer: stirs the swarm. Hold:
   everything is drawn into a spinning galaxy around the pointer.
   Release: it bursts, then streams back into the next pattern.

   Browsers without WebGL2 get the 2D <Morph> instead. */

const SWAP_MS = 5200;

const UPDATE_VS = `#version 300 es
precision highp float;
in vec2 aPos; in vec2 aVel; in vec2 aTarget; in float aSeed;
uniform float uDt, uTime, uHold, uMorph, uBurst, uInside, uSpin;
uniform vec2 uMouse, uHoldPt, uRes;
out vec2 vPos; out vec2 vVel;
void main() {
  vec2 p = aPos, v = aVel;
  vec2 cen = uRes * 0.5, off = aTarget - cen;
  float cs = cos(uSpin), sn = sin(uSpin);
  vec2 tgt = cen + vec2(off.x * cs - off.y * sn, off.x * sn + off.y * cs);
  float r1 = fract(aSeed * 7.31), r2 = fract(aSeed * 13.7), r3 = fract(aSeed * 3.13);
  if (uHold > 0.0) {
    // A spiral galaxy: two arms, inner stars orbit faster than outer ones.
    float rn = pow(r2, 0.65);
    float rad = 10.0 + rn * min(uRes.x, uRes.y) * (0.42 - 0.12 * uHold);
    float arm = step(0.5, r1) * 3.14159;
    float a = arm + rn * 5.5 + uTime * (0.5 + uHold * 1.5) / (0.4 + rn) + (r3 - 0.5) * (1.4 + rn);
    rad *= 0.86 + 0.28 * fract(aSeed * 23.1); // soft, starry arms
    tgt = uHoldPt + vec2(cos(a), sin(a) * 0.62) * rad;
  }
  // Stiff enough while holding that particles keep up with their orbit
  // instead of cutting inside it.
  float k = uHold > 0.0 ? 60.0 : 12.0 + r3 * 26.0;
  float damp = uHold > 0.0 ? 11.0 : 6.2;
  vec2 acc = (tgt - p) * k - v * damp;

  // A smooth current field (sum of travelling sines), stronger mid-morph.
  vec2 q = p * 0.0055;
  vec2 flow = vec2(
    sin(q.y * 1.7 + uTime * 0.55) + 0.6 * sin(q.y * 3.3 - uTime * 0.35 + aSeed * 2.0) + 0.4 * sin((q.x + q.y) * 2.1 + uTime * 0.8),
    cos(q.x * 1.9 - uTime * 0.45) + 0.6 * cos(q.x * 2.9 + uTime * 0.3 + aSeed) + 0.4 * cos((q.x - q.y) * 2.3 - uTime * 0.7)
  );
  acc += flow * (22.0 + uMorph * 1100.0);

  if (uInside > 0.5 && uHold == 0.0) {
    vec2 d = p - uMouse;
    float l = length(d);
    if (l < 140.0) {
      float f = 1.0 - l / 140.0;
      vec2 n = d / max(l, 1.0);
      acc += n * f * f * 14000.0 + vec2(-n.y, n.x) * f * 6000.0;
    }
  }
  if (uBurst > 0.0) {
    vec2 d = p - uHoldPt;
    float l = max(length(d), 1.0);
    v += (d / l * (0.35 + r1) + vec2(-d.y, d.x) / l * 0.7) * uBurst;
  }
  v += acc * uDt;
  p += v * uDt;
  vPos = p; vVel = v;
  gl_Position = vec4(0.0);
}`;

const UPDATE_FS = `#version 300 es
precision highp float; out vec4 o; void main() { o = vec4(0.0); }`;

const DRAW_VS = `#version 300 es
precision highp float;
in vec2 aPos; in vec2 aVel; in float aSeed;
uniform vec2 uRes; uniform float uDpr;
out vec4 vCol;
void main() {
  vec2 c = aPos / uRes * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
  float r = fract(aSeed * 9.17);
  gl_PointSize = uDpr * (1.1 + r * 1.4);
  float sp = length(aVel);
  bool lime = fract(aSeed * 17.3) < 0.045;
  vec3 col = lime ? vec3(0.784, 0.941, 0.235) : vec3(0.925, 0.918, 0.894);
  float a = (lime ? 0.9 : 0.42) * (1.0 - min(sp / 2200.0, 0.55));
  vCol = vec4(col * a, a);
}`;

const DRAW_FS = `#version 300 es
precision highp float;
in vec4 vCol; out vec4 o;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  o = vCol * (1.0 - d * 2.2);
}`;

function compile(gl: WebGL2RenderingContext, vs: string, fs: string, feedback?: string[]) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  if (feedback) gl.transformFeedbackVaryings(p, feedback, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
  return p;
}

export function Swarm({ onWord }: { onWord?: (i: number, w: string) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  const onWordRef = useRef(onWord);
  onWordRef.current = onWord;

  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    const gl = cv.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) {
      setFallback(true);
      return;
    }
    const still = reducedMotion();

    let upd: WebGLProgram, drw: WebGLProgram;
    try {
      upd = compile(gl, UPDATE_VS, UPDATE_FS, ["vPos", "vVel"]);
      drw = compile(gl, DRAW_VS, DRAW_FS);
    } catch {
      setFallback(true);
      return;
    }

    let w = 0,
      h = 0,
      dpr = 1,
      N = 0;
    let wordTargets: Float32Array[] = [];
    let word = 0;

    // Buffers: positions and velocities are double-buffered (A → B).
    const buf = () => gl.createBuffer()!;
    const pos = [buf(), buf()],
      vel = [buf(), buf()],
      tgtBuf = buf(),
      seedBuf = buf();
    let cur = 0;

    const uploadTargets = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, tgtBuf);
      gl.bufferData(gl.ARRAY_BUFFER, wordTargets[word], gl.DYNAMIC_DRAW);
    };

    const build = (keep: boolean) => {
      const b = el.getBoundingClientRect();
      w = Math.max(1, b.width);
      h = Math.max(1, b.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const nextN = w < 640 ? 24000 : 60000;
      wordTargets = PATTERNS.map((pt) => pt.points(nextN, w, h));
      if (!keep || nextN !== N) {
        N = nextN;
        const p0 = new Float32Array(N * 2),
          v0 = new Float32Array(N * 2),
          s0 = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          // Start gathered in a small seed at the centre, so the first
          // thing seen is the figure blooming outward, not static.
          const a = Math.random() * Math.PI * 2,
            r = Math.sqrt(Math.random()) * Math.min(w, h) * 0.05;
          p0[i * 2] = still ? wordTargets[0][i * 2] : w / 2 + Math.cos(a) * r;
          p0[i * 2 + 1] = still ? wordTargets[0][i * 2 + 1] : h / 2 + Math.sin(a) * r;
          s0[i] = Math.random();
        }
        for (const bf of [...pos, ...vel]) {
          gl.bindBuffer(gl.ARRAY_BUFFER, bf);
          gl.bufferData(gl.ARRAY_BUFFER, N * 8, gl.DYNAMIC_COPY);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, pos[cur]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, p0);
        gl.bindBuffer(gl.ARRAY_BUFFER, vel[cur]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, v0);
        gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
        gl.bufferData(gl.ARRAY_BUFFER, s0, gl.STATIC_DRAW);
      }
      uploadTargets();
    };

    const attr = (prog: WebGLProgram, name: string, b: WebGLBuffer, size: number) => {
      const loc = gl.getAttribLocation(prog, name);
      if (loc < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    const U = (prog: WebGLProgram) => (n: string) => gl.getUniformLocation(prog, n);
    const uu = U(upd),
      ud = U(drw);
    const tf = gl.createTransformFeedback()!;
    const vaoU = gl.createVertexArray()!,
      vaoD = gl.createVertexArray()!;

    /* interaction */
    let mx = -9999,
      my = -9999,
      inside = false,
      holding = false,
      hold = 0,
      hx = 0,
      hy = 0,
      burst = 0,
      spin = 0,
      lastSwap = performance.now();

    const setWord = (i: number) => {
      word = (i + PATTERNS.length) % PATTERNS.length;
      spin = 0;
      lastSwap = performance.now();
      uploadTargets();
      onWordRef.current?.(word, PATTERNS[word].name);
    };
    const label = () => {
      const s = holding ? (hold > 0.85 ? "Release" : "Keep holding") : inside ? "Press and hold" : "";
      if (el.getAttribute("data-cursor") !== s) el.setAttribute("data-cursor", s);
    };
    const local = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top] as const;
    };
    const onMove = (e: PointerEvent) => {
      [mx, my] = local(e);
      inside = true;
    };
    const onLeave = () => {
      inside = false;
      mx = my = -9999;
      if (holding) release();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || still) return;
      [hx, hy] = local(e);
      holding = true;
      el.setPointerCapture(e.pointerId);
    };
    const release = () => {
      if (!holding) return;
      holding = false;
      burst = 500 + 1900 * hold;
      hold = 0;
      setWord(word + 1);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    /* frame */
    let t = 0,
      last = performance.now(),
      raf = 0,
      visible = true;

    const step = (dt: number) => {
      const nxt = 1 - cur;
      gl.useProgram(upd);
      gl.bindVertexArray(vaoU);
      attr(upd, "aPos", pos[cur], 2);
      attr(upd, "aVel", vel[cur], 2);
      attr(upd, "aTarget", tgtBuf, 2);
      attr(upd, "aSeed", seedBuf, 1);
      const since = (performance.now() - lastSwap) / 1000;
      gl.uniform1f(uu("uDt"), dt);
      gl.uniform1f(uu("uTime"), t);
      gl.uniform1f(uu("uHold"), holding ? Math.max(0.001, hold) : 0);
      gl.uniform1f(uu("uMorph"), still ? 0 : Math.exp(-since * 2.2));
      gl.uniform1f(uu("uBurst"), burst);
      gl.uniform1f(uu("uInside"), inside ? 1 : 0);
      gl.uniform1f(uu("uSpin"), spin);
      gl.uniform2f(uu("uMouse"), mx, my);
      gl.uniform2f(uu("uHoldPt"), hx, hy);
      gl.uniform2f(uu("uRes"), w, h);
      gl.enable(gl.RASTERIZER_DISCARD);
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, pos[nxt]);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vel[nxt]);
      gl.beginTransformFeedback(gl.POINTS);
      gl.drawArrays(gl.POINTS, 0, N);
      gl.endTransformFeedback();
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
      gl.disable(gl.RASTERIZER_DISCARD);
      cur = nxt;
      burst = 0;
    };

    const draw = () => {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(drw);
      gl.bindVertexArray(vaoD);
      attr(drw, "aPos", pos[cur], 2);
      attr(drw, "aVel", vel[cur], 2);
      attr(drw, "aSeed", seedBuf, 1);
      gl.uniform2f(ud("uRes"), w, h);
      gl.uniform1f(ud("uDpr"), dpr);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, N);
      gl.disable(gl.BLEND);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      t += dt;
      spin += dt * PATTERNS[word].spin;
      if (holding) {
        hold = Math.min(1, hold + dt * 0.55);
        hx += (mx - hx) * Math.min(1, dt * 5);
        hy += (my - hy) * Math.min(1, dt * 5);
      } else if (now - lastSwap > SWAP_MS) setWord(word + 1);
      // two half-steps keep the stiff springs stable
      step(dt / 2);
      step(dt / 2);
      draw();
      label();
      if (visible) raf = requestAnimationFrame(frame);
    };

    build(false);
    onWordRef.current?.(0, PATTERNS[0].name);
    document.fonts?.ready.then(() => build(true));
    const ro = new ResizeObserver(() => {
      build(true);
      if (still) draw();
    });
    ro.observe(el);

    let io: IntersectionObserver | null = null;
    if (still) draw();
    else {
      io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          last = performance.now();
          // Count as already part-way into the figure, so arriving (or
          // coming back) calms the smoke current instead of stirring it up.
          lastSwap = performance.now() - 1200;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        }
      });
      io.observe(el);
    }

    return () => {
      io?.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointercancel", release);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  if (fallback) return <Morph onWord={onWord} />;

  return (
    <div ref={wrap} className="absolute inset-0 cursor-crosshair select-none touch-pan-y" data-cursor="">
      <canvas
        ref={canvas}
        className="block h-full w-full"
        role="img"
        aria-label="Tens of thousands of glowing particles settling into slowly turning abstract figures — concentric rings, a sunflower spiral, a Lissajous curve, ridgelines, a rose curve, a lensed grid — and streaming between them. Press and hold to pull them into a spinning galaxy; let go and they burst into the next figure."
      />
    </div>
  );
}
