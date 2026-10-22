// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core for axe.mjs) installed outside this repo; Chromium path as in the file. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
import fs from "node:fs";
const B = "http://localhost:3100";
const pages = ["/", "/work/arsididi-admin", "/work/arsididi-student", "/work/command-center", "/work/cake-studio", "/work/payments-webhooks", "/nope"];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const bad = [];
const checks = [
  ["banned word", /passionate|honest(?!ly)|crafting|crafted with|seamless|cutting-edge|world-class/i],
  ["placeholder", /lorem|coming soon|\bTODO\b|(?<!local )placeholders?(?! instead)|undefined|\bNaN\b|\[object|\{\w+\}/i],
  ["credential", /password|passwd|secret|api[_-]?key|bearer |sk_live|sk_test|AKIA[0-9A-Z]{8}|BEGIN (RSA|PRIVATE)/i],
  ["old stats/testimonials", /\b(3|10|1)\+\s*(years|projects|clients)|testimonial|years of experience/i],
  ["blocked name", /Velvetii|CL-49/],
  ["internal", /_meta|claims-internal|draft_pending_owner|staging/i],
];
for (const path of pages) {
  await p.goto(B + path, { waitUntil: "networkidle" }); await p.waitForTimeout(600);
  const html = await p.content();
  const text = await p.evaluate(() => document.body.innerText + "\n" + [...document.querySelectorAll("[aria-label],[alt],[title]")].map((e) => e.getAttribute("aria-label") || e.getAttribute("alt") || e.getAttribute("title")).join("\n"));
  for (const [name, re] of checks) {
    const m = (text + "\n" + html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")).match(re);
    if (m) bad.push(`${path}: ${name}: ${m[0]}`);
  }
  if (path === "/") {
    // forbidden demo figures in every state (visible text + aria)
    const figs = async (label) => {
      const t = await p.evaluate(() => { const d = document.querySelector("#finishing-demo"); return d.innerText + "\n" + [...d.querySelectorAll("[aria-label]")].map((e) => e.getAttribute("aria-label")).join("\n"); });
      const hits = t.match(/(?<![\d.])(11|12|16|34|33\.9)(?![\d.])/g);
      if (hits) bad.push(`demo ${label}: forbidden figure(s) ${[...new Set(hits)]}`);
      return t.length;
    };
    await figs("generated");
    await p.click("[data-testid=primary]"); await p.waitForTimeout(2300); await figs("checked");
    await p.click("[data-testid=primary]"); await p.waitForTimeout(1700); await figs("designed");
    for (let i = 0; i < 5; i++) { await p.click(".note-btn >> nth=4"); await p.waitForTimeout(80); await figs("states preview " + i); }
    // fixture file
    const fx = JSON.stringify(JSON.parse(fs.readFileSync("./content/site-content.json")).demo.fixture);
    if (/(?<![\d.])(11|12|16|34|33\.9)(?![\d.])/.test(fx)) bad.push("fixture contains a forbidden figure");
  }
}
// bundle scan: shipped static files
const dir = "./.next/static";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(d + "/" + e.name) : [d + "/" + e.name]));
for (const f of walk(dir).filter((f) => /\.(js|css)$/.test(f))) {
  const t = fs.readFileSync(f, "utf8");
  for (const [name, re] of [["bundle: blocked name", /Velvetii|CL-49/], ["bundle: internal key", /claims-internal|_meta"|draft_pending_owner/], ["bundle: external url", /https?:\/\/(cdn|unpkg|cdnjs)/]]) { const m = t.match(re); if (m) bad.push(`${f.replace(dir, "")}: ${name}: ${m[0]}`); }
}
console.log(bad.length ? "FINDINGS:\n" + bad.join("\n") : "content scan: zero hits across " + pages.length + " pages, 5 demo views, fixture and bundle");
await b.close();
