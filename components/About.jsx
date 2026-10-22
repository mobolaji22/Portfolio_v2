import Image from "next/image";
import Section from "./Section";
import TagChips from "./TagChips";
import { c, typo } from "@/lib/content";
import { aboutParagraphs, tagAttr } from "@/lib/units";

export default function About() {
  const ps = aboutParagraphs();
  return (
    <Section id="about" lens>
      <h2 className="t-h2" data-lens-heading>{typo(c.about.heading)}</h2>
      <div className="grid-12 mt-10 gap-y-10 md:mt-14">
        <div className="col-span-4 md:col-span-7">
          {ps.map((p, i) => (
            <div key={i} className="mb-8" data-lens-unit data-tags={tagAttr(p.claims)} data-testid={`about-${i + 1}`}>
              <p className={`${i === 0 ? "t-lead" : "t-body"} prose-measure`}>{typo(p.text)}</p>
              <TagChips claims={p.claims} className="chips mt-3" />
            </div>
          ))}
        </div>
        <figure className="col-span-4 max-w-[280px] md:col-span-4 md:col-start-9 md:max-w-none">
          <div className="portrait">
            <Image src="/images/profile/developer-pic.jpg" alt={typo(c.about.portrait.alt)} width={2448} height={2448} sizes="(min-width: 768px) 320px, 280px" className="portrait-img" />
          </div>
          <figcaption className="eyebrow mt-3">{typo(c.about.portrait.caption)}</figcaption>
        </figure>
      </div>
    </Section>
  );
}
