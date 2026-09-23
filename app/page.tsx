import { About } from "@/components/about";
import { Cursor } from "@/components/chrome";
import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Notes } from "@/components/notes";
import { Papers } from "@/components/papers";
import { Shell } from "@/components/shell";
import { Work } from "@/components/work";
import { getAssets } from "@/lib/assets";

/* The packet stream and the desk window (components/packet-stream.tsx,
   components/desk.tsx) are kept but left off the page: decoration only,
   and the page reads calmer without them. */
export default function Page() {
  const assets = getAssets();
  return (
    <>
      <Nav />
      <main>
        <Hero assets={assets} />
        <About />
        <Experience />
        <Work covers={assets.covers} />
        <Notes />
        <Papers />
        <Education />
        <Shell />
        <Faq />
      </main>
      <Footer />
      <Cursor />
    </>
  );
}
