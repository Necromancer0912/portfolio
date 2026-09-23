# Design notes — reference study

Main inspiration: **contentarchitecture.dev**. Fourteen more sites studied by
scrolling each one in Chrome at 1440×900 and capturing 7–17 frames per site,
plus a fingerprint of fonts and libraries. Nothing is copied; each idea kept
is re-drawn in this site's own restrained language (see below).

## What each site does well

| Site | Craft worth learning from | Tech seen |
|---|---|---|
| contentarchitecture.dev | Mono labels, rolling slot-machine button text, two buttons joined by a bridge, hold-to-interact hero, real terminal, typewriter testimonials | Next, Lenis |
| cloudstudio.es | A character (Dot, made of dots) with googly eyes that *is* the tour guide; "This site is awake." — personality before content | GSAP, Lenis, Rive, OGL |
| thepatchsystem.com | Hand-drawn line characters; electric blue + orange; bordered "window" cards with corner index badges; scroll-lit lists (active line dark, rest grey); balls falling into a bucket (physics); huge counting numbers | Lenis, Matter.js |
| overmindlab.ai | Retro pixel-art world (Commodore, dithered trees, pixel fire footer); serif headline over pixel imagery; OS-desktop icons | Three, Rive |
| craft.wild.as | Pixel particle streams in blue/yellow/black that flow and morph; tiny pixel faces; giant pixel-font marquee; very quiet Swiss type around loud pixels | Framer Motion, Rive |
| flim.ai | Giant wordmark; film stills drifting around a search bar; rotated stat pills and shapes tumbling with physics; split colour panels with half-circles | GSAP, SplitText, Barba |
| follow.art | Huge condensed type with a curved 3D card ring through it; coloured sheets sliding over each other with tilted edges; hand scribble circles and sparkles | Three, OGL |
| cofounder.co | Pixel-art illustrated hero; pixel "grass" edge dissolving into the next section; word-search grid with circled words; chapter cards | OGL |
| anima.ai | One organic hero object; soft yellow glow; duotone team photos; marquee with a circle that follows the cursor ("Have a seat") | Lenis, Splitting |
| bitcoinos.build | Scroll-driven 3D world; diagonal slice wipes between scenes; dot scroll indicator | Three, OGL |
| leonardo.ai | Type warped into a tunnel; images scattering out; giant multicolour stat numbers; icons set *inside* headlines ("FOR [icon] MAKERS") | Three, Rive |
| oevra.com | Blurred natural gradients; staggered lines with rules between; images converging into one; halo lens | Three, Rive |
| jobyaviation.com | Rounded image window that grows to full bleed on scroll; blue band under the hero; painterly illustrated sky finale | Lenis |
| craft.do | Paper-cutout collage hero (torn paper, clouds, stripes); pastel feature panels; hand-cut people cards; fanned theme cards | Rive |
| dovetail.com | Objects inline in headline text ("not [3D hand] vibes"); scroll-lit list with icons; pixel mascot | GSAP, Rive |

## Patterns that repeat across the best of them

1. **One object with personality** — Dot, Patch's walkers, Dovetail's pixel twin, Anima's bark. → *the voiceprint name.*
2. **Images living inside type** — Dovetail, Leonardo, Flim. → *inline pills in the hero sentence.*
3. **Scroll as a reading device, not just a trigger** — Patch/Dovetail lists, Joby's window. → *Lately list, desk window.*
4. **One loud texture, everything else quiet** — craft.wild.as pixels, Overmind pixel art. → *packet stream, dither edge.*
5. **Transitions as objects** — Follow.art sheets, Cofounder's grass, BitcoinOS slices. → *tilted Notes sheet, pixel edge.*
6. **Play that rewards attention** — Cofounder's word search, Anima's cursor circle, Flim's search. → *hello marquee, archive search, the terminal.*

## Where each idea landed

The site's language is bone, ink and one chartreuse signal colour; Geist with a
single serif-italic word per headline; Geist Mono for labels. Ideas from the
study were only kept where they fit that restraint.

| Idea (source) | Component |
|---|---|
| Rolling slot-machine text, bridged button pair (contentarchitecture.dev) | `primitives.tsx` → `RollText`, `LinkedButtons` |
| Images set inside the headline (Dovetail, Leonardo) | `hero.tsx` → `Pill` |
| Scroll-lit list (Patch, Dovetail) | `lately.tsx` |
| Pixel packet river, pointer-reactive (craft.wild.as, Overmind) | `packet-stream.tsx` |
| Cover follows the cursor over the index; searchable archive (Flim) | `work.tsx` |
| Window grows to full bleed on scroll (Joby) | `desk.tsx` |
| Dark sheet arrives at an angle (Follow.art, BitcoinOS) | `notes.tsx` |
| Pixel dither between sections (Cofounder, Overmind) | `footer.tsx` → `DitherEdge` |
| Marquee with a cursor disc (Anima) | `footer.tsx` → `HelloMarquee` |

## Deliberately not used

- Mascots, stickers, hand-lettering and pastel palettes (Cloudstudio, Patch,
  Craft.do): charming on their own sites, too playful for this one.
- Full 3D worlds (BitcoinOS, Leonardo's tunnel): heavy, and the voiceprint hero
  already carries the page.
- Physics piles (Patch, Flim) and sound (Cloudstudio, Overmind).
