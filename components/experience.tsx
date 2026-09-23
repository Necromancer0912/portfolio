"use client";

import { experience } from "@/lib/content";
import { Reveal, SectionHead } from "./primitives";

export function Experience() {
  return (
    <section id="experience" className="wrap py-28 md:py-36">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <SectionHead n="02" label="Experience" title={["Where I've", "been learning."]} />
          <p className="mt-8 max-w-[400px] text-[16px] leading-[1.6] text-ink/65">
            One internship and two semesters of teaching. The internship is the first place I saw my code used by people who
            weren&apos;t grading it.
          </p>
        </div>

        <ol className="border-t border-ink">
          {experience.map((e, i) => (
            <Reveal as="li" key={e.role} delay={i * 80} className="border-b border-rule">
              <div className="grid gap-3 py-8 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-8">
                <p className="label flex items-start gap-2 pt-1.5 text-mute">
                  {i === 0 && <span className="mt-[5px] h-[6px] w-[6px] shrink-0 bg-signal" />}
                  {e.period}
                </p>
                <div>
                  <h3 className="text-[22px] font-medium tracking-[-0.02em]">{e.role}</h3>
                  <p className="label mt-1 text-mute">{e.org}</p>
                  {e.points.length > 0 && (
                    <ul className="mt-5 space-y-3">
                      {e.points.map((p, j) => (
                        <li key={p} className="grid grid-cols-[28px_minmax(0,1fr)] text-[15px] leading-[1.6] text-ink/70">
                          <span className="label pt-[3px] text-mute-2">{String(j + 1).padStart(2, "0")}</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
