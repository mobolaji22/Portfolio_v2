// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core where used) installed outside this repo. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
import fs from "node:fs";
const content = JSON.parse(fs.readFileSync("./content/site-content.json", "utf8"));
const claims = new Map(content.claims.map((c) => [c.id, c]));
const KEY = { "Check it yourself": "check", Shown: "shown", "My word": "word" };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const out = [];
const norm = (s) => s.replace(/'/g, "’").replace(/\s+/g, " ").trim();
// AC9: strings by key appear on their page
await p.goto("http://localhost:3100/", { waitUntil: "networkidle" });
const text = norm(await p.evaluate(() => document.documentElement.textContent));
const must = [content.hero.eyebrow, content.hero.h1, content.hero.sub, content.hero.definition, ...content.availability.lines.map((l) => l.text), content.bridge.heading, content.bridge.body,
  content.receiptsLegend.heading, content.receiptsLegend.lead, content.receiptsLegend.generatedNote, ...Object.values(content.receiptsLegend.tags).flatMap((t) => [t.label, t.gloss]),
  ...content.receipts.flatMap((r) => [r.title, r.text, r.linkLabel]), content.work.heading, content.work.lead, content.howIWork.heading, ...content.howIWork.items.map((i) => i.title),
  content.howIWork.items[0].text.owner, content.howIWork.items[1].text, content.about.heading, content.about.paragraphs[0].text, content.aiAuthorship.A.about, content.aiAuthorship.A.footer, content.about.paragraphs[2].text.named,
  content.contact.heading, content.contact.lead, content.contact.freelanceDoor.line, content.contact.freelanceDoor.scope, content.contact.helper, content.footer.tagsNote, content.footer.accessibility,
  content.shortEntries[0].title, content.shortEntries[0].text, content.demo.credit.owner, content.demo.designCredit.owner, content.demo.noJs.body.replace(/reading 0 where the source holds 412/, "reading 0 where the source holds 412")];
const miss = must.filter((s) => !text.includes(norm(s)));
out.push(`AC9 home: ${must.length} keyed strings checked, ${miss.length} missing${miss.length ? ": " + JSON.stringify(miss.map((m) => m.slice(0, 50))) : ""}`);
// case pages: every stage string present
for (const s of content.caseStudies) {
  await p.goto(`http://localhost:3100/work/${s.slug}`, { waitUntil: "networkidle" });
  const t = norm(await p.evaluate(() => document.documentElement.textContent));
  const named = (v) => (v && v.named !== undefined ? (s.id === "cake-studio" ? v.unnamed : v.named) : v);
  const strs = [named(s.title), named(s.role).text, s.intro, s.lookedFinished?.text, ...s.itWasnt.map((x) => x.text), s.itWasntNote?.text, ...s.whatIDid.owner.map((x) => x.text), s.whatItNeeded.text, s.stack?.text, s.screens?.text, s.tests?.text, s.pwa?.text, s.checkable?.text].filter(Boolean);
  const m = strs.filter((x) => !t.includes(norm(x)));
  const limit = s.limit?.text ? "LIMIT TEXT PRESENT" : "";
  out.push(`AC9 /work/${s.slug}: ${strs.length} strings, ${m.length} missing ${m.length ? JSON.stringify(m.map((x) => x.slice(0, 40))) : ""} ${limit}`);
}
// AC10: tags in markup equal claims
await p.goto("http://localhost:3100/", { waitUntil: "networkidle" });
const chips = await p.evaluate(() => [...document.querySelectorAll("[data-claims]")].map((e) => ({ claims: e.dataset.claims.split(" "), tags: [...e.querySelectorAll("[data-tag]")].map((c) => c.dataset.tag) })));
let bad = 0, n = 0;
for (const u of chips) { const exp = new Set(); for (const id of u.claims) { const c = claims.get(id); if (!c) { bad++; continue; } if (c.tag && c.shippable !== "blocked") exp.add(KEY[c.tag]); } n++; if ([...exp].sort().join() !== [...u.tags].sort().join()) { bad++; out.push("  mismatch " + u.claims + " exp " + [...exp] + " got " + u.tags); } }
out.push(`AC10 chip groups: ${n} checked, ${bad} mismatches; lens count text: ${await p.textContent("[data-testid=lens-count]")}; hand-typed tag strings in components: ${(await import("node:child_process")).execSync("grep -rn \"'My word'\\|\\\"My word\\\"\\|'Shown'\\|\\\"Shown\\\"\" ./components ./app ./lib --include=*.js --include=*.jsx | wc -l").toString().trim()}`);
console.log(out.join("\n"));
await b.close();
