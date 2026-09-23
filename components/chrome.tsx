"use client";

import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "@/lib/motion";

/* Smooth scrolling, and the <html data-ready> flag that releases the
   hero once fonts are in (or after half a second) — no loading screen. */
export function SmoothScroll() {
  useEffect(() => {
    const ready = () => (document.documentElement.dataset.ready = "1");
    const t = window.setTimeout(ready, 500);
    document.fonts?.ready.then(ready);
    if (reducedMotion()) return () => window.clearTimeout(t);

    const lenis = new Lenis({
      lerp: 0.1,
      // Let an inner box scroll natively only when it actually has
      // something to scroll; otherwise the page keeps scrolling.
      prevent: (node: HTMLElement) => {
        const box = node.closest?.("[data-scroll-box]") as HTMLElement | null;
        return !!box && box.scrollHeight > box.clientHeight + 1;
      },
    });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}

/* A small mono tag that trails the pointer and reads `data-cursor` off
   whatever is under it; re-read every frame so labels can change while
   the pointer is still. */
export function Cursor() {
  const box = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let x = -100,
      y = -100,
      cx = x,
      cy = y,
      raf = 0,
      current: string | null = null;
    let target: Element | null = null;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      target = e.target instanceof Element ? e.target.closest("[data-cursor]") : null;
    };
    const leave = () => (target = null);
    const loop = () => {
      cx += (x - cx) * 0.3;
      cy += (y - cy) * 0.3;
      if (box.current) box.current.style.transform = `translate3d(${cx + 16}px, ${cy + 16}px, 0)`;
      const next = target ? target.getAttribute("data-cursor") || null : null;
      if (next !== current) {
        current = next;
        setLabel(next);
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={box} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ transform: "translate3d(-200px,-200px,0)" }}>
      <span
        className={`label flex items-center gap-1.5 rounded-[4px] bg-ink px-2 py-1 text-[10.5px] text-bone transition-[opacity,transform] duration-200 ${
          label ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <span className="h-[5px] w-[5px] bg-signal" />
        {label ?? ""}
      </span>
    </div>
  );
}
