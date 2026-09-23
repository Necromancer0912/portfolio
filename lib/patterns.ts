/* Patterns. Abstract figures the hero particles settle into, in place of
   words. Each returns `count` target points ([x0,y0,x1,y1,...]) filling
   a w × h stage edge to edge; `spin` is how fast (rad/s) the figure turns
   in place. Anything that spins reaches out to the corners (half the
   diagonal), so turning never uncovers them. */

export type Pattern = { name: string; note: string; spin: number; points: (count: number, w: number, h: number) => Float32Array };

const TAU = Math.PI * 2;
const jit = (s: number) => (Math.random() - 0.5) * s;
/* Half the stage diagonal: a circle this big covers every corner. */
const cover = (w: number, h: number) => Math.hypot(w, h) / 2;

function fill(count: number, at: (i: number) => [number, number]) {
  const out = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const [x, y] = at(i);
    out[i * 2] = x;
    out[i * 2 + 1] = y;
  }
  return out;
}

/* Where a field's lines are, found on a coarse grid: walk every grid edge
   and note the spot where `f` changes sign (interpolated) — or, for a
   field of labels, the midpoint where the label changes. Particles then
   pick among these spots, so a figure costs a grid pass, not a search. */
function crossings(w: number, h: number, step: number, f: (x: number, y: number) => number, labels = false) {
  const cols = Math.ceil(w / step) + 1,
    rows = Math.ceil(h / step) + 1;
  const v = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) v[r * cols + c] = f(c * step, r * step);
  const pts: number[] = [];
  const edge = (a: number, b: number, x: number, y: number, dx: number, dy: number) => {
    if (labels ? a === b : a < 0 === b < 0) return;
    const t = labels ? 0.5 : a / (a - b);
    pts.push(x + dx * t * step, y + dy * t * step);
  };
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const a = v[r * cols + c];
      if (c + 1 < cols) edge(a, v[r * cols + c + 1], c * step, r * step, 1, 0);
      if (r + 1 < rows) edge(a, v[(r + 1) * cols + c], c * step, r * step, 0, 1);
    }
  return pts;
}

/* `count` particles spread over a list of spots, with a little blur. */
function around(count: number, pts: number[], blur: number) {
  const n = pts.length / 2;
  if (!n) return new Float32Array(count * 2);
  return fill(count, () => {
    const j = Math.floor(Math.random() * n) * 2;
    return [pts[j] + jit(blur), pts[j + 1] + jit(blur)];
  });
}

export const PATTERNS: Pattern[] = [
  {
    // Concentric rings, each a little out of round, more points on the outer ones.
    name: "rings",
    note: "signal",
    spin: 0.08,
    points: (count, w, h) => {
      const R = cover(w, h);
      const rings = Math.round(R / 26);
      return fill(count, () => {
        const k = Math.floor(Math.sqrt(Math.random()) * rings);
        const a = Math.random() * TAU;
        const r = R * ((k + 0.6) / rings) * (1 + 0.02 * Math.sin(a * 3 + k));
        return [w / 2 + Math.cos(a) * r + jit(1.5), h / 2 + Math.sin(a) * r + jit(1.5)];
      });
    },
  },
  {
    // Sunflower phyllotaxis: every point a golden angle past the last.
    name: "bloom",
    note: "phyllotaxis",
    spin: 0.12,
    points: (count, w, h) => {
      const R = cover(w, h);
      const seeds = Math.round((R * R) / 110);
      return fill(count, () => {
        const i = Math.floor(Math.random() * seeds);
        const r = R * Math.sqrt((i + 0.5) / seeds);
        const a = i * 2.39996323;
        return [w / 2 + Math.cos(a) * r + jit(3.2), h / 2 + Math.sin(a) * r + jit(3.2)];
      });
    },
  },
  {
    // A 3:4 Lissajous figure drawn as a few phase-shifted strands.
    name: "orbit",
    note: "lissajous 3:4",
    spin: 0,
    points: (count, w, h) => {
      const rx = w * 0.49,
        ry = h * 0.49;
      return fill(count, () => {
        const t = Math.random() * TAU;
        const s = Math.floor(Math.random() * 7) * 0.06;
        return [w / 2 + Math.sin(3 * t + Math.PI / 2 + s) * rx + jit(2), h / 2 + Math.sin(4 * t + s) * ry + jit(2)];
      });
    },
  },
  {
    // Stacked ridgelines, like a spectrogram seen from the side.
    name: "ridges",
    note: "spectrogram",
    spin: 0,
    points: (count, w, h) => {
      const lines = Math.max(18, Math.round(h / 30));
      const W = w;
      const bumps = Array.from({ length: lines }, () =>
        Array.from({ length: 4 }, () => [jit(0.5), 0.05 + Math.random() * 0.08, 0.3 + Math.random()] as const),
      );
      return fill(count, () => {
        const l = Math.floor(Math.random() * lines);
        const u = Math.random() - 0.5;
        const env = 0.25 + 0.75 * Math.exp(-(u * u) / 0.06);
        let lift = 0;
        for (const [c, sd, amp] of bumps[l]) lift += amp * Math.exp(-((u - c * 0.6) ** 2) / (2 * sd * sd));
        // Top line sits low enough for its peaks to stay on stage.
        const y0 = h * (0.1 + 0.88 * (l / (lines - 1)));
        return [w / 2 + u * W, y0 - lift * env * (h / lines) * 2.4 + jit(1)];
      });
    },
  },
  {
    // Rose curve r = cos(7θ/4), traced over four turns.
    name: "rose",
    note: "rose, k = 7/4",
    spin: 0.1,
    points: (count, w, h) => {
      const R = cover(w, h);
      return fill(count, () => {
        const t = Math.random() * 4 * TAU;
        const r = R * Math.cos((7 / 4) * t);
        return [w / 2 + Math.cos(t) * r + jit(2.5), h / 2 + Math.sin(t) * r + jit(2.5)];
      });
    },
  },
  {
    // A square mesh bent around a sphere, as if seen through a lens.
    name: "lens",
    note: "gravity well",
    spin: 0.06,
    points: (count, w, h) => {
      const C = cover(w, h);
      const R = Math.min(w, h) * 0.46; // radius of the bulge
      const gap = 30;
      const n = Math.ceil(C / gap);
      return fill(count, () => {
        // A point on one mesh line, over the whole (rotating) cover square.
        const line = ((Math.floor(Math.random() * (2 * n + 1)) - n) * gap) / R;
        const along = ((Math.random() * 2 - 1) * n * gap) / R;
        const [gx, gy] = Math.random() < 0.5 ? [line, along] : [along, line];
        const d = Math.hypot(gx, gy);
        // Inside the bulge, push points outward along a sphere's profile.
        const k = d < 1 ? Math.sin((d * Math.PI) / 2) / Math.max(d, 1e-4) : 1;
        return [w / 2 + gx * k * R + jit(1.2), h / 2 + gy * k * R + jit(1.2)];
      });
    },
  },
  {
    // Two point sources on a pond: the lines where their ripples cancel.
    name: "interference",
    note: "two sources",
    spin: 0,
    points: (count, w, h) => {
      const ax = w * 0.3, ay = h * 0.42, bx = w * 0.7, by = h * 0.58;
      const k = TAU / 34;
      const f = (x: number, y: number) => Math.sin(k * Math.hypot(x - ax, y - ay)) + Math.sin(k * Math.hypot(x - bx, y - by));
      return around(count, crossings(w, h, 3, f), 2.6);
    },
  },
  {
    // Many logarithmic spiral arms, the shape of a shell or a storm.
    name: "spiral",
    note: "logarithmic spiral",
    spin: 0.14,
    points: (count, w, h) => {
      const C = cover(w, h) * 1.05;
      const arms = 14;
      return fill(count, () => {
        const r = 6 + C * Math.pow(Math.random(), 0.75);
        const a = (Math.floor(Math.random() * arms) / arms) * TAU + Math.log(r / 6) / 0.32;
        return [w / 2 + Math.cos(a) * r + jit(2), h / 2 + Math.sin(a) * r + jit(2)];
      });
    },
  },
  {
    // Streamlines through a smooth field, like wind on a weather map.
    name: "flow",
    note: "flow field",
    spin: 0,
    points: (count, w, h) => {
      const f1 = 0.004 + Math.random() * 0.002, f2 = 0.006 + Math.random() * 0.003, ph = Math.random() * TAU;
      const angle = (x: number, y: number) => Math.sin(x * f1 + ph) * 1.6 + Math.cos(y * f2 - ph) * 1.4 + Math.sin((x + y) * 0.0025) * 0.8;
      const pts: number[] = [];
      const gap = 26;
      for (let gy = -gap; gy < h + gap; gy += gap)
        for (let gx = -gap; gx < w + gap; gx += gap) {
          let x = gx + jit(gap), y = gy + jit(gap);
          for (let s = 0; s < 36; s++) {
            pts.push(x, y);
            const a = angle(x, y);
            x += Math.cos(a) * 3.5;
            y += Math.sin(a) * 3.5;
          }
        }
      const n = pts.length / 2;
      return fill(count, () => {
        const j = Math.floor(Math.random() * n) * 2;
        return [pts[j] + jit(1.2), pts[j + 1] + jit(1.2)];
      });
    },
  },
  {
    // Contour lines of an invented landscape, a few hills and a valley.
    name: "contours",
    note: "topographic map",
    spin: 0,
    points: (count, w, h) => {
      const hills = Array.from({ length: 6 }, () => [Math.random() * w, Math.random() * h, 0.12 + Math.random() * 0.22, (Math.random() < 0.3 ? -1 : 1) * (0.6 + Math.random())]);
      const S = Math.min(w, h);
      const height = (x: number, y: number) => {
        let v = 0;
        for (const [cx, cy, sd, amp] of hills) v += amp * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * (sd * S) ** 2));
        return v * 9;
      };
      // Zero at every whole-number height: one line per level.
      return around(count, crossings(w, h, 3, (x, y) => Math.sin(Math.PI * height(x, y))), 2.6);
    },
  },
  {
    // Squares shrinking into the distance, each turned a little more.
    name: "tunnel",
    note: "recursion",
    spin: 0.07,
    points: (count, w, h) => {
      const C = cover(w, h) * 1.45;
      const n = 26;
      const size = (j: number) => C * Math.pow(0.86, j);
      return fill(count, () => {
        // Weight by perimeter so small squares aren't overdrawn.
        let j = 0;
        for (let t = 0; t < 8; t++) {
          j = Math.floor(Math.random() * n);
          if (Math.random() < size(j) / C) break;
        }
        const s = size(j),
          tw = j * 0.07;
        const e = Math.random() * 4, u = (e % 1) * 2 - 1;
        const side = Math.floor(e);
        const [lx, ly] = side === 0 ? [u, -1] : side === 1 ? [1, u] : side === 2 ? [-u, 1] : [-1, -u];
        const x = lx * s, y = ly * s;
        return [w / 2 + x * Math.cos(tw) - y * Math.sin(tw) + jit(1.2), h / 2 + x * Math.sin(tw) + y * Math.cos(tw) + jit(1.2)];
      });
    },
  },
  {
    // Cell walls between scattered seeds, like cracked clay or a leaf.
    name: "cells",
    note: "voronoi",
    spin: 0,
    points: (count, w, h) => {
      const gap = 84;
      const seeds: [number, number][] = [];
      const cols0 = Math.ceil((w + gap) / gap) + 1;
      for (let r = 0; r * gap < h + gap * 1.5; r++)
        for (let c = 0; c < cols0; c++) seeds.push([c * gap - gap / 2 + jit(gap * 0.9), r * gap - gap / 2 + jit(gap * 0.9)]);
      // Label each grid point with its nearest seed; walls lie where labels change.
      const cols = cols0;
      const nearest = (x: number, y: number) => {
        const gc = Math.floor((x + gap / 2) / gap), gr = Math.floor((y + gap / 2) / gap);
        let best = 0, bd = Infinity;
        for (let r = gr - 2; r <= gr + 2; r++)
          for (let c = gc - 2; c <= gc + 2; c++) {
            const sd = seeds[r * cols + c];
            if (!sd) continue;
            const d = (x - sd[0]) ** 2 + (y - sd[1]) ** 2;
            if (d < bd) [bd, best] = [d, r * cols + c];
          }
        return best;
      };
      return around(count, crossings(w, h, 1.5, nearest, true), 1.6);
    },
  },
];
