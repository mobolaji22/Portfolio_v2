// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core for axe.mjs) installed outside this repo; Chromium path as in the file. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
import fs from "node:fs";
const axeSrc = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const out = [];
async function run(p, label) {
  await p.evaluate(axeSrc);
  const r = await p.evaluate(async () => await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }));
  const v = r.violations.map((x) => ({ id: x.id, impact: x.impact, n: x.nodes.length, sample: x.nodes[0].target.join(" ").slice(0, 80), help: x.help }));
  out.push({ label, violations: v, passes: r.passes.length, incomplete: r.incomplete.map((x) => x.id) });
}
for (const theme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3100/", { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  await run(p, `home ${theme} generated`);
  await p.click("[data-testid=primary]"); await p.waitForTimeout(2300); await run(p, `home ${theme} checked`);
  await p.click("[data-testid=primary]"); await p.waitForTimeout(1700); await run(p, `home ${theme} designed`);
  await p.click(".note-btn >> nth=4"); await p.waitForTimeout(100); await p.click(".note-btn >> nth=4"); await p.waitForTimeout(100); await run(p, `home ${theme} designed + states preview loading`);
  for (const path of ["/work/arsididi-admin", "/work/arsididi-student", "/work/command-center", "/work/cake-studio", "/work/payments-webhooks", "/nope"]) {
    await p.goto("http://localhost:3100" + path, { waitUntil: "networkidle" }); await run(p, `${path} ${theme}`);
  }
  await ctx.close();
}
await b.close();
for (const o of out) console.log(o.label, "->", o.violations.length ? JSON.stringify(o.violations) : "no violations", "| incomplete:", o.incomplete.join(","));
