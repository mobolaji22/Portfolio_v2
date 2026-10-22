import Section from "./Section";
import TagChips from "./TagChips";
import { c, typo, byVoice } from "@/lib/content";
import { tagAttr } from "@/lib/units";

export default function HowIWork() {
  return (
    <Section id="how-i-work" lens>
      <h2 className="t-h2" data-lens-heading>{typo(c.howIWork.heading)}</h2>
      <ol className="mt-10 grid gap-x-6 md:mt-14 md:grid-cols-2" data-testid="how-list">
        {c.howIWork.items.map((it, i) => (
          <li key={it.id} className="border-t border-rule py-8" data-lens-unit data-tags={tagAttr(it.claims)} data-testid={`how-${i + 1}`}>
            <span className="idx">{i + 1}</span>
            <h3 className="t-h3 mt-2">{typo(it.title)}</h3>
            <p className="t-body prose-measure mt-3">{typo(byVoice(it.text))}</p>
            <TagChips claims={it.claims} className="chips mt-4" />
          </li>
        ))}
      </ol>
    </Section>
  );
}
