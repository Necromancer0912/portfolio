"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/motion";

/* An interlude: a drawing of my desk, seen first through a small rounded
   window that opens up to the full page as you scroll. The section is
   tall; the window is sticky inside it, and scroll progress drives its
   width, height and corner radius. Only rendered when the image exists. */
export function Desk({ src }: { src: string }) {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const caption = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = section.current!;
    const f = frame.current!;
    const still = reducedMotion();
    let raf = 0;

    const update = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height - vh;
      const p = still ? 1 : Math.min(1, Math.max(0, -r.top / (total * 0.7)));
      const e = 1 - Math.pow(1 - p, 3);
      const vw = window.innerWidth;
      const w0 = Math.min(820, vw * 0.86),
        h0 = Math.min(480, vh * 0.55);
      f.style.width = `${w0 + (vw - w0) * e}px`;
      f.style.height = `${h0 + (vh - h0) * e}px`;
      f.style.borderRadius = `${28 * (1 - e)}px`;
      if (img.current) img.current.style.transform = `scale(${1.25 - 0.25 * e})`;
      if (caption.current) caption.current.style.opacity = String(Math.max(0, (p - 0.75) / 0.25));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={section} aria-label="My desk" className="relative h-[170vh]">
      <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden">
        <p className="label absolute left-[var(--gutter)] top-[16vh] flex items-center gap-3 text-mute">
          <span className="h-[7px] w-[7px] bg-signal" /> Meanwhile, at the desk
        </p>
        <div ref={frame} className="relative overflow-hidden shadow-[0_30px_60px_-30px_rgb(30_29_27/0.5)]">
          <img ref={img} src={src} alt="An illustration of my desk: laptop with a terminal, a sketchbook, a cup of chai and a tangle of cables" className="absolute inset-0 h-full w-full object-cover will-change-transform" />
          <div ref={caption} className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-ink/75 to-transparent p-[var(--gutter)] pt-24 text-bone opacity-0">
            <p className="display max-w-[640px] text-[clamp(26px,3vw,44px)] leading-[1.1]">
              Most of this was built here, usually after midnight.
            </p>
            <p className="label hidden text-bone/70 sm:block">Fig. — the desk, roughly to scale</p>
          </div>
        </div>
      </div>
    </section>
  );
}
