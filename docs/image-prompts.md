# Image prompts

Every image is optional. The site checks whether each file exists and only
shows the slot when it does (the two hero pills fall back to small drawn
icons). Save each file at the exact path, then restart `npm run dev` or rebuild.

## Shared style — put this at the start of every prompt

> Minimal studio product render. Matte objects in ceramic, anodised aluminium
> and frosted glass, soft diffused key light from the upper left, gentle
> contact shadows, shallow depth of field, calm and precise, like an
> industrial-design catalogue. Palette: warm bone #ECEAE4, near-black ink
> #111113, mid greys, with a single small chartreuse #C8F03C accent detail.
> No text, no letters, no numbers, no logos, no people, no busy backgrounds,
> no neon, no glossy plastic, no cartoon style.

---

## 1. Hero pill — "listen"
**Path:** `public/art/inline/listen.png` · **Size:** 1200 × 700 · **Background:** solid near-black #111113

> [shared style] A pair of matte black over-ear headphones lying at a slight
> angle; a thin chartreuse #C8F03C cable. Subject small and centred, entirely
> inside the middle 55% of the frame (the image is shown in a small rounded
> pill that crops the edges). Plain near-black background.

## 2. Hero pill — "arrive"
**Path:** `public/art/inline/arrive.png` · **Size:** 1200 × 700 · **Background:** solid near-black #111113

> [shared style] A single sealed envelope made of thick bone-coloured paper,
> floating slightly tilted, with a small chartreuse #C8F03C square seal. Subject
> small and centred inside the middle 55% of the frame. Plain near-black
> background.

## 3. Desk interlude
**Path:** `public/art/desk.jpg` · **Size:** 2400 × 1350 (16:9) · **Background:** full scene

> [shared style] Top-down view of a tidy engineer's desk at night on a bone
> linen surface: an open matte-black laptop whose screen shows abstract
> terminal-like lines in grey and one chartreuse line (nothing readable), a
> closed sketchbook with a pencil, a small unglazed clay cup of tea, over-ear
> headphones, a coiled black network cable, and a single small chartreuse
> sticky tab. One warm desk lamp pool from the top-left, the rest in soft
> shadow. Keep the laptop and cup inside the central 40% of the frame — the
> image first appears as a small centred window and then grows to full screen.

---

## 4–10. Project covers
Shown as a framed thumbnail beside each project title, and floating next to
the cursor when you hover the project index.

**Size:** 1024 × 1024 · **Background:** solid warm bone #ECEAE4 · **Composition:**
one object (or a tight group) centred, about 15% empty margin on every side.

### 001 — Code-mixed speech recognition
**Path:** `public/art/projects/001-asr.png`
> [shared style] A small studio microphone in matte black on a round ceramic
> base, with two thin translucent glass discs hovering beside it like speech
> bubbles, one with a chartreuse edge.

### 002 — Ultra Ethernet Transport
**Path:** `public/art/projects/002-uet.png`
> [shared style] Two small matte-black server blocks facing each other,
> connected by a single thin cable; three tiny bone-coloured cubes sit along
> the cable like packets, one lifted off the line and tinted chartreuse.

### 003 — Mini-GPT for Hindi
**Path:** `public/art/projects/003-gpt.png`
> [shared style] A neat stack of six thin frosted-glass slabs (transformer
> layers), slightly offset, the top slab carrying a small chartreuse glow at
> one corner.

### 004 — Legal QA with agents
**Path:** `public/art/projects/004-rag.png`
> [shared style] Three closed hardback books in bone and grey, lying stacked,
> with a slim brass-free matte-black magnifying glass resting across them and
> a small chartreuse bookmark ribbon.

### 005 — LungInsight
**Path:** `public/art/projects/005-lung.png`
> [shared style] A matte-black stethoscope coiled into a loose circle around a
> small frosted-glass tile that holds a thin engraved waveform line, one short
> segment of it chartreuse.

### 006 — Kubernetes CNI benchmarking
**Path:** `public/art/projects/006-cni.png`
> [shared style] Three small matte shipping-container shapes (black, grey,
> bone) on a shared plinth, linked by thin cables, one container with a
> chartreuse door.

### 007 — Cellular network simulator
**Path:** `public/art/projects/007-cell.png`
> [shared style] Seven hexagonal ceramic tiles in a honeycomb, bone and grey,
> with a slim black antenna mast rising from the centre tile and a chartreuse
> light at its tip.

---

## Checklist

| # | File | Background | Size |
|---|---|---|---|
| 1 | `public/art/inline/listen.png` | near-black | 1200×700 |
| 2 | `public/art/inline/arrive.png` | near-black | 1200×700 |
| 3 | `public/art/desk.jpg` | full scene | 2400×1350 |
| 4 | `public/art/projects/001-asr.png` | bone | 1024×1024 |
| 5 | `public/art/projects/002-uet.png` | bone | 1024×1024 |
| 6 | `public/art/projects/003-gpt.png` | bone | 1024×1024 |
| 7 | `public/art/projects/004-rag.png` | bone | 1024×1024 |
| 8 | `public/art/projects/005-lung.png` | bone | 1024×1024 |
| 9 | `public/art/projects/006-cni.png` | bone | 1024×1024 |
| 10 | `public/art/projects/007-cell.png` | bone | 1024×1024 |

Keep PNGs under about 400 KB and the desk JPG under about 500 KB.
