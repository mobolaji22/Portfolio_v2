// Writes content/site-content.json from Content's site-content.json, stripped of everything
// that must not ship (spec N6): metadata keys, notes, rules, internal sources, claim text,
// the blocked cake-studio name and claim CL-49.
//
// usage: node scripts/sync-content.mjs <path-to-site-content.json>
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/sync-content.mjs <path-to-site-content.json>");
  process.exit(1);
}
const input = JSON.parse(fs.readFileSync(src, "utf8"));

const DROP_KEY = /(^_meta$|Note$|^note$|[Rr]ule$|^rules$|^reason$|^source$|^visualBrief$|^excerpt$|^forbidden$|^dryLineFlag$|^SAMPLE$|^avoid$|^how$|^absentSlots$|^namedVariant|^src$)/;
// Four keys end in "Note" but are rendered copy, not notes to the builder (friction T1.6-F2).
const KEEP_KEY = new Set(["contrastNote", "itWasntNote", "generatedNote", "tagsNote"]);
const BLOCKED_CLAIMS = new Set(["CL-49"]);

function strip(node, trail) {
  if (Array.isArray(node)) return node.map((n) => strip(n, trail));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      // the fixture's data object is called "source" and must stay
      const keepSource = k === "source" && trail.join(".") === "demo.fixture";
      if (DROP_KEY.test(k) && !keepSource && !KEEP_KEY.has(k)) continue;
      out[k] = strip(v, [...trail, k]);
    }
    return out;
  }
  return node;
}

const out = strip(input, []);

// Strings that exist only inside visualBrief fields (which are builder notes and are stripped), but that
// Design's spec 7 tells Engineering to reuse as figure labels. Extracted by pattern, never retyped.
const brief = (id) => input.caseStudies.find((s) => s.id === id).visualBrief;
const cap = brief("cake-studio").match(/captioned '([^']+)'/);
const pay = brief("payments-webhooks").match(/'(Awaiting deposit)' and '(Deposit paid)'/);
if (!cap || !pay) throw new Error("visualBrief no longer carries the expected strings");
out.visuals = {
  // spec 14 item 2: not a content key; the string as written in OUTPUT-FOR-DESIGN section 5
  demonstrationData: "Demonstration data",
  cakeCaption: cap[1],
  paymentsBefore: pay[1],
  paymentsAfter: pay[2],
  paymentsRow: "Booking",
};

// claims: keep only what the build needs to tag and link. No claim text, no internal guards.
out.claims = input.claims.map((c) => {
  const keep = { id: c.id, tag: c.tag ?? null, shippable: c.shippable, evidenceUrl: c.evidenceUrl ?? null };
  if (c.tagUpgrade) keep.tagUpgrade = c.tagUpgrade;
  return keep;
}).filter((c) => !BLOCKED_CLAIMS.has(c.id));

// the cake studio: the named variant is blocked while settings.velvetiiNamed is false
if (!input.settings.velvetiiNamed) {
  for (const s of out.caseStudies) {
    if (s.id !== "cake-studio") continue;
    const unname = (o) => {
      if (Array.isArray(o)) return o.map(unname);
      if (o && typeof o === "object") {
        if ("named" in o && "unnamed" in o) {
          const u = unname(o.unnamed);
          return { named: u, unnamed: u };
        }
        return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, unname(v)]));
      }
      return o;
    };
    Object.assign(s, unname(s));
  }
}
// belt and braces: remove any claim id that is blocked from every claims array
const scrub = (o) => {
  if (Array.isArray(o)) return o.map(scrub);
  if (o && typeof o === "object") {
    return Object.fromEntries(
      Object.entries(o).map(([k, v]) => [
        k,
        k === "claims" && Array.isArray(v) && v.every((x) => typeof x === "string")
          ? v.filter((id) => !BLOCKED_CLAIMS.has(id))
          : scrub(v),
      ])
    );
  }
  return o;
};
const final = scrub(out);

// a Limit that is still a draft must not be in the bundle at all (spec 6, D-17): real or absent
for (const s of final.caseStudies) {
  if (s.limit && s.limit.status === "draft_pending_owner") s.limit = { status: s.limit.status, text: null, claims: [] };
}
// the Kobo Lab is off (settings.showKoboLab): its copy does not ship
if (!final.settings.showKoboLab) delete final.koboLab;

// the owner's address must come from configuration, not from copy (spec 4.7): keep the key,
// the build reads CONTACT_EMAIL first and this value as the documented default.
const dest = path.join(process.cwd(), "content", "site-content.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(final, null, 1) + "\n");
console.log("wrote", dest, fs.statSync(dest).size, "bytes");
