"use client";

import { useEffect, useRef } from "react";
import { domains } from "@/lib/content";
import { reducedMotion } from "@/lib/motion";
import { Lately } from "./lately";
import { Reveal, SectionHead } from "./primitives";

const STATEMENT =
  "I'm drawn to the parts of the stack that are easy to ignore until they break. The decoder that mishears a sentence that switches languages halfway. The packet that goes missing at one percent loss. The query a chatbot should never be allowed to run.";

/* Words brighten one at a time as the paragraph scrolls through. */
function ScrollWords({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-w]"));
    if (reducedMotion()) {
      words.forEach((w) => (w.style.opacity = "1"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const b = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - b.top) / (b.height + vh * 0.35)));
      const lit = p * words.length;
      words.forEach((w, i) => (w.style.opacity = String(0.16 + 0.84 * Math.min(1, Math.max(0, lit - i)))));
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
  }, []);
  return (
    <p ref={ref} className="display max-w-[1000px] text-[clamp(28px,3.4vw,54px)] leading-[1.12]">
      {text.split(" ").map((w, i) => (
        <span key={i} data-w style={{ opacity: 0.16 }}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

export function About() {
  return (
    <section id="about" className="relative bg-ink py-28 text-bone md:py-40">
      <div className="wrap">
        <SectionHead n="01" label="About" title={["Where I've", "been poking."]} dark />
        <div className="mt-16">
          <ScrollWords text={STATEMENT} />
        </div>

        <Lately />

        <div className="mt-28 grid gap-px overflow-hidden rounded-[10px] border border-rule-ink bg-rule-ink sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((d, i) => (
            <Reveal key={d.n} delay={i * 90} className="group flex flex-col bg-ink p-7 transition-colors duration-500 hover:bg-ink-2">
              <div className="flex items-center justify-between">
                <p className="label text-dim">{d.n}</p>
                <span className="h-[7px] w-[7px] bg-faint transition-colors duration-300 group-hover:bg-signal" />
              </div>
              <h3 className="mt-14 text-[24px] font-medium tracking-[-0.02em]">{d.title}</h3>
              <p className="mt-3 flex-1 text-[14.5px] leading-[1.6] text-bone/60">{d.body}</p>
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {d.tags.map((t) => (
                  <li key={t} className="label rounded-[4px] border border-rule-ink px-1.5 py-0.5 text-[10.5px] text-dim">
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
