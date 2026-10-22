import { notFound } from "next/navigation";
import Link from "next/link";
import Section from "@/components/Section";
import TagChips from "@/components/TagChips";
import CaseFigure from "@/components/CaseFigure";
import ExternalLink from "@/components/ExternalLink";
import MailLink from "@/components/MailLink";
import { c, typo, studies, studyBySlug, resolveStudy } from "@/lib/content";
import { evidenceUrl } from "@/lib/claims";

export function generateStaticParams() {
  return studies().map((s) => ({ slug: s.slug }));
}
export function generateMetadata({ params }) {
  const s = studyBySlug(params.slug);
  if (!s) return {};
  const m = c.meta.pages[s.slug];
  return {
    title: m.title, description: typo(m.description),
    alternates: { canonical: `/work/${s.slug}` },
    openGraph: { title: typo(m.title), description: typo(m.description), url: `/work/${s.slug}`, type: "article" },
  };
}

const ids = (list = []) => list.flatMap((x) => x.claims || []);

// every occurrence of "finished" carries the mark (R2); the text is unchanged
function Statement({ text }) {
  return <p className="t-statement prose-measure">{text.split(/(finished)/).map((p, i) => (p === "finished" ? <mark key={i} className="mk">{p}</mark> : <span key={i}>{typo(p)}</span>))}</p>;
}
function Stage({ label, claims, children, testid }) {
  return (
    <div className="grid-12 gap-y-4 border-t border-rule py-10" data-testid={testid}>
      <div className="col-span-4 md:col-span-3">
        {label && <h3 className="t-h3">{typo(label)}</h3>}
        <TagChips claims={claims} className="unit-gutter mt-3" />
      </div>
      <div className="col-span-4 md:col-span-7 md:col-start-4">{children}</div>
    </div>
  );
}
function Rows({ items }) {
  return (
    <ol className="grid">
      {items.map((it, i) => (
        <li key={i} className={`grid grid-cols-[2rem_1fr] gap-x-3 py-3 ${i ? "border-t border-rule" : ""}`}>
          <span className="idx pt-1.5">{i + 1}</span>
          <p className="t-body prose-measure">{typo(it.text)}</p>
        </li>
      ))}
    </ol>
  );
}

export default function CasePage({ params }) {
  const raw = studyBySlug(params.slug);
  if (!raw) notFound();
  const s = resolveStudy(raw);
  const L = c.work.labels;
  const all = studies();
  const idx = all.findIndex((x) => x.id === raw.id);
  const prev = all[idx - 1], next = all[idx + 1];
  const nameClaims = [...ids([s.stack, s.screens, s.tests, s.pwa].filter(Boolean))];
  const names = [
    s.stack?.text && [L.stack, s.stack.text],
    s.screens?.text && [L.screens, s.screens.text],
    s.tests?.text && [null, s.tests.text],
    s.pwa?.text && [null, s.pwa.text],
  ].filter(Boolean);
  return (
    <main id="main" className="page pb-16 pt-8 md:pt-12">
      <p className="eyebrow"><Link href="/#work" className="link">{typo(c.work.heading)}</Link></p>
      <p className="eyebrow mt-6" data-testid="kicker">{typo(s.kicker)}</p>
      <h1 className="t-case-title mt-3 max-w-[22ch] text-balance md:max-w-[1000px]" data-testid="case-h1">{typo(s.title)}</h1>
      <p className="t-lead mt-6 max-w-[62ch]" data-testid="case-role">{typo(s.role.text)}</p>
      <p className="t-body mt-4 text-ink-2 prose-measure">{typo(s.intro)}</p>
      <div className="mt-10 md:mt-14"><CaseFigure study={s} /></div>

      <div className="mt-12 md:mt-16">
        {/* stages are h3 (spec N9); a structural h2 keeps the outline from skipping a level. Existing string, not new copy. */}
        <h2 className="sr-only">{typo(c.work.lead)}</h2>
        {s.lookedFinished && (
          <Stage label={L.looked} claims={s.lookedFinished.claims} testid="st-looked">
            <p className="t-lead prose-measure">{typo(s.lookedFinished.text)}</p>
          </Stage>
        )}
        {s.itWasnt?.length > 0 && (
          <Stage label={L.wasnt} claims={[...ids(s.itWasnt), ...(s.itWasntNote?.claims || [])]} testid="st-wasnt">
            <Rows items={s.itWasnt} />
            {s.itWasntNote?.text && <p className="note mt-6">{typo(s.itWasntNote.text)}</p>}
          </Stage>
        )}
        {s.whatIDidList?.length > 0 && (
          <Stage label={L.did} claims={ids(s.whatIDidList)} testid="st-did"><Rows items={s.whatIDidList} /></Stage>
        )}
        {s.whatItNeeded && (
          <Stage label={L.needed} claims={s.whatItNeeded.claims} testid="st-needed"><Statement text={s.whatItNeeded.text} /></Stage>
        )}
        {names.length > 0 && (
          <Stage label={null} claims={nameClaims} testid="case-names">
            <dl className="grid gap-4">
              {names.map(([k, v], i) => (
                <div key={i}>
                  {k && <dt className="eyebrow">{typo(k)}</dt>}
                  <dd className="t-body-sm mt-1 text-ink-2 prose-measure">{typo(v)}</dd>
                </div>
              ))}
            </dl>
          </Stage>
        )}
        {s.checkable && (
          <Stage label={null} claims={s.checkable.claims} testid="case-checkable">
            <p className="t-body prose-measure">{typo(s.checkable.text)}</p>
            <ul className="mt-4 grid gap-2">
              {c.receipts.map((r) => (
                <li key={r.id} className="flex flex-wrap items-baseline gap-x-4">
                  <span className="idx">{r.id}</span>
                  <ExternalLink href={evidenceUrl(r.claims[0])} className="link tl font-mono text-[.8125rem] mono-break">{typo(r.linkLabel)}</ExternalLink>
                </li>
              ))}
            </ul>
          </Stage>
        )}
        {s.limitShown && (
          <Stage label={L.limit} claims={s.limitShown.claims} testid="case-limit">
            <p className="t-body prose-measure border-l-[3px] border-ink pl-4">{typo(s.limitShown.text)}</p>
          </Stage>
        )}
      </div>

      <nav aria-label={typo(c.work.heading)} className="mt-6 grid gap-4 border-t border-rule pt-8 md:grid-cols-3" data-testid="case-nav">
        <div>{prev && <Link rel="prev" href={`/work/${prev.slug}`} className="link t-statement">{typo(resolveStudy(prev).title)}</Link>}</div>
        <div className="md:text-center"><Link href="/#finishing-demo" className="btn btn-secondary">{typo(c.notFound.link)}</Link></div>
        <div className="md:text-right">{next && <Link rel="next" href={`/work/${next.slug}`} className="link t-statement">{typo(resolveStudy(next).title)}</Link>}</div>
      </nav>
    </main>
  );
}
