# Portfolio — Sayan Das

One page. Next.js App Router, Tailwind v4, Lenis, and canvas for the motion.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Content and images

- All copy: **`lib/content.ts`** (projects, archive, notes, papers, FAQ…).
- Generated images: originals in `public/art/` (see **`docs/image-prompts.md`**);
  optimised, cropped WebP copies in `public/art/web/` are what the page loads.
  If you replace an original, regenerate its WebP copy (or delete the copy and
  the original is used).
- Reference study behind the design: **`docs/design-notes.md`**.

## Design system

Bone `#ECEAE4`, ink `#111113`, and one signal colour, chartreuse `#C8F03C`,
used only as a fill. Typography follows the reference site's own system:
**Geist** for everything: headings weight 500 with normal letter-spacing at
moderate sizes, and labels, numbers and buttons as small uppercase Geist
(12–13px, weight 500, +0.07em). No serif; Geist Mono only inside the terminal. Tokens live in `app/globals.css` under `@theme`.

## Pieces

| Component | What it does |
|---|---|
| `hero.tsx` + `swarm.tsx` | Split hero; ~60,000 glowing particles simulated on the GPU (WebGL2 transform feedback) settle into twelve full-bleed abstract figures (`lib/patterns.ts`: rings, phyllotaxis, Lissajous, ridgelines, rose, lens, interference, log spiral, flow field, contours, tunnel, Voronoi) and stream between them through a current field. Cursor stirs them; hold pulls them into a spiral galaxy; release bursts them into the next figure. Falls back to the 2D `morph.tsx` without WebGL2 |
| `primitives.tsx` | `Odometer` (the reference's rolling text: each letter rolls through four stand-ins to itself on hover, and back on leave), `LinkedButtons` (bridged pair), reveals |
| `nav.tsx` | Floating island: animated pixel mark, links with odometer text and a springy highlight pill, Index button; a strip below says where you are and fills with scroll progress. Folds to mark · section · Index while scrolling down; hover or scroll up to unfold. Full-screen Index overlay |
| `lately.tsx` | Scroll-lit list in About |
| `packet-stream.tsx` | Pixel packets crossing between sections; pointer pushes them (not on the page; see `app/page.tsx`) |
| `work.tsx` + `diagrams.tsx` | Project cards beside a sticky contents rail: story at reading width, a margin column (result, tools, source), the live figure across the foot; searchable archive |
| `desk.tsx` | Image window that grows to full bleed (renders once `public/art/desk.jpg` exists) (not on the page; see `app/page.tsx`) |
| `notes.tsx` | Typewriter carousel on a sheet that arrives at an angle |
| `shell.tsx` | A working terminal |
| `footer.tsx` | Dither edge, sketchpad, "say hello" marquee with a cursor disc |

Everything respects `prefers-reduced-motion`; canvases and diagrams pause off screen.
