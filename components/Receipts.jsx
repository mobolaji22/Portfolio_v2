import Section from "./Section";
import TagChips, { TagChip } from "./TagChips";
import TagLens from "./TagLens";
import ExternalLink from "./ExternalLink";
import { c, typo } from "@/lib/content";
import { evidenceUrl, tagsFor, TAG_ORDER, tagLabel } from "@/lib/claims";

// `counts` is computed in app/page.js from the same units the lens filters (N8).
export default function Receipts({ counts }) {
  const L = c.receiptsLegend;
  const options = [{ key: "all", label: L.filter.all }, ...TAG_ORDER.map((k) => ({ key: k, label: tagLabel(k) }))];
  return (
    <Section id="check-it-yourself">
      <h2 className="t-h2">{typo(L.heading)}</h2>
      <p className="t-lead lead-measure mt-4">{typo(L.lead)}</p>
      <div className="grid-12 mt-10 gap-y-8">
        {TAG_ORDER.map((k) => (
          <div key={k} className="col-span-4">
            <TagChip tag={k} />
            <p className="t-body-sm mt-3 text-ink-2">{typo(L.tags[k].gloss)}</p>
          </div>
        ))}
      </div>
      <p className="eyebrow mt-8">{typo(L.generatedNote)}</p>
      <TagLens label={L.filter.label} options={options.map((o) => ({ ...o, label: typo(o.label) }))} counts={counts} countTemplate={L.filter.resultCount} emptyText={typo(L.filter.empty)} />

      <ol className="mt-12 border-b border-rule" data-testid="receipts">
        {c.receipts.map((r, i) => {
          const url = evidenceUrl(r.claims[0]);
          return (
            <li key={r.id} className="ledger-row grid-12 items-start gap-y-3" data-testid={`rc-${i + 1}`}>
              <span className="idx col-span-4 md:col-span-1">{r.id}</span>
              <div className="col-span-4 md:col-span-7 md:col-start-2">
                <h3 className="t-h3">{typo(r.title)}</h3>
                <p className="t-body-sm mt-2 text-ink-2 prose-measure">{typo(r.text)}</p>
              </div>
              <div className="col-span-4 flex flex-col items-start gap-3 md:col-span-4 md:col-start-9">
                {url && <ExternalLink href={url} className="link font-mono text-[.8125rem] mono-break">{typo(r.linkLabel)}</ExternalLink>}
                <TagChips claims={r.claims} link={false} />
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
export { tagsFor };
