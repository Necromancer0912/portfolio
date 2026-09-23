"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { results } from "@/lib/content";
import { reducedMotion, useInView } from "@/lib/motion";
import { SectionHead } from "./primitives";

const HOLD_MS = 6500;

/* One sentence per project, typed out; neighbours wait dimmed at the
   side. The dark sheet arrives at an angle and levels as it settles. */
export function Notes() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [paused, setPaused] = useState(false);
  const [section, inView] = useInView<HTMLElement>(0.3);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hold = useRef(0);
  const [step, setStep] = useState(0);

  const text = results[index].text;
  const done = typed >= text.length;

  const setHold = (p: number) => {
    hold.current = p;
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
  };
  const go = (d: number) => {
    setHold(0);
    setIndex((i) => (i + d + results.length) % results.length);
  };

  useLayoutEffect(() => {
    const measure = () => {
      const first = track.current?.children[0] as HTMLElement | undefined;
      if (first) setStep(first.offsetWidth + 16);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Angled entrance.
  useEffect(() => {
    const el = section.current;
    if (!el || reducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.8)));
      el.style.clipPath = `polygon(0 ${(1 - p) * 120}px, 100% 0, 100% 100%, 0 100%)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [section]);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion()) return setTyped(text.length);
    setTyped(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= text.length) window.clearInterval(id);
    }, 24);
    return () => window.clearInterval(id);
  }, [index, inView, text.length]);

  useEffect(() => {
    if (!done || paused || !inView) return;
    const start = performance.now() - hold.current * HOLD_MS;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / HOLD_MS);
      setHold(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else go(1);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, paused, inView, index]);

  return (
    <section id="results" ref={section} className="overflow-hidden bg-ink py-28 text-bone md:py-40">
      <div className="wrap">
        <SectionHead
          n="04"
          label="Notes"
          title={["Notes from", "the bench."]}
          aside="Short notes from projects where the number surprised me."
          dark
        />
      </div>

      <div className="wrap mt-16" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div
          ref={track}
          className="flex gap-4 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(${-index * step}px)` }}
        >
          {results.map((r, i) => {
            const active = i === index;
            return (
              <button
                key={r.n}
                onClick={() => !active && (setHold(0), setIndex(i))}
                data-cursor={active ? "" : "Read"}
                className={`flex min-h-[280px] w-[min(760px,86vw)] shrink-0 flex-col justify-between rounded-[12px] border p-8 text-left transition-[opacity,border-color] duration-700 md:min-h-[320px] md:p-10 ${
                  active ? "border-rule-ink bg-ink-2 opacity-100" : "border-transparent bg-ink-2/60 opacity-25 hover:opacity-45"
                }`}
              >
                <p className="text-[clamp(24px,2.6vw,40px)] leading-[1.15] tracking-[-0.005em]">
                  {active ? text.slice(0, typed) : r.text}
                  {active && !done && <span className="caret text-signal" />}
                </p>
                <div className="mt-10 flex items-center gap-3">
                  <span className="label rounded-[4px] bg-ink-3 px-2 py-1 text-dim">{r.n}</span>
                  <span className="label text-dim">{r.tag}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-5">
          <div className="label flex items-center gap-1 tnum">
            <button onClick={() => go(-1)} className="px-2 py-1 text-dim hover:text-bone" aria-label="Previous">
              ←
            </button>
            <span className="tabular-nums text-dim">
              <span className="text-bone">{String(index + 1).padStart(2, "0")}</span> / {String(results.length).padStart(2, "0")}
            </span>
            <button onClick={() => go(1)} className="px-2 py-1 text-dim hover:text-bone" aria-label="Next">
              →
            </button>
          </div>
          <div className="h-px max-w-[240px] flex-1 bg-rule-ink">
            <div ref={bar} className="h-full origin-left bg-signal" style={{ transform: "scaleX(0)" }} />
          </div>
          <span className="label text-faint">{paused ? "Paused" : done ? "Next shortly" : "Typing"}</span>
        </div>
      </div>
    </section>
  );
}
