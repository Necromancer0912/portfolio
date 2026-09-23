"use client";

import { useState, type ReactNode } from "react";
import type { Assets } from "@/lib/assets";
import { profile } from "@/lib/content";
import { PATTERNS } from "@/lib/patterns";
import { scrollToId } from "@/lib/motion";
import { LinkedButtons, RollLink } from "./primitives";
import { Swarm } from "./swarm";

/* A small picture set inside the headline, like a word: the transparent
   image on its own, or, without one, a drawn icon in a dark pill. */
function Pill({ src, alt, delay, children }: { src: string | null; alt: string; delay: number; children: ReactNode }) {
  return (
    <span
      className={`pill relative mx-[0.08em] inline-flex items-center justify-center ${
        src ? "mx-[0.16em] h-[0.9em] align-[-0.1em]" : "h-[0.74em] w-[1.24em] overflow-hidden rounded-full bg-ink align-[-0.02em]"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      role="img"
      aria-label={alt}
    >
      {src ? <img src={src} alt="" className="h-full w-auto drop-shadow-[0_0.04em_0.05em_rgb(35_35_35/0.25)]" draggable={false} /> : children}
    </span>
  );
}


export function Hero({ assets }: { assets: Assets }) {
  const [word, setWord] = useState<{ i: number; w: string }>({ i: 0, w: PATTERNS[0].name });
  return (
    <section id="top" data-hero className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
      <div className="wrap flex flex-col justify-between gap-14 pb-10 pt-24 lg:pr-12 lg:pt-28">
        <span aria-hidden />

        <div>
          <p className="hero-in label label-lg text-ink">M.Tech CSE at IIIT Delhi. Speech, networks, retrieval.</p>
          <h1 className="t-hero mt-6">
            <span className="hero-in block" style={{ transitionDelay: "120ms" }}>
              Models that
              <Pill src={assets.listen} alt="headphones" delay={520}>
                <span className="eq flex items-center gap-[3px] text-signal">
                  {[8, 15, 10, 17, 9].map((h, i) => (
                    <i key={i} style={{ height: h, animationDelay: `${i * -0.15}s` }} />
                  ))}
                </span>
              </Pill>
              listen.
            </span>
            <span className="hero-in block" style={{ transitionDelay: "240ms" }}>
              Packets that
              <Pill src={assets.arrive} alt="an envelope" delay={660}>
                <svg viewBox="0 0 40 24" className="h-[55%] text-bone" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="9" y="4" width="22" height="16" rx="2" />
                  <path d="M9 5l11 8 11-8" />
                </svg>
              </Pill>
              arrive.
            </span>
          </h1>
          <p className="hero-in t-lead mt-7 max-w-[520px] text-ink/65" style={{ transitionDelay: "380ms" }}>
            {profile.intro}
          </p>
          <div className="hero-in mt-9 flex flex-wrap items-center gap-3" style={{ transitionDelay: "460ms" }}>
            <LinkedButtons
              left={{ label: "See", onClick: () => scrollToId("work") }}
              right={{ label: "The work", dot: true, onClick: () => scrollToId("work") }}
            />
            <RollLink href={profile.resume} external label="Résumé ↗" className="ghost" />
          </div>
        </div>


        <button
          onClick={() => scrollToId("about")}
          className="hero-in label label-lg self-start text-mute transition-colors hover:text-ink"
          style={{ transitionDelay: "540ms" }}
        >
          Scroll ↓
        </button>
      </div>

      <div className="group relative min-h-[70svh] overflow-hidden bg-ink lg:min-h-0">
        <Swarm onWord={(i, w) => setWord({ i, w })} />
        <div className="label pointer-events-none absolute inset-x-6 bottom-6 flex items-end justify-between gap-6 text-dim">
          <span>
            <span className="sm:hidden">Hold. Let go.</span>
            <span className="hidden sm:inline">Press and hold. Let go.</span>
          </span>
          <span className="flex items-center gap-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="text-faint">{String(word.i + 1).padStart(2, "0")} / {String(PATTERNS.length).padStart(2, "0")}</span>
            <span className="text-bone">{PATTERNS[word.i].note}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
