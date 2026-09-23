"use client";

import { useState } from "react";
import { faq, profile } from "@/lib/content";
import { scrollToId } from "@/lib/motion";
import { LinkedButtons, SectionHead } from "./primitives";

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="wrap border-t border-rule py-28 md:py-36">
      <div className="grid grid-cols-1 gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-10 md:sticky md:top-28 md:self-start">
          <SectionHead n="08" label="Questions" title={["Before you", "reach out."]} />
          <LinkedButtons
            left={{ label: "Write", href: `mailto:${profile.email}` }}
            right={{ label: "To me", dot: true, onClick: () => scrollToId("contact") }}
          />
        </div>

        <ul className="border-t border-ink">
          {faq.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className="border-b border-rule">
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="group flex w-full items-center gap-5 py-5 text-left">
                  <span className="label w-10 shrink-0 text-mute-2">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-[clamp(18px,1.7vw,22px)] tracking-[-0.015em] transition-colors group-hover:text-mute">{f.q}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[16px] transition-colors duration-300 ${
                      isOpen ? "bg-signal text-ink" : "bg-ink text-bone"
                    }`}
                  >
                    <span className={`transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden">
                    <p className="max-w-[620px] pb-6 pl-[60px] text-[16px] leading-[1.65] text-ink/70">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
