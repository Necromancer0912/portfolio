"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Diagram } from "@/lib/content";
import { reducedMotion } from "@/lib/motion";

/* Hand-drawn system diagrams, one per featured project. Nodes are mono
   labels in rounded boxes, edges carry a dashed "flow", and small packets
   ride along the paths with SMIL. Everything pauses when off screen. */

// Instrument panel: bone type on ink, one signal colour.
const PAPER = "#eceae4"; // primary text
const DIM = "#8f8d88";
const FAINT = "#4a4946";
const LINE = "#3a3a3f";
const NODE = "#1c1c1f";
const ACCENT = "#c8f03c";
const ON_ACCENT = "#111113";
const TRACK = "#26262a";

// Trig output rounded, so server and client agree to the last digit.
const r1 = (v: number) => Math.round(v * 10) / 10;

function Node({
  x,
  y,
  w,
  h = 30,
  label,
  accent = false,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={accent ? ACCENT : NODE} stroke={accent ? ACCENT : LINE} />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -3 : 1)} textAnchor="middle" dominantBaseline="middle" fill={accent ? ON_ACCENT : PAPER} className="dg-t">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle" dominantBaseline="middle" fill={accent ? ON_ACCENT : DIM} className="dg-s">
          {sub}
        </text>
      )}
    </g>
  );
}

function Edge({ d, flow = false, dashed = false }: { d: string; flow?: boolean; dashed?: boolean }) {
  return (
    <g fill="none">
      <path d={d} stroke={LINE} strokeDasharray={dashed ? "2 4" : undefined} />
      {flow && <path d={d} stroke={ACCENT} className="dg-flow" />}
    </g>
  );
}

function Packet({ path, dur = 2.4, begin = 0, r = 2.6, color = ACCENT }: { path: string; dur?: number; begin?: number; r?: number; color?: string }) {
  return (
    <circle r={r} fill={color}>
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} />
    </circle>
  );
}

function Label({ x, y, children, anchor = "start", color = DIM }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; color?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} className="dg-s">
      {children}
    </text>
  );
}

function Bars({
  x,
  y,
  labelW,
  barW,
  rowH = 22,
  max,
  rows,
}: {
  x: number;
  y: number;
  labelW: number;
  barW: number;
  rowH?: number;
  max: number;
  rows: { label: string; value: number; display: string; accent?: boolean; dim?: boolean }[];
}) {
  return (
    <g>
      {rows.map((r, i) => {
        const ry = y + i * rowH;
        const w = Math.max(2, (r.value / max) * barW);
        return (
          <g key={i}>
            <text x={x} y={ry + 7} dominantBaseline="middle" fill={r.dim ? DIM : PAPER} className="dg-s">
              {r.label}
            </text>
            <rect x={x + labelW} y={ry} width={barW} height={12} rx={2} fill={TRACK} />
            <rect
              x={x + labelW}
              y={ry}
              width={w}
              height={12}
              rx={2}
              fill={r.accent ? ACCENT : r.dim ? FAINT : "#6b6964"}
              className="dg-bar"
              style={{ transitionDelay: `${i * 120}ms` }}
            />
            <text x={x + labelW + w + 6} y={ry + 7} dominantBaseline="middle" fill={r.accent ? ACCENT : PAPER} className="dg-s dg-fade" style={{ transitionDelay: `${400 + i * 120}ms` }}>
              {r.display}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Wave({ x, y, n = 22, gap = 4.6, h = 26 }: { x: number; y: number; n?: number; gap?: number; h?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const amp = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45));
        // Rounded so server and client render identical attributes.
        const bh = Math.round(Math.max(3, amp * h) * 10) / 10;
        return (
          <rect
            key={i}
            x={Math.round((x + i * gap) * 10) / 10}
            y={Math.round((y - bh / 2) * 10) / 10}
            width={2.4}
            height={bh}
            rx={1.2}
            fill={i % 5 === 2 ? ACCENT : PAPER}
            className="dg-wave"
            style={{ animationDelay: `${(i % 7) * -0.17}s` }}
          />
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ */

function Asr() {
  return (
    <svg viewBox="0 0 640 300">
      <Label x={20} y={20}>bn–en speech</Label>
      <Wave x={20} y={50} />
      <Edge d="M124 50 H140" flow />
      <Node x={140} y={35} w={112} label="WHISPER ENC" />
      <Edge d="M252 50 H276" flow />
      <Node x={276} y={35} w={124} label="DECODER" sub="+ prompt, fine-tuned" />
      <Edge d="M400 50 H424" flow />
      <rect x={432} y={27} width={96} height={30} rx={6} fill={NODE} stroke={LINE} opacity={0.5} />
      <rect x={428} y={31} width={96} height={30} rx={6} fill={NODE} stroke={LINE} opacity={0.8} />
      <Node x={424} y={35} w={96} label="N-BEST" sub="5 hypotheses" />

      <Edge d="M472 65 V85 H370 V108" />
      <Edge d="M472 65 V108" flow />
      <Edge d="M472 65 V85 H583 V108" />
      <Node x={330} y={108} w={80} label="GPT-2" />
      <Node x={427} y={108} w={90} label="BLOOM-1B1" accent />
      <Node x={540} y={108} w={86} label="QWEN2.5" />

      <Edge d="M370 138 V152 M472 138 V152 M583 138 V152" />
      <Edge d="M583 152 H225 V138" flow />
      <Node x={150} y={108} w={150} label="ASR ⊕ LLM SCORE" sub="interpolated" />
      <Edge d="M150 123 H130" flow />
      <Node x={20} y={108} w={110} label="39.6% S-WER" accent />

      <Packet path="M20 50 H140 M252 50 H276" dur={2.2} />
      <Packet path="M472 65 V108" dur={1.6} begin={0.4} />
      <Packet path="M583 152 H225 V138" dur={2.4} begin={0.8} />

      <line x1={20} x2={620} y1={176} y2={176} stroke={LINE} strokeDasharray="2 4" />
      <Label x={20} y={196}>word error rate, MUCS 2021 test set</Label>
      <Bars
        x={20}
        y={208}
        labelW={170}
        barW={380}
        max={195}
        rows={[
          { label: "Zero-shot Whisper", value: 195, display: "101–195%", dim: true },
          { label: "Decoder fine-tuned", value: 41.2, display: "41.2%" },
          { label: "+ MBR consensus", value: 40.1, display: "40.1%" },
          { label: "+ BLOOM rescoring", value: 39.6, display: "39.6%", accent: true },
        ]}
      />
    </svg>
  );
}

function Uet() {
  // One 7s loop: three sends, a drop, a SACK, a retransmit, in-order delivery.
  const D = "7s";
  const move = (path: string, t0: number, t1: number, extra?: ReactNode) => (
    <circle r={3.2} fill={ACCENT} opacity={0}>
      <animateMotion dur={D} repeatCount="indefinite" path={path} keyPoints="0;0;1;1" keyTimes={`0;${t0};${t1};1`} calcMode="linear" />
      <animate attributeName="opacity" dur={D} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${t0 - 0.001};${t0};${t1};${t1 + 0.001};1`} />
      {extra}
    </circle>
  );
  const slot = (x: number, n: number, t: number) => (
    <g key={n}>
      <rect x={x} y={236} width={24} height={20} rx={3} fill={NODE} stroke={LINE} />
      <rect x={x} y={236} width={24} height={20} rx={3} fill={ACCENT} opacity={0}>
        <animate attributeName="opacity" dur={D} repeatCount="indefinite" values="0;0;1;1;0" keyTimes={`0;${t};${t + 0.02};0.95;1`} />
      </rect>
      <text x={x + 12} y={247} textAnchor="middle" dominantBaseline="middle" fill={PAPER} className="dg-s">
        {n}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 640 300">
      <Node x={40} y={10} w={150} label="INITIATOR" sub="PDC · SES / PDS" />
      <Node x={390} y={10} w={150} label="TARGET" sub="PDC · SES / PDS" />
      <line x1={115} x2={115} y1={42} y2={272} stroke={LINE} strokeDasharray="2 4" />
      <line x1={465} x2={465} y1={42} y2={272} stroke={LINE} strokeDasharray="2 4" />

      <Edge d="M115 62 L465 80" />
      <Label x={125} y={60}>PSN 1</Label>
      <Edge d="M115 94 L300 104" />
      <Label x={125} y={92}>PSN 2</Label>
      <g stroke={ACCENT} strokeWidth={1.6}>
        <path d="M296 98 l10 10 M306 98 l-10 10" />
      </g>
      <Label x={312} y={112} color={ACCENT}>dropped</Label>
      <Edge d="M115 126 L465 144" />
      <Label x={125} y={124}>PSN 3</Label>
      <Edge d="M465 160 L115 178" />
      <Label x={455} y={156} anchor="end">ACK_CC · SACK</Label>
      {[1, 0, 1].map((b, i) => (
        <rect key={i} x={270 + i * 13} y={176} width={10} height={10} rx={2} fill={b ? PAPER : "none"} stroke={DIM} />
      ))}
      <path d="M115 196 L465 214" stroke={ACCENT} fill="none" />
      <Label x={125} y={194} color={ACCENT}>RTX PSN 2</Label>

      {move("M115 62 L465 80", 0.02, 0.14)}
      {move("M115 94 L300 104", 0.16, 0.24)}
      {move("M115 126 L465 144", 0.27, 0.39)}
      {move("M465 160 L115 178", 0.43, 0.55)}
      {move("M115 196 L465 214", 0.6, 0.72)}

      <Label x={480} y={228}>reorder buffer</Label>
      {slot(480, 1, 0.14)}
      {slot(508, 2, 0.72)}
      {slot(536, 3, 0.39)}
      <text x={574} y={247} dominantBaseline="middle" fill={DIM} className="dg-s">
        → app
      </text>

      <Label x={20} y={290}>86 / 86 checks · 7 SES header formats · 12 PDS packet formats · 20 NACK codes</Label>
    </svg>
  );
}

function Gpt() {
  const tokens = ["▁यह", "▁फ़िल्म", "▁अच्छी", "▁है"];
  const N = 8,
    cell = 13,
    gap = 2,
    ox = 400,
    oy = 44;
  return (
    <svg viewBox="0 0 640 300">
      <Node x={80} y={12} w={180} label="LOGITS → NEXT TOKEN" />
      <Edge d="M170 58 V42" flow />
      <rect x={40} y={58} width={260} height={150} rx={8} fill="none" stroke={LINE} strokeDasharray="3 4" />
      <Label x={50} y={74}>block × N, written by hand</Label>
      <Node x={60} y={84} w={220} h={24} label="RMSNORM" />
      <Node x={60} y={114} w={220} h={34} label="CAUSAL ATTENTION" sub="rotary positions (RoPE)" accent />
      <Node x={60} y={154} w={220} h={24} label="RMSNORM" />
      <Node x={60} y={184} w={220} h={18} label="MLP" />
      <Edge d="M170 236 V210" flow />
      <Node x={80} y={236} w={180} h={24} label="EMBED · 5K SENTENCEPIECE" />
      {tokens.map((t, i) => (
        <g key={t}>
          <rect x={46 + i * 64} y={270} width={58} height={22} rx={4} fill={TRACK} />
          <text x={75 + i * 64} y={282} textAnchor="middle" dominantBaseline="middle" fill={PAPER} className="dg-s" style={{ textTransform: "none" }}>
            {t}
          </text>
        </g>
      ))}

      <Label x={ox} y={30}>causal attention, 8 × 8</Label>
      {Array.from({ length: N * N }, (_, k) => {
        const i = Math.floor(k / N),
          j = k % N;
        const x = ox + j * (cell + gap),
          y = oy + i * (cell + gap);
        return j <= i ? (
          <rect key={k} x={x} y={y} width={cell} height={cell} rx={2} fill={ACCENT} className="dg-cell" style={{ animationDelay: `${(i * 0.13 + j * 0.07) % 1.6}s` }} />
        ) : (
          <rect key={k} x={x + 0.5} y={y + 0.5} width={cell - 1} height={cell - 1} rx={2} fill="none" stroke={TRACK} />
        );
      })}

      <Label x={ox} y={196}>validation perplexity (relative)</Label>
      <Bars
        x={ox}
        y={208}
        labelW={0}
        barW={120}
        rowH={40}
        max={100}
        rows={[
          { label: "", value: 100, display: "vanilla block" },
          { label: "", value: 95.7, display: "−4.3%, same size", accent: true },
        ]}
      />
    </svg>
  );
}

function Rag() {
  return (
    <svg viewBox="0 0 640 300">
      <Node x={14} y={128} w={78} label="QUERY" />
      <Edge d="M92 143 H116" flow />
      <Node x={116} y={128} w={84} label="ROUTER" />
      <Edge d="M200 143 H214 V95 H236 M200 143 H214 V191 H236" flow />
      <Node x={236} y={80} w={100} label="BM25" sub="keyword" />
      <Node x={236} y={176} w={100} label="QDRANT" sub="dense" />
      <Edge d="M336 95 H350 V143 H364 M336 191 H350 V143" flow />
      <Node x={364} y={128} w={98} label="BGE RERANK" />
      <Edge d="M462 143 H480" flow />

      <rect x={480} y={88} width={146} height={110} rx={8} fill="none" stroke={LINE} strokeDasharray="3 4" />
      <Label x={490} y={104}>langgraph agents</Label>
      <circle cx={553} cy={150} r={28} fill="none" stroke={LINE} />
      <circle cx={553} cy={150} r={28} fill="none" stroke={ACCENT} className="dg-flow" />
      {[0, 1, 2].map((i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
        return <circle key={i} cx={r1(553 + Math.cos(a) * 28)} cy={r1(150 + Math.sin(a) * 28)} r={8} fill={NODE} stroke={PAPER} />;
      })}
      <Packet path="M581 150 A28 28 0 1 1 581 149.9" dur={3} />

      <Node x={480} y={22} w={146} label="LOCAL LLM" sub="served on my machine" />
      <Edge d="M553 52 V88" dashed />
      <Node x={116} y={236} w={180} label="REDIS" sub="semantic cache · memory" />
      <Edge d="M158 158 V236" dashed />
      <Edge d="M296 251 H553 V198" dashed />

      <Node x={480} y={236} w={146} h={44} label="" />
      <Label x={490} y={252}>SSE → browser</Label>
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={490 + i * 14} y={262} width={10} height={8} rx={1.5} fill={PAPER} className="dg-stream" style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
      <Edge d="M600 198 V236" flow />
    </svg>
  );
}

function Lung() {
  return (
    <svg viewBox="0 0 640 300">
      <Label x={20} y={22}>breath sounds</Label>
      <Wave x={20} y={52} n={20} />
      <rect x={20} y={130} width={104} height={130} rx={6} fill="#0b0b0c" stroke={LINE} />
      <Label x={20} y={122}>chest x-ray</Label>
      <g fill="none" stroke="#eceae4" strokeWidth={1.3} className="dg-draw">
        <path d="M68 150 C50 152 36 180 38 214 C40 240 58 246 66 236 C70 220 70 180 68 150 Z" />
        <path d="M76 150 C94 152 108 180 106 214 C104 240 86 246 78 236 C74 220 74 180 76 150 Z" />
        <path d="M72 140 V175" />
      </g>
      <rect x={22} y={132} width={100} height={2} fill={ACCENT} className="dg-scan" />

      <Edge d="M120 52 H160" flow />
      <Edge d="M124 195 H160" flow />
      <Node x={160} y={37} w={112} label="AUDIO CNN" />
      <Node x={160} y={180} w={112} label="X-RAY MODEL" />
      <Edge d="M272 52 H290 V110 H306 M272 195 H290 V110" flow />
      <Node x={306} y={95} w={104} label="FLASK API" />
      <Edge d="M358 125 V170" flow />
      <Node x={306} y={170} w={104} label="OLLAMA" sub="local, offline" accent />
      <Edge d="M410 185 H428 V70 H444 M428 185 V210 H444" flow />

      <rect x={444} y={26} width={180} height={96} rx={6} fill={NODE} stroke={LINE} />
      <Label x={456} y={44}>follow-up questions</Label>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} className="dg-line" style={{ animationDelay: `${i * 0.5}s` }}>
          <text x={456} y={64 + i * 15} fill={ACCENT} className="dg-s">
            Q{i + 1}
          </text>
          <rect x={478} y={58 + i * 15} width={120 - i * 18} height={6} rx={2} fill={FAINT} />
        </g>
      ))}

      <rect x={444} y={140} width={180} height={130} rx={6} fill={NODE} stroke={LINE} />
      <Label x={456} y={158}>draft report</Label>
      <rect x={456} y={168} width={82} height={16} rx={3} fill={ACCENT} />
      <text x={497} y={177} textAnchor="middle" dominantBaseline="middle" fill={ON_ACCENT} className="dg-s">
        SEVERITY
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={456} y={196 + i * 13} width={150 - (i % 3) * 30} height={5} rx={2} fill={FAINT} className="dg-line" style={{ animationDelay: `${1 + i * 0.35}s` }} />
      ))}
      <Label x={20} y={290}>electron + react · flask · ollama · nothing leaves the machine</Label>
    </svg>
  );
}

function Cni() {
  const node = (x: number, n: number) => (
    <g key={n}>
      <rect x={x} y={16} width={150} height={62} rx={6} fill={NODE} stroke={LINE} />
      <text x={x + 12} y={32} fill={DIM} className="dg-s">
        NODE-{n}
      </text>
      {[0, 1, 2].map((p) => (
        <g key={p}>
          <rect x={x + 14 + p * 44} y={42} width={36} height={24} rx={4} fill={TRACK} stroke={LINE} />
          <text x={x + 32 + p * 44} y={55} textAnchor="middle" dominantBaseline="middle" fill={PAPER} className="dg-s">
            pod
          </text>
        </g>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 640 300">
      {node(20, 1)}
      {node(245, 2)}
      {node(470, 3)}
      <Edge d="M95 78 V100 H545 V78 M320 78 V100" flow />
      <Label x={320} y={116} anchor="middle">vxlan · bgp · ebpf — one at a time, clean slate between</Label>
      <Packet path="M95 100 H545" dur={2.6} />
      <Packet path="M545 100 H95" dur={3.4} begin={1} color={PAPER} r={2} />

      <line x1={20} x2={620} y1={134} y2={134} stroke={LINE} strokeDasharray="2 4" />
      <Label x={20} y={156}>tcp throughput, 128 mb (gbps)</Label>
      <Bars
        x={20}
        y={168}
        labelW={104}
        barW={150}
        rowH={26}
        max={0.184}
        rows={[
          { label: "Flannel", value: 0.015, display: "0.015" },
          { label: "Calico-BGP", value: 0.023, display: "0.023" },
          { label: "Calico-VXLAN", value: 0.03, display: "0.030" },
          { label: "Cilium", value: 0.184, display: "0.184", accent: true },
        ]}
      />
      <Label x={340} y={156}>composite score, 128 mb</Label>
      <Bars
        x={340}
        y={168}
        labelW={104}
        barW={130}
        rowH={26}
        max={100}
        rows={[
          { label: "Cilium", value: 84.9, display: "84.9", accent: true },
          { label: "Calico-VXLAN", value: 54.3, display: "54.3" },
          { label: "Flannel", value: 47.8, display: "47.8" },
          { label: "Calico-BGP", value: 16.7, display: "16.7" },
        ]}
      />
    </svg>
  );
}

function Cell() {
  const R = 32;
  const hex = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      return `${r1(cx + R * Math.cos(a))},${r1(cy + R * Math.sin(a))}`;
    }).join(" ");
  const cx = 150,
    cy = 140;
  const ring = Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + (Math.PI / 3) * i;
    return [r1(cx + Math.cos(a) * R * Math.sqrt(3)), r1(cy + Math.sin(a) * R * Math.sqrt(3))];
  });
  const gens = ["2G", "3G", "4G", "5G", "6G", "7G"];
  return (
    <svg viewBox="0 0 640 300">
      <Label x={20} y={22}>cells, towers, devices</Label>
      <polygon points={hex(cx, cy)} fill="#1f2410" stroke={ACCENT} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill={ACCENT} className="dg-t">
        TOWER
      </text>
      {ring.map(([x, y], i) => (
        <g key={i}>
          <polygon points={hex(x, y)} fill={NODE} stroke={LINE} />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={PAPER} className="dg-t">
            {gens[i]}
          </text>
        </g>
      ))}
      {ring.map(([x, y], i) => (
        <circle key={`d${i}`} r={2.2} fill={i % 2 ? PAPER : ACCENT}>
          <animateMotion dur={`${3 + i * 0.6}s`} repeatCount="indefinite" path={`M${x} ${y} L${cx} ${cy} L${ring[(i + 2) % 6][0]} ${ring[(i + 2) % 6][1]}`} />
        </circle>
      ))}
      <circle cx={cx} cy={cy} r={20} fill="none" stroke={ACCENT} className="dg-ping" />

      <Label x={310} y={40}>thread-pool speedup, measured again</Label>
      <Bars
        x={310}
        y={60}
        labelW={0}
        barW={250}
        rowH={46}
        max={7.08}
        rows={[
          { label: "", value: 7.08, display: "7.08×", dim: true },
          { label: "", value: 0.39, display: "0.39×" },
          { label: "", value: 3.26, display: "3.26×", accent: true },
        ]}
      />
      <Label x={310} y={88}>first claim — mostly timing sleeping threads</Label>
      <Label x={310} y={134}>after removing the fake work</Label>
      <Label x={310} y={180}>after fixing the pool · 100k devices, 8 threads</Label>
      <line x1={310} x2={620} y1={210} y2={210} stroke={LINE} strokeDasharray="2 4" />
      <Label x={310} y={232}>4 / 4 test suites · 7-tab terminal ui</Label>
      <Label x={310} y={250}>no external tui library</Label>
    </svg>
  );
}

const MAP: Record<Diagram, { title: string; el: () => ReactNode }> = {
  asr: { title: "Pipeline and results", el: Asr },
  uet: { title: "Loss recovery, one loop", el: Uet },
  gpt: { title: "Model and attention", el: Gpt },
  rag: { title: "Retrieval graph", el: Rag },
  lung: { title: "Local-first pipeline", el: Lung },
  cni: { title: "Cluster and results", el: Cni },
  cell: { title: "Simulation and benchmark", el: Cell },
};

export function Figure({ n, kind }: { n: string; kind: Diagram }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const svg = el.querySelector("svg");
    const still = reducedMotion();
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setSeen(true);
        const play = e.isIntersecting && !still;
        setPlaying(play);
        if (svg) play ? svg.unpauseAnimations() : svg.pauseAnimations();
      },
      { threshold: 0.2 },
    );
    if (svg) svg.pauseAnimations();
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { title, el: El } = MAP[kind];

  return (
    <div
      ref={ref}
      className={`dg dots mt-10 overflow-hidden rounded-[10px] bg-ink text-bone ${seen ? "is-in" : ""} ${playing ? "" : "dg-paused"}`}
    >
      <div className="flex items-center justify-between border-b border-rule-ink px-4 py-2.5">
        <span className="label text-dim">
          Fig. {n} — {title}
        </span>
        <span className="label flex items-center gap-2 text-dim">
          <span className={`h-[6px] w-[6px] ${playing ? "animate-pulse bg-signal" : "bg-faint"}`} />
          {playing ? "Live" : "Paused"}
        </span>
      </div>
      <div className="overflow-x-auto px-3 py-4 [scrollbar-width:none]">
        <div className="min-w-[560px]">
          <El />
        </div>
      </div>
    </div>
  );
}
