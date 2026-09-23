"use client";

import { useEffect, useRef, useState } from "react";
import { archive, papers, profile, projects } from "@/lib/content";
import { scrollToId } from "@/lib/motion";
import { Odometer, RollText } from "./primitives";

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "results", label: "Notes" },
  { id: "papers", label: "Papers" },
  { id: "education", label: "Education" },
  { id: "shell", label: "Shell" },
  { id: "faq", label: "Questions" },
  { id: "contact", label: "Contact" },
];

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);
  return <span>{now ?? "--:--"}</span>;
}

function IndexPanel({ open, active, onClose }: { open: boolean; active: string; onClose: () => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const go = (id: string) => {
    onClose();
    window.setTimeout(() => scrollToId(id), 350);
  };
  return (
    <div
      className="index-panel fixed inset-0 z-40 overflow-y-auto bg-ink text-bone"
      data-open={open}
      aria-hidden={!open}
      data-lenis-prevent
    >
      <div className="wrap grid min-h-full grid-cols-1 gap-12 pb-12 pt-24 md:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <ol onMouseLeave={() => setHover(null)}>
          {SECTIONS.slice(1).map((s, i) => {
            const dim = hover !== null && hover !== s.id;
            return (
              <li key={s.id} className="row border-b border-rule-ink" style={{ transitionDelay: open ? `${120 + i * 45}ms` : "0ms" }}>
                <button
                  tabIndex={open ? 0 : -1}
                  onClick={() => go(s.id)}
                  onMouseEnter={() => setHover(s.id)}
                  className={`odo-host flex w-full items-baseline gap-6 py-2 text-left transition-opacity duration-300 ${dim ? "opacity-25" : "opacity-100"}`}
                >
                  <span className="num w-10 shrink-0 text-dim">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-[clamp(34px,min(5vw,7.4vh),76px)] leading-[1.02]">
                    <Odometer text={s.label} />
                  </span>
                  {active === s.id && <span className="label ml-auto self-center text-signal">You are here</span>}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="row flex flex-col justify-end gap-10 md:pb-4" style={{ transitionDelay: open ? "420ms" : "0ms" }}>
          <div>
            <p className="label text-dim">Write</p>
            <a href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1} className="odo-host mt-2 block text-[20px] tracking-[-0.02em] hover:text-signal">
              <Odometer text={profile.email} />
            </a>
          </div>
          <div className="label space-y-1.5 text-dim">
            <a href={profile.github} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} className="odo-host block hover:text-bone">
              <Odometer text="GitHub ↗" />
            </a>
            <a href={profile.resume} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} className="odo-host block hover:text-bone">
              <Odometer text="Résumé ↗" />
            </a>
          </div>
          <p className="label text-faint">
            New Delhi · <Clock /> IST
          </p>
        </div>
      </div>
    </div>
  );
}

/* Links shown in the island; the Index overlay lists every section. */
const LINKS = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "results", label: "Notes" },
  { id: "papers", label: "Papers" },
  { id: "shell", label: "Shell" },
  { id: "contact", label: "Contact" },
];

/* The line in the strip under the island: where you are, in a sentence. */
const CONTEXT: Record<string, string> = {
  top: "Models that listen, packets that arrive",
  about: "Where I've been poking",
  experience: "One internship, two semesters teaching",
  work: `${projects.length} projects, ${archive.length} more in the archive`,
  results: "Notes from the bench",
  papers: `${papers.length} papers, written with good co-authors`,
  education: "M.Tech at IIIT Delhi, B.Tech before it",
  shell: "A real prompt — try cat 002",
  faq: "Before you reach out",
  contact: "Say hello",
};

/* A 3×3 grid of pixels with one signal packet hopping between cells. */
function Mark() {
  return (
    <span className="mark-grid" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} />
      ))}
      <b />
    </span>
  );
}

/* Floating island. A dark pill holds the mark, the section links and an
   Index button; a highlight slides under whichever link is hovered (or
   the current one) on a spring. Under it, a bone strip says where you
   are and fills with scroll progress. Scrolling down folds the links
   away, leaving mark · current section · Index; hovering or scrolling
   up unfolds it again. */
export function Nav() {
  const [active, setActive] = useState("top");
  const [compact, setCompact] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));

    let raf = 0,
      lastY = window.scrollY;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      if (Math.abs(y - lastY) > 8) {
        setCompact(y > lastY && y > 240);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Lock scrolling while the index is open; Escape closes it.
  useEffect(() => {
    const l = window.__lenis;
    if (open) l?.stop();
    else l?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  const folded = compact && !hovering && !open;
  const linkActive = LINKS.some((l) => l.id === active) ? active : null;
  const target = hot ?? linkActive;

  // Slide the highlight under the target link.
  useEffect(() => {
    const place = () => {
      const r = row.current,
        p = pill.current;
      if (!r || !p) return;
      const el = target ? r.querySelector<HTMLElement>(`[data-link="${target}"]`) : null;
      if (!el || folded) {
        p.style.opacity = "0";
        return;
      }
      p.style.opacity = "1";
      p.style.transform = `translateX(${el.offsetLeft}px)`;
      p.style.width = `${el.offsetWidth}px`;
    };
    place();
    const t = window.setTimeout(place, 480); // after the fold animation settles
    window.addEventListener("resize", place);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", place);
    };
  }, [target, folded]);

  const idx = SECTIONS.findIndex((s) => s.id === active);
  const current = SECTIONS[Math.max(0, idx)];

  return (
    <>
      <IndexPanel open={open} active={active} onClose={() => setOpen(false)} />
      <header
        className="fixed left-1/2 top-3 z-50 w-[calc(100vw-24px)] -translate-x-1/2 md:w-max md:max-w-[calc(100vw-20px)]"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false);
          setHot(null);
        }}
      >
        <div className="island rounded-[14px] bg-ink p-1.5 text-bone shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)] ring-1 ring-white/5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => (setOpen(false), scrollToId("top"))}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-ink-3 transition-colors hover:bg-[#333]"
              aria-label="Back to top"
              data-cursor="Top"
            >
              <Mark />
            </button>

            {/* links (folded away while scrolling down) */}
            <div className="fold hidden md:grid" data-folded={folded}>
              <div ref={row} className="relative flex items-center overflow-hidden" onMouseLeave={() => setHot(null)}>
                <span ref={pill} className="island-pill absolute left-0 top-0 h-9 rounded-[9px] bg-ink-3" aria-hidden />
                {LINKS.map((l) => (
                  <button
                    key={l.id}
                    data-link={l.id}
                    onMouseEnter={() => setHot(l.id)}
                    onClick={() => scrollToId(l.id)}
                    className={`odo-host label relative h-9 shrink-0 px-3.5 transition-colors ${
                      l.id === linkActive ? "text-bone" : "text-dim hover:text-bone"
                    }`}
                  >
                    <Odometer text={l.label} />
                    {l.id === "contact" && <span className="absolute right-1.5 top-2 h-[5px] w-[5px] rounded-full bg-signal" />}
                  </button>
                ))}
              </div>
            </div>

            {/* current section: always on phones; on desktop only while folded */}
            <p className="label flex h-9 flex-1 items-center gap-2 whitespace-nowrap px-3 text-bone md:hidden">
              <span className="h-[6px] w-[6px] shrink-0 bg-signal" />
              <RollText text={current.label} />
            </p>
            <div className="fold hidden md:grid" data-folded={!folded}>
              <p className="label flex h-9 items-center gap-2 overflow-hidden whitespace-nowrap px-3.5 text-bone">
                <span className="h-[6px] w-[6px] shrink-0 bg-signal" />
                <RollText text={current.label} />
              </p>
            </div>

            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? "Close index" : "Open index"}
              className="odo-host label ml-1 flex h-9 shrink-0 items-center gap-2.5 rounded-[9px] bg-bone px-3.5 text-ink transition-colors hover:bg-signal"
            >
              <Odometer text={open ? "Close" : "Index"} />
              <span className="burger relative flex h-[8px] w-[16px] flex-col justify-between" data-open={open}>
                <span className="block h-[1.5px] w-full bg-current" />
                <span className="block h-[1.5px] w-2/3 self-end bg-current" />
              </span>
            </button>
          </div>

          {/* strip: where you are + scroll progress */}
          <div className="fold grid" data-folded={folded}>
            <div className="overflow-hidden">
              <div className="relative mt-1.5 flex h-7 items-center justify-between gap-6 overflow-hidden rounded-[8px] bg-bone-2 px-3 text-ink">
                <span className="label flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-[11px] [mask-image:linear-gradient(90deg,#000_85%,transparent)] sm:[mask-image:none]">
                  <RollText text={CONTEXT[current.id] ?? current.label} />
                </span>
                <span className="label hidden whitespace-nowrap text-[11px] text-mute sm:inline">
                  Delhi <Clock />
                </span>
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-ink/10">
                  <span ref={bar} className="block h-full origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
