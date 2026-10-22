import Demo from "./demo/Demo";
import MailLink from "./MailLink";
import TagChips from "./TagChips";
import { c, typo, settings } from "@/lib/content";

export default function Hero() {
  const [s1, s2] = c.hero.h1.split(/(?<=\.)\s+/);
  const sub = c.hero.sub;
  // the word "finish" carries the mark (R2); the text is unchanged
  const subParts = sub.split(/(finish)/);
  const lines = c.availability.lines.concat(settings.showAvFour && c.availability.av4?.text ? [{ id: "AV-4", text: c.availability.av4.text, claims: [] }] : []);
  const heroClaims = [...c.hero.claims, ...c.availability.lines.flatMap((l) => l.claims)];
  return (
    <section id="top" className="page pb-16 pt-8 md:pb-24 md:pt-12 xl:pb-28 xl:pt-12">
      <p className="eyebrow">{typo(c.hero.eyebrow)}</p>
      <h1 className="t-display mt-3 xl:max-w-[996px]" data-testid="h1">
        <span className="inline text-balance md:block">{typo(s1)} </span>
        <span className="inline text-balance md:block">{typo(s2)}</span>
      </h1>
      <p className="t-h2 mt-3 !font-normal md:mt-4" data-testid="sub">
        {subParts.map((p, i) => p === "finish" ? <mark key={i} className="mk mk-hero">{p}</mark> : <span key={i}>{typo(p)}</span>)}
      </p>
      <div className="mt-8 md:mt-10 xl:grid xl:grid-cols-12 xl:grid-rows-[auto_1fr] xl:gap-x-6">
        <p className="t-lead lead-measure text-ink-2 xl:col-span-4 xl:col-start-1 xl:row-start-1 xl:pr-4">{typo(c.hero.definition)}</p>
        <div className="mt-8 xl:col-span-8 xl:col-start-5 xl:row-span-2 xl:row-start-1 xl:mt-0">
          <Demo />
        </div>
        <div className="mt-10 xl:col-span-4 xl:col-start-1 xl:row-start-2 xl:mt-8 xl:self-start xl:pr-4">
          <ul className="grid gap-0 md:grid-cols-3 md:gap-6 xl:grid-cols-1 xl:gap-0">
            {lines.map((l) => (
              <li key={l.id} className="t-ui border-t border-rule py-3">{typo(l.text)}</li>
            ))}
          </ul>
          <div className="mt-4"><TagChips claims={heroClaims} /></div>
          <div className="mt-6"><MailLink className="btn btn-primary" label={c.contact.button} ariaLabel={c.contact.buttonAccessibleName} /></div>
        </div>
      </div>
    </section>
  );
}
