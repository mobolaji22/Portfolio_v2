import Demo from "./demo/Demo";
import MailLink from "./MailLink";
import TagChips from "./TagChips";
import { c, typo, settings } from "@/lib/content";

// From 1100 px the hero is two columns: the argument on the left, the whole demo on the right, so the
// dashboard and the three-state scrubber are on the first screen at 1280 x 800. Below 1100 it stacks (DOM order).
export default function Hero() {
  const [s1, s2] = c.hero.h1.split(/(?<=\.)\s+/);
  const subParts = c.hero.sub.split(/(finish)/);
  const lines = c.availability.lines.concat(settings.showAvFour && c.availability.av4?.text ? [{ id: "AV-4", text: c.availability.av4.text, claims: [] }] : []);
  const heroClaims = [...c.hero.claims, ...c.availability.lines.flatMap((l) => l.claims)];
  return (
    <section id="top" className="page pb-14 pt-6 md:pb-20 md:pt-10 hero:pb-16 hero:pt-6">
      <div className="hero:grid hero:grid-cols-12 hero:gap-x-10 hero:grid-rows-[auto_auto_auto_auto_1fr]">
        <p className="eyebrow hero:col-span-6 hero:col-start-1 hero:row-start-1">{typo(c.hero.eyebrow)}</p>
        <h1 className="t-display mt-3 hero:col-span-6 hero:col-start-1 hero:row-start-2 hero:!text-[clamp(2.75rem,4.7vw,3.75rem)] hero:!leading-[1.03]" data-testid="h1">
          <span className="inline text-balance md:block">{typo(s1)} </span>
          <span className="inline text-balance md:block">{typo(s2)}</span>
        </h1>
        <p className="t-h2 mt-3 !font-normal md:mt-4 hero:col-span-6 hero:col-start-1 hero:row-start-3" data-testid="sub">
          {subParts.map((p, i) => p === "finish" ? <mark key={i} className="mk mk-hero">{p}</mark> : <span key={i}>{typo(p)}</span>)}
        </p>
        <p className="t-lead lead-measure mt-6 text-ink-2 md:mt-8 hero:col-span-5 hero:col-start-1 hero:row-start-4 hero:mt-5">{typo(c.hero.definition)}</p>
        <div className="mt-8 hero:col-span-6 hero:col-start-7 hero:row-span-5 hero:row-start-1 hero:mt-0">
          <Demo />
        </div>
        <div className="mt-10 hero:col-span-5 hero:col-start-1 hero:row-start-5 hero:mt-6 hero:self-start">
          <ul className="grid gap-0 md:grid-cols-3 md:gap-6 hero:grid-cols-1 hero:gap-0">
            {lines.map((l) => (
              <li key={l.id} className="t-ui border-t border-rule py-2.5">{typo(l.text)}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <MailLink className="btn btn-primary" label={c.contact.button} ariaLabel={c.contact.buttonAccessibleName} />
            <TagChips claims={heroClaims} />
          </div>
        </div>
      </div>
    </section>
  );
}
