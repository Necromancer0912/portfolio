"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/motion";
import { PATTERNS } from "@/lib/patterns";

/* Morph. A field of small square particles — packets — that assemble into
   abstract figures and re-form into the next one every few seconds,
   each particle on its own spring so the change ripples rather than cuts.

   Pointer: particles part around it like a fluid and flow back.
   Hold: the figure dissolves; every particle is pulled into a vortex around
   the pointer, tighter and faster the longer you hold.
   Release: they burst outward and spring back into the next figure. */

const HOLD_NEXT = 3600; // ms a word rests before the next

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  k: number; // spring stiffness, varied so words ripple into place
  a: number; // vortex angle
  r: number; // vortex radius factor
  accent: boolean;
};

export function Morph({ onWord }: { onWord?: (i: number, w: string) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const onWordRef = useRef(onWord);
  onWordRef.current = onWord;

  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const still = reducedMotion();

    let w = 0,
      h = 0,
      dpr = 1,
      step = 7,
      size = 3;
    let targets: Float32Array[] = []; // per word: [x0,y0,x1,y1,...]
    let ps: P[] = [];
    let word = 0;

    const build = () => {
      const b = el.getBoundingClientRect();
      w = b.width;
      h = b.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      step = w < 520 ? 5 : 7;
      size = step * 0.46;
      const count = Math.min(4000, Math.round((w * h) / (step * step) / 3));
      targets = PATTERNS.map((pt) => pt.points(count, w, h));
      const N = Math.max(...targets.map((t) => t.length / 2));
      const old = ps;
      ps = Array.from({ length: N }, (_, i) => {
        const prev = old[i];
        return {
          x: prev ? prev.x : w / 2 + (Math.random() - 0.5) * w * 1.2,
          y: prev ? prev.y : h / 2 + (Math.random() - 0.5) * h * 1.2,
          vx: 0,
          vy: 0,
          k: 26 + Math.random() * 38,
          a: Math.random() * Math.PI * 2,
          r: Math.pow(Math.random(), 0.7),
          accent: Math.random() < 0.05,
        };
      });
    };

    /* Where particle i wants to be for the current word. Words with fewer
       points than particles double particles up on existing points. */
    const target = (i: number) => {
      const t = targets[word];
      const n = t.length / 2;
      const j = i < n ? i : (i * 7919) % n;
      return [t[j * 2], t[j * 2 + 1]] as const;
    };

    /* pointer + hold */
    let mx = -9999,
      my = -9999,
      inside = false,
      holding = false,
      hold = 0, // 0..1 build-up while holding
      hx = 0,
      hy = 0,
      lastSwap = performance.now();

    const setWord = (i: number) => {
      word = (i + PATTERNS.length) % PATTERNS.length;
      lastSwap = performance.now();
      onWordRef.current?.(word, PATTERNS[word].name);
    };

    const label = () => {
      const s = holding ? (hold > 0.85 ? "Release" : "Keep holding") : inside ? "Press and hold" : "";
      if (el.getAttribute("data-cursor") !== s) el.setAttribute("data-cursor", s);
    };

    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
      mx = my = -9999;
      if (holding) release();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || still) return;
      const b = el.getBoundingClientRect();
      holding = true;
      hx = e.clientX - b.left;
      hy = e.clientY - b.top;
      el.setPointerCapture(e.pointerId);
    };
    const release = () => {
      if (!holding) return;
      holding = false;
      // Burst: fling every particle outward from the hold point.
      const force = 300 + 1500 * hold;
      for (const p of ps) {
        const dx = p.x - hx,
          dy = p.y - hy;
        const d = Math.hypot(dx, dy) || 1;
        p.vx += (dx / d) * force * (0.4 + Math.random() * 0.6) + (-dy / d) * force * 0.5;
        p.vy += (dy / d) * force * (0.4 + Math.random() * 0.6) + (dx / d) * force * 0.5;
      }
      hold = 0;
      setWord(word + 1);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    let t = 0,
      last = performance.now(),
      raf = 0,
      visible = true;

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      t += dt;

      if (holding) {
        hold = Math.min(1, hold + dt * 0.6);
        hx += (mx - hx) * Math.min(1, dt * 5);
        hy += (my - hy) * Math.min(1, dt * 5);
      } else if (!still && now - lastSwap > HOLD_NEXT) {
        setWord(word + 1);
      }

      const R = 110,
        R2 = R * R;
      const spin = 1.2 + hold * 5;
      const radius = Math.min(w, h) * (0.32 - hold * 0.2);

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        let tx: number, ty: number;
        if (holding) {
          p.a += spin * dt * (0.6 + p.r);
          const rr = 8 + radius * p.r;
          tx = hx + Math.cos(p.a) * rr;
          ty = hy + Math.sin(p.a) * rr * 0.85;
        } else {
          [tx, ty] = target(i);
          // a gentle breathing drift so the word feels alive
          tx += Math.sin(t * 1.3 + i * 0.37) * 0.8;
          ty += Math.cos(t * 1.1 + i * 0.29) * 0.8;
        }
        const k = holding ? 14 : p.k;
        const damp = holding ? 5 : 7.5;
        let ax = (tx - p.x) * k - p.vx * damp;
        let ay = (ty - p.y) * k - p.vy * damp;

        // Pointer parts the field when not holding.
        if (!holding && inside) {
          const dx = p.x - mx,
            dy = p.y - my,
            d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 5200;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }
        p.vx += ax * dt;
        p.vy += ay * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      draw();
      label();
      if (visible) raf = requestAnimationFrame(frame);
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // bone particles
      ctx.fillStyle = "#eceae4";
      for (const p of ps) {
        if (p.accent) continue;
        const sp = Math.min(1, Math.hypot(p.vx, p.vy) / 900);
        ctx.globalAlpha = 0.9 - sp * 0.45;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#c8f03c";
      for (const p of ps) if (p.accent) ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      // hold core
      if (holding) {
        ctx.strokeStyle = `rgba(200,240,60,${0.25 + hold * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hx, hy, 6 + hold * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    build();
    onWordRef.current?.(0, PATTERNS[0].name);
    document.fonts?.ready.then(build);
    const ro = new ResizeObserver(() => {
      build();
      if (still) snap();
    });
    ro.observe(el);

    // Reduced motion: place particles on the first word and stop.
    const snap = () => {
      ps.forEach((p, i) => {
        const [tx, ty] = target(i);
        p.x = tx;
        p.y = ty;
      });
      draw();
    };

    let io: IntersectionObserver | null = null;
    if (still) {
      document.fonts?.ready.then(snap);
      snap();
    } else {
      io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          last = performance.now();
          lastSwap = performance.now();
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
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 cursor-crosshair select-none touch-pan-y" data-cursor="">
      <canvas
        ref={canvas}
        className="block h-full w-full"
        role="img"
        aria-label="Small square particles assembling into abstract figures — rings, a sunflower spiral, a Lissajous curve, ridgelines, a rose curve, a lensed grid. Press and hold to pull them into a vortex; let go and they burst into the next figure."
      />
    </div>
  );
}
