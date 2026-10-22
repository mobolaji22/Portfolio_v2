import Hero from "@/components/Hero";
import Bridge from "@/components/Bridge";
import Receipts from "@/components/Receipts";
import Work from "@/components/Work";
import HowIWork from "@/components/HowIWork";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { c } from "@/lib/content";
import { countByTag } from "@/lib/claims";
import { lensUnits } from "@/lib/units";
import { absolute } from "@/lib/site";

export default function Home() {
  const counts = countByTag(lensUnits());
  // JSON-LD is built from the content file: only registered claims' values, no author/worksFor/email (meta.jsonLd rules)
  const j = c.meta.jsonLd;
  const person = { ...j.mainEntity, url: absolute("/") };
  if (!person.image) delete person.image;
  const ld = { ...j, url: absolute("/"), mainEntity: person };
  delete ld.claims;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <main id="main">
        <Hero />
        <Bridge />
        <Receipts counts={counts} />
        <Work />
        <HowIWork />
        <About />
        <Contact />
      </main>
    </>
  );
}
