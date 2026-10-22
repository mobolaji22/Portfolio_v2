import { c } from "./content";

// Tags are generated from the claims list (N7). Nothing here reads a hand-typed tag.
const TAG_KEY = { "Check it yourself": "check", Shown: "shown", "My word": "word" };
export const TAG_ORDER = ["check", "shown", "word"];

const map = new Map(c.claims.map((x) => [x.id, x]));
export const claim = (id) => {
  const x = map.get(id);
  if (!x) throw new Error(`unknown claim id ${id}`); // AC10: no unknown claim id
  return x;
};
const rendersTag = (x) => x.tag && (x.shippable === "shippable" || x.shippable === "shippable_with_approval");

// distinct tags of the shippable claims, in legend order
export function tagsFor(ids = []) {
  const set = new Set();
  for (const id of ids) {
    const x = claim(id);
    if (rendersTag(x)) set.add(TAG_KEY[x.tag]);
  }
  return TAG_ORDER.filter((k) => set.has(k));
}
// a Check it yourself chip links out only when the unit's check claims share exactly one URL (3.5)
export function checkUrl(ids = []) {
  const urls = new Set();
  for (const id of ids) {
    const x = claim(id);
    if (rendersTag(x) && TAG_KEY[x.tag] === "check" && x.evidenceUrl) urls.add(x.evidenceUrl);
  }
  return urls.size === 1 ? [...urls][0] : null;
}
export const evidenceUrl = (id) => claim(id).evidenceUrl;
export const tagLabel = (key) => c.receiptsLegend.tags[key].label;

// distinct shippable claims carrying each tag across a set of units (N8: computed at build)
export function countByTag(idLists) {
  const per = { check: new Set(), shown: new Set(), word: new Set() };
  for (const ids of idLists) {
    for (const id of ids) {
      const x = claim(id);
      if (rendersTag(x)) per[TAG_KEY[x.tag]].add(id);
    }
  }
  const all = new Set([...per.check, ...per.shown, ...per.word]);
  return { all: all.size, check: per.check.size, shown: per.shown.size, word: per.word.size };
}
