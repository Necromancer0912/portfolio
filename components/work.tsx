"use client";

import { useEffect, useState, type ReactNode } from "react";
import { archive, GITHUB_USER, projects, type ArchiveKind, type Project } from "@/lib/content";
import { scrollToId } from "@/lib/motion";
import { Figure } from "./diagrams";
import { Odometer, Reveal, RollLink, RollOnView, SectionHead } from "./primitives";

/* The one number a project produced, stated plainly in a quiet box:
   no strike-through, no highlight, just what was measured. */
function Result({ m }: { m: Project["metric"] }) {
  return (
    <div className="rounded-[10px] bg-bone-2 px-5 py-4">
      <p className="label text-mute">Result</p>
      <p className="mt-1.5 text-[21px] font-medium tabular-nums tracking-[-0.015em] text-ink">
        {m.before && (
          <>
            {m.before} <span className="text-mute">→</span>{" "}
          </>
        )}
        <RollOnView text={m.after} />
      </p>
      <p className="mt-1 text-[14.5px] leading-[1.45] text-ink/75">{m.label}</p>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-rule bg-bone px-3 py-1 text-[12.5px] leading-none text-ink/85">{children}</span>;
}

/* One project as a card from a lab notebook: the story at a comfortable
   reading width, a margin column with the result and tools, and the live
   figure across the foot. Every line at full reading contrast. */
function Card({ p, cover }: { p: Project; cover?: string }) {
  return (
    <article
      id={`p-${p.n}`}
      data-project={p.n}
      className="scroll-mt-28 rounded-[18px] border border-rule bg-card p-6 transition-colors duration-500 hover:border-mute-2 sm:p-8 lg:p-10"
    >
      <div className="flex items-center gap-4">
        {cover && <img src={cover} alt="" className="h-12 w-12 rounded-[10px] bg-bone-2 object-cover" />}
        <span className="num text-[15px] text-ink">{p.n}</span>
        <span className="h-px flex-1 bg-rule" />
        <span className="label hidden text-mute sm:inline">{p.period}</span>
      </div>
      <h3 className="display mt-6 text-[clamp(26px,2.6vw,38px)] leading-[1.12] tracking-[-0.02em] text-ink">{p.title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip>
          <span className="sm:hidden">{p.period} · </span>
          {p.team ? `Team of ${p.team}` : "Solo"}
        </Chip>
        {p.guide && <Chip>Guided by {p.guide}</Chip>}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_260px] md:gap-12">
        <div className="min-w-0 max-w-[660px]">
          <p className="text-[17.5px] leading-[1.6] text-ink">{p.summary}</p>
          <p className="label mt-8 text-mute">What I took away</p>
          <ul className="mt-3 space-y-3.5">
            {p.detail.map((d) => (
              <li key={d} className="grid grid-cols-[18px_minmax(0,1fr)] text-[15.5px] leading-[1.62] text-ink/85">
                <span className="mt-[9px] h-[6px] w-[6px] bg-signal ring-1 ring-ink/15" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <aside className="min-w-0 md:border-l md:border-rule md:pl-8">
          <Result m={p.metric} />
          <p className="label mt-7 text-mute">Made with</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {p.stack.map((t) => (
              <li key={t} className="label rounded-[5px] bg-bone-2 px-2 py-1 text-[11px] text-ink/80">
                {t}
              </li>
            ))}
          </ul>
          {p.repo && <RollLink href={p.repo} external label="Source ↗" className="ghost mt-7 h-10" />}
        </aside>
      </div>

      <div className="mt-10 min-w-0 [&>div]:mt-0">
        <Figure n={p.n} kind={p.diagram} />
      </div>
    </article>
  );
}

/* Contents rail: every project by name, the one in view marked. */
function Rail({ active }: { active: string }) {
  return (
    <nav aria-label="Projects" className="sticky top-28 hidden self-start lg:block">
      <p className="label text-mute">Projects</p>
      <ol className="mt-4 border-l border-rule">
        {projects.map((p) => {
          const on = p.n === active;
          return (
            <li key={p.n}>
              <a
                href={`#p-${p.n}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(`p-${p.n}`);
                }}
                className={`-ml-px grid grid-cols-[34px_minmax(0,1fr)] border-l-2 py-2 pl-4 pr-2 text-[14px] leading-[1.35] transition-colors duration-300 ${
                  on ? "border-ink text-ink" : "border-transparent text-mute hover:text-ink"
                }`}
              >
                <span className="num text-[12px] opacity-70">{p.n}</span>
                <span>{p.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <a
        href="#archive"
        onClick={(e) => {
          e.preventDefault();
          scrollToId("archive");
        }}
        className="label mt-6 inline-block text-mute transition-colors hover:text-ink"
      >
        The archive ↓
      </a>
    </nav>
  );
}

const FILTERS: { id: "all" | ArchiveKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ml", label: "ML / NLP" },
  { id: "systems", label: "Systems" },
  { id: "web", label: "Web" },
];

function Archive() {
  const [filter, setFilter] = useState<"all" | ArchiveKind>("all");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const rows = archive.filter(
    (a) => (filter === "all" || a.kind === filter) && (!needle || `${a.name} ${a.note}`.toLowerCase().includes(needle)),
  );
  const shown = open || needle ? rows : rows.slice(0, 8);

  return (
    <div id="archive" className="scroll-mt-28 pt-20">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-5">
        <div>
          <h3 className="display t-h3">Everything else, the archive</h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? archive.length : archive.filter((a) => a.kind === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`odo-host label rounded-full px-3 py-1.5 transition-colors ${filter === f.id ? "bg-ink text-bone" : "bg-bone-2 text-mute hover:text-ink"}`}
              >
                <Odometer text={f.label} /> <span className="opacity-50">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
      <label className="flex items-center gap-4 border-b border-rule py-4">
        <span className="label text-mute">Search</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="bengali, nostd, pytorch…"
          className="min-w-0 flex-1 bg-transparent text-[18px] tracking-[-0.01em] outline-none placeholder:text-mute-2"
          aria-label="Search the archive"
        />
        <span className="label tabular-nums text-mute">{String(rows.length).padStart(2, "0")}</span>
      </label>
      <p className="mt-4 max-w-[560px] text-[15px] leading-[1.55] text-ink/75">
        Coursework, weekend experiments and the notebooks I learned on. Most are small; each taught me one thing.
      </p>

      <ul className="mt-6 border-t border-rule">
        {shown.map((a) => (
          <li key={a.repo} className="border-b border-rule">
            <a
              href={a.live ?? `https://github.com/${GITHUB_USER}/${a.repo}`}
              target="_blank"
              rel="noreferrer"
              data-cursor={a.live ? "Open" : "GitHub"}
              className="odo-host sweep grid grid-cols-[48px_minmax(0,1fr)_auto] items-baseline gap-4 px-2 py-3.5 sm:grid-cols-[56px_minmax(0,2fr)_minmax(0,3fr)_70px]"
            >
              <span className="label text-mute">{a.year}</span>
              <span className="text-[16px] tracking-[-0.01em]">
                <Odometer text={a.name} />
              </span>
              <span className="hidden text-[14px] text-ink/75 sm:block">{a.note}</span>
              <span className="label text-right text-mute">{a.kind === "ml" ? "ML" : a.kind === "web" ? "Web" : "Sys"} ↗</span>
            </a>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="label mt-5 text-mute">Nothing by that name — yet.</p>}
      {!needle && rows.length > 8 && (
        <button onClick={() => setOpen((o) => !o)} className="odo-host label mt-5 text-mute transition-colors hover:text-ink">
          <Odometer text={open ? "Show fewer ↑" : `Show all ${rows.length} ↓`} />
        </button>
      )}
    </div>
  );
}

export function Work({ covers }: { covers: Record<string, string> }) {
  const [active, setActive] = useState(projects[0].n);
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>("[data-project]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.project!);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section id="work" className="pb-28 pt-28 md:pt-36">
      <div className="wrap">
        <SectionHead
          n="03"
          label="Work"
          title={["Things I built", "to understand them."]}
          aside="Seven projects, most with a guide and a team. Each card says what we tried, what happened, and what I took from it."
        />
      </div>
      <div className="wrap mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Rail active={active} />
        <div className="min-w-0 space-y-6">
          {projects.map((p) => (
            <Reveal key={p.n}>
              <Card p={p} cover={covers[p.n]} />
            </Reveal>
          ))}
          <Reveal>
            <Archive />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
