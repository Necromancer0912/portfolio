"use client";

import { papers } from "@/lib/content";
import { Odometer, Reveal, SectionHead } from "./primitives";

export function Papers() {
  return (
    <section id="papers" className="py-28 md:py-36">
      <div className="wrap">
        <SectionHead
          n="05"
          label="Papers"
          title={["Research, written", "with good co-authors."]}
          aside="Applied deep learning, written with co-authors and mentors who taught me most of what I know about research."
        />
      </div>

      <ol className="mt-16 border-t border-ink">
        {papers.map((p, i) => {
          const me = "Das, S.";
          const others = p.authors.slice(me.length);
          const body = (
            <div className="wrap grid gap-3 py-8 md:grid-cols-[110px_minmax(0,1fr)_260px] md:gap-8">
              <p className="label pt-1.5 opacity-60">{p.year}</p>
              <div>
                <h3 className="display max-w-[820px] text-[clamp(21px,2vw,29px)] leading-[1.22]">{p.title}</h3>
                <p className="label mt-3 opacity-60">
                  <strong className="font-medium">{me}</strong>
                  {others}
                </p>
              </div>
              <p className="label flex items-start justify-between gap-4 pt-1.5 md:justify-end md:text-right">
                <Odometer text={p.venue} />
                {p.link && <span> ↗</span>}
              </p>
            </div>
          );
          return (
            <Reveal as="li" key={p.title} delay={i * 80} className="border-b border-rule">
              {p.link ? (
                <a href={p.link} target="_blank" rel="noreferrer" className="odo-host sweep block" data-cursor="Code">
                  {body}
                </a>
              ) : (
                <div className="sweep">{body}</div>
              )}
            </Reveal>
          );
        })}
      </ol>
      <p className="wrap label mt-8 text-mute">Along the way: GATE CSE and GATE DA, 2024 and 2025.</p>
    </section>
  );
}
