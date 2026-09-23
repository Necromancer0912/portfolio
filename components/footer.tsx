"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/content";
import { scrollToId } from "@/lib/motion";
import { LinkedButtons, Odometer, SectionHead } from "./primitives";

type Stroke = { pts: [number, number][]; born: number; color: string };
const LIFE = 8000;
const PENS = ["#eceae4", "#c8f03c", "#8f8d88"];

/* Drawing is what I do away from the keyboard, so the footer has a
   sketchpad. Strokes fade after a few seconds so it never fills up. */
function Sketchpad() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const pen = useRef(PENS[0]);
  const [penIdx, setPenIdx] = useState(0);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0,
      drawing: Stroke | null = null,
      visible = false;
    const size = () => {
      const b = el.getBoundingClientRect();
      w = b.width;
      h = b.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    };
    const pos = (e: PointerEvent): [number, number] => {
      const b = cv.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    };
    const down = (e: PointerEvent) => {
      cv.setPointerCapture(e.pointerId);
      drawing = { pts: [pos(e)], born: Infinity, color: pen.current };
      strokes.current.push(drawing);
      setDrawn(true);
    };
    const move = (e: PointerEvent) => {
      if (drawing) drawing.pts.push(pos(e));
    };
    const up = () => {
      if (drawing) drawing.born = performance.now();
      drawing = null;
    };
    const loop = () => {
      const now = performance.now();
      strokes.current = strokes.current.filter((s) => now - s.born < LIFE);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const s of strokes.current) {
        const age = s.born === Infinity ? 0 : (now - s.born) / LIFE;
        ctx.globalAlpha = 1 - age * age;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        s.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        if (s.pts.length === 1) ctx.lineTo(s.pts[0][0] + 0.1, s.pts[0][1]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (visible) raf = requestAnimationFrame(loop);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[12px] border border-rule-ink bg-ink-2">
      <div className="flex items-center justify-between border-b border-rule-ink px-4 py-2.5">
        <span className="label text-dim">Sketchpad — I draw; your turn</span>
        <div className="flex items-center gap-2">
          {PENS.map((c, i) => (
            <button
              key={c}
              aria-label={`Pen ${i + 1}`}
              onClick={() => {
                pen.current = c;
                setPenIdx(i);
              }}
              className={`h-3.5 w-3.5 rounded-full ring-offset-2 ring-offset-ink-2 transition ${penIdx === i ? "ring-1 ring-bone" : ""}`}
              style={{ background: c }}
            />
          ))}
          <button onClick={() => ((strokes.current = []), setDrawn(false))} className="odo-host label ml-2 text-dim hover:text-bone">
            <Odometer text="Clear" />
          </button>
        </div>
      </div>
      <div ref={wrap} className="dots relative min-h-[280px] flex-1" data-cursor="Draw">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full touch-none" aria-label="Sketchpad" />
        {!drawn && <p className="label pointer-events-none absolute inset-0 grid place-items-center text-faint">Click and drag</p>}
      </div>
    </div>
  );
}

/* Bone dissolving into ink in stepped pixels, denser row by row. */
function DitherEdge() {
  const cols = 144,
    rows = 5,
    size = 10;
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const density = [0.06, 0.2, 0.42, 0.68, 0.9];
  const rects: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (rnd() < density[r]) rects.push({ x: c * size, y: r * size });
  return (
    <svg viewBox={`0 0 ${cols * size} ${rows * size}`} preserveAspectRatio="none" className="block h-[30px] w-full sm:h-[46px]" aria-hidden>
      {rects.map((q, i) => (
        <rect key={i} x={q.x} y={q.y} width={size} height={size} fill="#232323" />
      ))}
    </svg>
  );
}

/* A large marquee; over it, a signal disc follows the pointer and the
   whole band is a mailto link. */
function HelloMarquee() {
  const wrap = useRef<HTMLAnchorElement>(null);
  const disc = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const el = wrap.current!;
    let x = -200,
      y = 0,
      cx = x,
      cy = y,
      raf = 0,
      first = true;
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      x = e.clientX - b.left;
      y = e.clientY - b.top;
      if (first) {
        cx = x;
        cy = y;
        first = false;
      }
    };
    const loop = () => {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      if (disc.current) disc.current.style.transform = `translate3d(${cx - 66}px, ${cy - 66}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
    };
  }, [on]);
  const phrase = "Say hello — ";
  return (
    <a
      ref={wrap}
      href={`mailto:${profile.email}`}
      onPointerEnter={() => setOn(true)}
      onPointerLeave={() => setOn(false)}
      className="relative block cursor-none overflow-hidden border-y border-rule-ink py-8"
      aria-label={`Email ${profile.email}`}
    >
      <div className="marquee" aria-hidden>
        {[0, 1].map((k) => (
          <span key={k} className="display shrink-0 whitespace-nowrap pr-6 text-[clamp(64px,11vw,176px)] leading-none">
            {phrase}
            <span className="text-dim">write me a line — </span>
            {phrase}
            <span className="text-dim">write me a line — </span>
          </span>
        ))}
      </div>
      <span
        ref={disc}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 grid h-[132px] w-[132px] place-items-center rounded-full bg-signal text-ink transition-[opacity,scale] duration-300 ${
          on ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <span className="label text-center text-[11px]">
          Write
          <br />
          to me ↗
        </span>
      </span>
    </a>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  return (
    <LinkedButtons
      tone="light"
      left={{ label: copied ? "Copied" : "Copy email", dot: true, onClick: copy }}
      right={{ label: "Write ↗", href: `mailto:${profile.email}` }}
    />
  );
}

export function Footer() {
  const links = [
    { label: "GitHub", href: profile.github },
    { label: "Résumé (PDF)", href: profile.resume },
    { label: profile.instituteEmail, href: `mailto:${profile.instituteEmail}` },
  ];

  return (
    <>
      <DitherEdge />
      <footer id="contact" className="overflow-hidden bg-ink text-bone">
        <div className="wrap grid gap-14 pb-20 pt-24 md:grid-cols-2 md:pt-32">
          <div className="flex flex-col justify-between gap-12">
            <div>
              <SectionHead n="09" label="Contact" title={["Say", "hello."]} dark />
              <p className="mt-8 max-w-[440px] text-[17px] leading-[1.6] text-bone/65">
                If you&apos;re working on something in speech, language or networked systems and could use a curious pair of
                hands, I&apos;d love to hear about it.
              </p>
              <p className="display mt-8 text-[clamp(22px,2.2vw,30px)]">{profile.email}</p>
              <div className="mt-5">
                <CopyEmail />
              </div>
            </div>
            <ul className="space-y-1.5">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="odo-host label group inline-flex items-center text-dim transition-colors hover:text-bone"
                  >
                    <span className="inline-block w-0 overflow-hidden text-signal transition-[width] duration-300 group-hover:w-5">→</span>
                    <Odometer text={l.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Sketchpad />
        </div>

        <HelloMarquee />

        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-6">
          <p className="label text-dim">© 2026 Sayan Das</p>
          <p className="label text-faint">Made slowly, with Next.js and a canvas</p>
          <button onClick={() => scrollToId("top")} className="odo-host label text-dim transition-colors hover:text-bone">
            <Odometer text="Back to top ↑" />
          </button>
        </div>
      </footer>
    </>
  );
}
