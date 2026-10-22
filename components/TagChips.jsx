import { ArrowUpRight, RingDot, QuoteIcon } from "./Icons";
import { c, typo } from "@/lib/content";
import { TAG_ORDER, tagsFor, checkUrl } from "@/lib/claims";

const GLYPH = { check: ArrowUpRight, shown: RingDot, word: QuoteIcon };

// One chip (spec 3.5). Name = hidden prefix + label + hidden gloss, from the content keys.
export function TagChip({ tag, href }) {
  const t = c.receiptsLegend.tags[tag];
  const G = GLYPH[tag];
  const inner = (
    <>
      <G />
      <span aria-hidden="true">{typo(t.label)}</span>
      <span className="sr-only">{typo(t.accessibleName)}</span>
    </>
  );
  const cls = `chip chip-${tag}`;
  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer" data-tag={tag}>
        {inner}
        <span className="sr-only"> {typo(c.states.externalLinkSuffix)}</span>
      </a>
    );
  }
  return <span className={cls} data-tag={tag}>{inner}</span>;
}

// The chips of a unit: one per distinct tag of its shippable claims, generated (N7).
export default function TagChips({ claims, className = "chips", link = true }) {
  const tags = tagsFor(claims);
  if (!tags.length) return null;
  const url = link ? checkUrl(claims) : null;
  return (
    <div className={className} data-claims={claims.join(" ")}>
      {tags.map((t) => <TagChip key={t} tag={t} href={t === "check" ? url : null} />)}
    </div>
  );
}
export { TAG_ORDER };
