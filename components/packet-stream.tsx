"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/motion";

/* A river of pixel packets crossing the page between two sections. Each
   packet rides one of a few wavy lanes, snapped to an 8px grid so it reads
   as pixels. The pointer pushes them out of the way, and every so often one is
   "dropped": it flashes red and falls out of the stream. */

const CELL = 8;
const COLORS = ["#232323", "#232323", "#232323", "#75726b", "#a6a29a", "#c8f03c"];

type P = { x: number; lane: number; speed: number; c: string; drop: number };

export function PacketStream() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    let w = 0,
      h = 0,
      dpr = 1,
      ps: P[] = [];

    const LANES = 7;
    const seed = () => {
      const n = Math.round((w / 1440) * 520);
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        lane: (Math.random() * LANES) | 0,
        speed: 40 + Math.random() * 70,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        drop: 0,
      }));
    };
    const size = () => {
      const b = el.getBoundingClientRect();
      w = b.width;
      h = b.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      seed();
    };

    let mx = -999,
      my = -999;
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
    };
    const onLeave = () => (mx = my = -999);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    let t = 0,
      last = performance.now(),
      raf = 0,
      visible = false;

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      for (const p of ps) {
        const laneOff = (p.lane - (LANES - 1) / 2) * 11;
        let y = mid + laneOff + Math.sin(p.x * 0.006 + t * 0.8 + p.lane * 0.7) * (h * 0.22);
        const dx = p.x - mx,
          dy = y - my,
          d = Math.hypot(dx, dy);
        if (d < 90) y += (dy >= 0 ? 1 : -1) * (90 - d) * 0.7;
        if (p.drop > 0) y += p.drop * p.drop * 140;
        const gx = Math.round(p.x / CELL) * CELL,
          gy = Math.round(y / CELL) * CELL;
        ctx.fillStyle = p.drop > 0 ? "#d94f3d" : p.c;
        ctx.globalAlpha = p.drop > 0 ? Math.max(0, 1 - p.drop) : 1;
        ctx.fillRect(gx, gy, CELL - 1, CELL - 1);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      for (const p of ps) {
        p.x += p.speed * dt;
        if (p.drop > 0) p.drop += dt * 0.9;
        else if (Math.random() < 0.00006) p.drop = 0.01;
        if (p.x > w + 10 || p.drop > 1.1) {
          p.x = -10 - Math.random() * 60;
          p.drop = 0;
        }
      }
      draw();
      if (visible) raf = requestAnimationFrame(frame);
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(el);
    const still = reducedMotion();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !still;
      if (visible) {
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      } else draw();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section aria-label="Decoration: a stream of pixel packets" className="relative border-y border-rule bg-bone">
      <div className="wrap flex items-end justify-between gap-4 pt-5">
        <p className="label text-mute">Fig. — packets in flight</p>
        <p className="label hidden text-mute sm:block">Hover to get in their way · a few get dropped</p>
      </div>
      <div ref={wrap} className="relative h-[190px] w-full" data-cursor="">
        <canvas ref={canvas} className="block h-full w-full" />
      </div>
    </section>
  );
}
