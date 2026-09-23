"use client";

import { degrees, schooling } from "@/lib/content";
import { Reveal, SectionHead } from "./primitives";

export function Education() {
  return (
    <section id="education" className="wrap py-28 md:py-36">
      <SectionHead n="06" label="Education" title={["The formal", "part."]} />

      <div className="mt-16 grid gap-3 md:grid-cols-2">
        {degrees.map((d, i) => (
          <Reveal key={d.tag} delay={i * 110}>
            <div className="group flex h-full flex-col justify-between rounded-[12px] bg-ink p-7 text-bone transition-colors duration-500 hover:bg-ink-2">
              <div className="flex items-center justify-between">
                <span className="label text-dim">{d.tag}</span>
                <span className="label flex items-center gap-2 text-dim">
                  {i === 0 && <span className="h-[6px] w-[6px] bg-signal" />}
                  {d.period}
                </span>
              </div>
              <p className="mt-16 text-[clamp(22px,2vw,28px)] font-medium leading-[1.2] tracking-[-0.02em]">{d.school}</p>
              <p className="label mt-6 border-t border-rule-ink pt-5 text-dim">
                {d.scoreNote} {d.score}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-3 grid gap-x-12 gap-y-2 rounded-[12px] border border-rule p-6 md:grid-cols-2">
        {schooling.map((s, i) => (
          <p key={s.board} className="label flex gap-4 text-ink">
            <span className="text-mute-2">{String(i + 1).padStart(3, "0")}</span>
            <span className="flex-1">
              {s.board} — {s.school}, {s.year}
            </span>
          </p>
        ))}
      </Reveal>
    </section>
  );
}
