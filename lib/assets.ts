import fs from "fs";
import path from "path";
import { projects } from "./content";

/* Generated illustrations live in /public/art. The originals are kept as
   delivered; optimised WebP copies (cropped and resized) live in
   /public/art/web and are preferred when present. Every slot is optional:
   components render an image only when a file exists. See
   docs/image-prompts.md for what goes where. */

const has = (p: string) => fs.existsSync(path.join(process.cwd(), "public", p));
const first = (...ps: string[]) => {
  const hit = ps.find(has);
  return hit ? `/${hit}` : null;
};

export type Assets = {
  listen: string | null;
  arrive: string | null;
  desk: string | null;
  covers: Record<string, string>;
};

export function getAssets(): Assets {
  const covers: Record<string, string> = {};
  for (const p of projects) {
    const name = `${p.n}-${p.diagram}`;
    const hit = first(`art/web/${name}.webp`, `art/projects/${name}.png`);
    if (hit) covers[p.n] = hit;
  }
  return {
    listen: first("art/web/listen.webp", "art/inline/listen.png"),
    arrive: first("art/web/arrive.webp", "art/inline/arrive.png"),
    desk: first("art/web/desk.webp", "art/desk.jpg", "art/desk.png"),
    covers,
  };
}
