import Section from "./Section";
import TagChips from "./TagChips";
import { c, typo } from "@/lib/content";

export default function Bridge() {
  return (
    <Section id="bridge" band>
      <div className="grid-12 gap-y-6">
        <h2 className="t-h2 col-span-4 md:col-span-5">{typo(c.bridge.heading)}</h2>
        <div className="col-span-4 md:col-span-6 md:col-start-7">
          <TagChips claims={c.bridge.claims} />
          <p className="t-lead lead-measure mt-4">{typo(c.bridge.body)}</p>
        </div>
      </div>
    </Section>
  );
}
