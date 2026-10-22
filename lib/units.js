import { c, studies, resolveStudy, byVoice, byName } from "./content";
import { tagsFor } from "./claims";

// The claim ids each lensable unit owns: the ids of the strings it displays (handoff MD-03).
export function workRowClaims(study) {
  const r = resolveStudy(study);
  return [...(r.role?.claims || []), ...(r.lookedFinished?.claims || []), ...((r.itWasnt && r.itWasnt[0]?.claims) || [])];
}
export function shortEntryClaims(e) { return e.claims; }
export function howClaims(item) { return item.claims; }
export function aboutParagraphs() {
  return c.about.paragraphs.map((p) => {
    if (p.ref) return { text: c.aiAuthorship[c.settings.aiRung].about, claims: c.aiAuthorship[c.settings.aiRung].claims };
    return { text: byName(p.text), claims: p.claims };
  });
}
export function lensUnits() {
  const lists = [];
  studies().forEach((s) => lists.push(workRowClaims(s)));
  c.shortEntries.forEach((e) => lists.push(e.claims));
  c.howIWork.items.forEach((i) => lists.push(i.claims));
  aboutParagraphs().forEach((p) => lists.push(p.claims));
  c.receipts.forEach((r) => lists.push(r.claims));
  return lists;
}
export const tagAttr = (ids) => tagsFor(ids).join(" ");
export { byVoice };
