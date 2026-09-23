"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { archive, degrees, experience, papers, profile, projects, skills } from "@/lib/content";
import { reducedMotion, scrollToId, useInView } from "@/lib/motion";
import { SectionHead } from "./primitives";

type Line = { kind: "cmd" | "out" | "dim" | "err" | "hi"; text: string };

const PROMPT = "sayan@iiitd ~ %";

const COMMANDS: Record<string, string> = {
  help: "list commands",
  whoami: "the short version",
  ls: "list projects (ls -a for the archive)",
  cat: "cat <n> — read a project, e.g. cat 002",
  open: "open <n> — scroll the page to a project",
  papers: "publications",
  stack: "languages and tools",
  edu: "education",
  work: "experience",
  contact: "how to reach me",
  resume: "open the PDF",
  gh: "open GitHub",
  clear: "clear the screen",
};

function run(input: string): Line[] | "clear" {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const arg = args.join(" ");
  const find = (a: string) => projects.find((p) => p.n === a.padStart(3, "0"));

  switch (cmd) {
    case "":
      return [];
    case "help":
      return Object.entries(COMMANDS).map(([k, v]) => ({ kind: "out", text: `${k.padEnd(9)}${v}` }));
    case "whoami":
      return [
        { kind: "hi", text: "Sayan Das — M.Tech CSE student, IIIT Delhi" },
        { kind: "out", text: "Learning speech and language models, and the protocols under them." },
        { kind: "out", text: "Currently interning at Foodoscope. Draws when the code won't compile." },
        { kind: "dim", text: "try: ls, cat 001, papers, contact" },
      ];
    case "ls":
      if (arg === "-a")
        return archive.map((a) => ({ kind: "out" as const, text: `${a.year}  ${a.name.padEnd(32)}${a.note}` }));
      return [
        ...projects.map((p) => ({ kind: "out" as const, text: `${p.n}  ${p.title.padEnd(34)}${p.period}` })),
        { kind: "dim", text: `+ ${archive.length} smaller ones — ls -a` },
      ];
    case "cat": {
      const p = find(arg);
      if (!p) return [{ kind: "err", text: `cat: ${arg || "?"}: no such project — try ls` }];
      return [
        { kind: "hi", text: `${p.n} ${p.title}` },
        { kind: "out", text: p.summary },
        ...p.detail.map((d) => ({ kind: "out" as const, text: `— ${d}` })),
        { kind: "dim", text: `[${p.stack.join(" · ")}]${p.repo ? "  ·  open " + p.n + " to see it on the page" : ""}` },
      ];
    }
    case "open": {
      const p = find(arg);
      if (!p) return [{ kind: "err", text: `open: ${arg || "?"}: no such project` }];
      window.setTimeout(() => scrollToId(`p-${p.n}`), 250);
      return [{ kind: "dim", text: `scrolling to ${p.n} ${p.title}…` }];
    }
    case "papers":
      return papers.flatMap((p) => [
        { kind: "out" as const, text: `${p.year}  ${p.title}` },
        { kind: "dim" as const, text: `      ${p.venue}` },
      ]);
    case "stack":
      return [
        { kind: "out", text: `lang     ${skills.languages.join(", ")}` },
        { kind: "out", text: `ml       ${skills.ml.join(", ")}` },
        { kind: "out", text: `systems  ${skills.systems.join(", ")}` },
      ];
    case "edu":
      return degrees.map((d) => ({ kind: "out", text: `${d.tag.padEnd(14)}${d.score} ${d.scoreNote.padEnd(28)}${d.period}` }));
    case "work":
      return experience.map((e) => ({ kind: "out", text: `${e.period.padEnd(16)}${e.role} — ${e.org}` }));
    case "contact":
      return [
        { kind: "out", text: `mail    ${profile.email}` },
        { kind: "out", text: `mail    ${profile.instituteEmail}` },
        { kind: "out", text: `github  ${profile.github}` },
      ];
    case "resume":
      window.open(profile.resume, "_blank");
      return [{ kind: "dim", text: "opening résumé…" }];
    case "gh":
      window.open(profile.github, "_blank");
      return [{ kind: "dim", text: "opening github…" }];
    case "clear":
      return "clear";
    case "sudo":
      return [{ kind: "err", text: "nice try." }];
    case "exit":
      return [{ kind: "dim", text: "there is no leaving. scroll down instead." }];
    default:
      return [{ kind: "err", text: `zsh: command not found: ${cmd} — type help` }];
  }
}

const COLOR: Record<Line["kind"], string> = {
  cmd: "text-bone",
  out: "text-bone/80",
  dim: "text-dim italic",
  err: "text-[#e5705f]",
  hi: "text-bone font-medium",
};

export function Shell() {
  const [lines, setLines] = useState<Line[]>([{ kind: "dim", text: "Last login: today on ttys001 — type help" }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [booted, setBooted] = useState(false);
  const [wrap, inView] = useInView<HTMLDivElement>(0.4);
  const input = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);

  const exec = (cmd: string) => {
    const res = run(cmd);
    if (res === "clear") return setLines([]);
    setLines((l) => [...l, { kind: "cmd", text: cmd }, ...res]);
    if (cmd.trim()) setHistory((h) => [cmd, ...h]);
  };

  // Type `whoami` by itself the first time the terminal is seen.
  useEffect(() => {
    if (!inView || booted) return;
    setBooted(true);
    if (reducedMotion()) return exec("whoami");
    const word = "whoami";
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setValue(word.slice(0, i));
      if (i === word.length) {
        window.clearInterval(id);
        window.setTimeout(() => {
          setValue("");
          exec(word);
        }, 350);
      }
    }, 90);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => {
    const s = screen.current;
    if (s) s.scrollTop = s.scrollHeight;
  }, [lines]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(value);
      setValue("");
      setHIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(history.length - 1, hIdx + 1);
      if (n >= 0) {
        setHIdx(n);
        setValue(history[n]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = hIdx - 1;
      setHIdx(n);
      setValue(n >= 0 ? history[n] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const hit = Object.keys(COMMANDS).find((c) => c.startsWith(value) && value);
      if (hit) setValue(hit + (hit === "cat" || hit === "open" ? " " : ""));
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const quick = ["help", "ls", "cat 002", "papers", "stack", "contact"];

  return (
    <section id="shell" className="wrap py-28 md:py-36">
      <SectionHead
        n="07"
        label="Shell"
        title={["Or ask the", "terminal."]}
        aside="A real prompt. Tab completes, arrows walk history, ctrl-L clears."
      />

      <div ref={wrap} className="mt-14 overflow-hidden rounded-[12px] bg-ink text-bone shadow-[0_40px_80px_-50px_rgb(0_0_0/0.7)]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-rule-ink px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-signal" />
          </div>
          <p className="num hidden text-[11px] text-dim sm:block">sayan@iiitd — the actual CV</p>
          <div className="flex justify-end gap-1">
            <span className="num rounded-[4px] border border-rule-ink px-1.5 text-[10.5px] text-dim">⇥ complete</span>
            <span className="num hidden rounded-[4px] border border-rule-ink px-1.5 text-[10.5px] text-dim sm:inline">↑ history</span>
          </div>
        </div>

        <div
          ref={screen}
          data-scroll-box
          onClick={() => input.current?.focus({ preventScroll: true })}
          className="thin-scroll h-[420px] cursor-text overflow-y-auto px-5 py-4 font-mono text-[12.5px] leading-[1.75] md:h-[460px] md:px-7"
          data-cursor="Type"
        >
          {lines.map((l, i) => (
            <div key={i} className={`whitespace-pre-wrap break-words ${COLOR[l.kind]}`}>
              {l.kind === "cmd" && <span className="text-signal">{PROMPT} </span>}
              {l.text}
            </div>
          ))}
          <label className="flex items-center">
            <span className="shrink-0 text-signal">{PROMPT}&nbsp;</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-label="Terminal input"
              className="min-w-0 flex-1 bg-transparent text-bone caret-signal outline-none"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule-ink px-3 py-2">
          <div className="flex flex-wrap gap-1">
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => exec(q)}
                className="num rounded-[4px] bg-ink-3 px-2 py-0.5 text-[11px] text-dim transition-colors hover:bg-signal hover:text-ink"
              >
                {q}
              </button>
            ))}
          </div>
          <p className="num text-[11px] text-faint">
            {projects.length} projects · {archive.length} in the archive · {papers.length} papers
          </p>
        </div>
      </div>
    </section>
  );
}
