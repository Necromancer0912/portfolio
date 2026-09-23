"use client";

import { useEffect, useRef, useState } from "react";

/* A list you read by scrolling. The line nearest the middle of the
   screen is lit; the rest wait in the dark. */

const ITEMS = [
  { text: "Tuning Whisper to hear two languages at once", note: "Bengali + English, on an 8 GB GPU" },
  { text: "Reading a transport spec until it makes sense", note: "Ultra Ethernet, SES and PDS" },
  { text: "Teaching a chatbot what it isn't allowed to do", note: "read-only SQL, no exceptions" },
  { text: "Watching packets cross a Kubernetes cluster", note: "four CNIs, a clean slate each" },
  { text: "Explaining pointers to first-years", note: "and, occasionally, to myself" },
  { text: "Drawing, away from the keyboard", note: "there's a sketchpad at the bottom" },
];

export function Lately() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-46% 0px -46% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="mt-32 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]">
      <div className="md:sticky md:top-[44vh] md:self-start">
        <p className="label text-dim">Lately, I&apos;ve been</p>
        <p className="label mt-2 tabular-nums text-bone">
          {String(active + 1).padStart(2, "0")}
          <span className="text-faint"> / {String(ITEMS.length).padStart(2, "0")}</span>
        </p>
      </div>
      <ol>
        {ITEMS.map((it, i) => {
          const on = i === active;
          return (
            <li
              key={it.text}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-i={i}
              className="grid grid-cols-[28px_minmax(0,1fr)] gap-4 border-t border-rule-ink py-6"
            >
              <span className={`mt-[0.55em] h-[9px] w-[9px] transition-colors duration-500 ${on ? "bg-signal" : "bg-faint"}`} />
              <div>
                <p className={`display text-[clamp(26px,3.3vw,50px)] leading-[1.05] transition-colors duration-500 ${on ? "text-bone" : "text-bone/20"}`}>
                  {it.text}
                </p>
                <p className={`label mt-3 text-dim transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`}>{it.note}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
