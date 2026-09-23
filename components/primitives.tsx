"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { reducedMotion, useInView } from "@/lib/motion";

/* ------------------------------------------------------------------ */
/* Odometer text, built the way the reference builds it. Every letter is
   a 1em window over a column of six glyphs: the letter, four random
   stand-ins, and the letter again. The column's position is driven by a
   CSS variable, --odo (0 or 1):

     translateY(calc(var(--odo) * -5em)), 520ms, cubic-bezier(.23,1,.32,1)

   Going to 1 (hover in) rolls every letter forward through its stand-ins
   and lands on itself, staggered 28ms a letter. Going back to 0 (hover
   out) rolls them all back through the same glyphs, together, to the
   same letter. Any ancestor with .odo-host sets --odo: 1 on hover. The
   stand-ins are seeded from the text, so server and client agree. */

const POOL_A = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789";
const POOL_N = "0123456789";

function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function Odometer({ text, progress }: { text: string; progress?: number }) {
  const rnd = seeded(text);
  const letters = text.split("");
  return (
    <span className="odo" aria-label={text} style={progress === undefined ? undefined : ({ "--odo": progress } as CSSProperties)}>
      {letters.map((ch, i) => {
        if (ch === " ") return <span key={i} className="odo-space" aria-hidden>{"\u00a0"}</span>;
        // Letters roll through letters and digits; digits and symbols
        // (%, ×, ~, .) roll through digits, so a number rolls as a whole.
        const pool = /[A-Za-z]/.test(ch) ? POOL_A : POOL_N;
        const col = [ch, ...Array.from({ length: 4 }, () => pool[(rnd() * pool.length) | 0]), ch];
        return (
          <span key={i} className="odo-ch" aria-hidden>
            <span className="odo-ghost">{ch}</span>
            <span className="odo-col" style={{ "--i": i } as CSSProperties}>
              {col.map((g, j) => (
                <span key={j}>{g}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/* Rolls forward to the new text whenever it changes (the nav's
   current-section label): each new label mounts at rest, then rolls. */
function RollIn({ text }: { text: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return setP(1);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(() => setP(1))));
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, []);
  return <Odometer text={text} progress={p} />;
}

export function RollText({ text }: { text: string; trigger?: number }) {
  return <RollIn key={text} text={text} />;
}

/* Rolls forward once when it scrolls into view. Once that has played,
   it quietly resets (both ends of every reel show the same glyph, so the
   reset is invisible) and from then on behaves exactly like a button:
   hover rolls forward with the stagger, leaving rolls back. */
export function RollOnView({ text, className = "" }: { text: string; className?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.6);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setSettled(true), 520 + text.length * 28 + 120);
    return () => window.clearTimeout(t);
  }, [inView, text.length]);
  return (
    <span ref={ref} className={`odo-host ${className}`}>
      {settled ? <Odometer key="h" text={text} /> : <Odometer key="v" text={text} progress={inView ? 1 : 0} />}
    </span>
  );
}

/* A link whose label rolls on hover. */
export function RollLink({ href, label, className = "", external = false }: { href: string; label: string; className?: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`odo-host ${className}`}
    >
      <Odometer text={label} />
    </a>
  );
}

type Action = { label: string; href?: string; onClick?: () => void; dot?: boolean; external?: boolean };

/* Two buttons joined by a bridge. Hovering either darkens the pair and
   rolls both labels. */
export function LinkedButtons({ left, right, tone = "dark" }: { left: Action; right: Action; tone?: "dark" | "light" }) {
  const one = (a: Action) => {
    const inner = <Odometer text={a.label} />;
    const props = { className: "lb", "data-dot": a.dot ? "" : undefined };
    return a.href ? (
      <a {...props} href={a.href} target={a.external ? "_blank" : undefined} rel={a.external ? "noreferrer" : undefined}>
        {inner}
      </a>
    ) : (
      <button {...props} onClick={a.onClick}>
        {inner}
      </button>
    );
  };
  // The bridge sits on the seam: measured once the left button has laid out.
  const first = useRef<HTMLSpanElement>(null);
  const [seam, setSeam] = useState<number | null>(null);
  useEffect(() => {
    const el = first.current?.firstElementChild as HTMLElement | null;
    if (!el) return;
    const measure = () => setSeam(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span
      ref={first}
      className={`linked odo-host ${tone === "light" ? "light" : ""}`}
      style={{ "--seam": `${seam ?? 0}px` } as CSSProperties}
    >
      {one(left)}
      {seam !== null && <span className="bridge" aria-hidden />}
      {one(right)}
    </span>
  );
}

export function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLElement>(0.15);
  return (
    <Tag ref={ref} className={`reveal ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </Tag>
  );
}

export function Lines({ lines, className = "", stagger = 90 }: { lines: ReactNode[]; className?: string; stagger?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.3);
  return (
    <span ref={ref} className={`block ${inView ? "is-in" : ""} ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="mask">
          <span style={{ transitionDelay: `${i * stagger}ms` }}>{l}</span>
        </span>
      ))}
    </span>
  );
}

/* Section header, as in the reference: a small mono label with the
   section number, then the heading. */
export function SectionHead({
  n,
  label,
  title,
  aside,
  dark = false,
}: {
  n: string;
  label: string;
  title: ReactNode[];
  aside?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="w-full">
      <p className={`label flex items-center gap-3 ${dark ? "text-dim" : "text-mute"}`}>
        <span className="inline-block h-[7px] w-[7px] bg-signal" />
        <span>{n}</span>
        <span className={dark ? "text-bone" : "text-ink"}>{label}</span>
      </p>
      <div className={`mt-6 grid grid-cols-1 items-end gap-6 ${aside ? "md:grid-cols-[minmax(0,1fr)_minmax(0,360px)]" : ""}`}>
        <h2 className="display t-h2 max-w-[820px]">
          <Lines lines={title} />
        </h2>
        {aside && <p className={`max-w-[420px] text-[16px] leading-[1.5] ${dark ? "text-bone/60" : "text-ink/60"}`}>{aside}</p>}
      </div>
    </div>
  );
}
