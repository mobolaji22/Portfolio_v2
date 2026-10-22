import Section from "./Section";
import TagChips from "./TagChips";
import ExternalLink from "./ExternalLink";
import Link from "next/link";
import { ArrowUpRight } from "./Icons";
import { c, typo, studies, resolveStudy } from "@/lib/content";
import { evidenceUrl } from "@/lib/claims";
import { workRowClaims, tagAttr } from "@/lib/units";

export default function Work() {
  const list = studies().map((s, i) => ({ s: resolveStudy(s), i, raw: s }));
  const L = c.work.labels;
  return (
    <Section id="work" lens>
      <div data-lens-heading>
        <h2 className="t-h2">{typo(c.work.heading)}</h2>
        <p className="t-lead lead-measure mt-4">{typo(c.work.lead)}</p>
      </div>
      <ol className="mt-10 md:mt-14" data-testid="work-index">
        {list.map(({ s, i, raw }) => {
          const claims = workRowClaims(raw);
          return (
            <li key={s.id} data-lens-unit data-tags={tagAttr(claims)} data-testid={`wr-${s.id}`}>
              <div className="work-row grid-12 gap-y-4">
                <span className="idx col-span-4 lg:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <div className="col-span-4 lg:col-span-5">
                  <p className="eyebrow">{typo(s.kicker)}</p>
                  <h3 className="t-statement mt-2">
                    <Link href={`/work/${s.slug}`} className="stretch"><span className="row-title">{typo(s.title)}</span></Link>
                  </h3>
                  <p className="t-body-sm mt-2 text-ink-2 prose-measure">{typo(s.role.text)}</p>
                  <TagChips claims={claims} link={false} className="chips mt-4" />
                </div>
                {s.lookedFinished && s.itWasnt?.[0] && (
                  <div className="col-span-4 grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:col-start-7">
                    <div>
                      <p className="eyebrow">{typo(L.looked)}</p>
                      <p className="t-body-sm mt-1">{typo(s.lookedFinished.text)}</p>
                    </div>
                    <div>
                      <p className="eyebrow">{typo(L.wasnt)}</p>
                      <p className="t-body-sm mt-1">{typo(s.itWasnt[0].text)}</p>
                    </div>
                  </div>
                )}
                <ArrowUpRight className="hidden h-6 w-6 justify-self-end lg:col-span-1 lg:block" />
              </div>
            </li>
          );
        })}
      </ol>
      {c.shortEntries.map((e) => (
        <div key={e.id} className="border-t border-rule py-8" data-lens-unit data-tags={tagAttr(e.claims)} data-testid={`short-${e.id}`}>
          <div className="grid-12 gap-y-4">
            <div className="col-span-4 md:col-span-3 md:col-start-2">
              <h3 className="t-h3">{typo(e.title)}</h3>
            </div>
            <div className="col-span-4 md:col-span-5">
              <p className="t-body-sm prose-measure">{typo(e.text)}</p>
              <p className="mt-3"><ExternalLink href={evidenceUrl("CL-12")} className="link tl font-mono text-[.8125rem]">{typo(e.linkLabel)}</ExternalLink></p>
            </div>
            <div className="col-span-4 md:col-span-3"><TagChips claims={e.claims} /></div>
          </div>
        </div>
      ))}
    </Section>
  );
}
