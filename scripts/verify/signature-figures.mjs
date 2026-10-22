// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core where used) installed outside this repo. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
import fs from "node:fs";
const axeSrc = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const B = "http://localhost:3100";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const slugs = ["arsididi-admin", "arsididi-student", "cake-studio", "payments-webhooks", "command-center"];
const keysets = {
  "arsididi-admin": async (p) => { await p.focus("[role=radio][aria-checked=true]"); await p.keyboard.press("ArrowRight"); },
  "arsididi-student": async (p) => { await p.focus("[role=radiogroup] >> nth=0 >> [role=radio][aria-checked=true]"); await p.keyboard.press("ArrowRight"); },
  "cake-studio": async (p) => { await p.focus("[role=switch]"); await p.keyboard.press("Space"); },
  "payments-webhooks": async (p) => { await p.focus("button:has-text('Send')"); await p.keyboard.press("Enter"); },
  "command-center": async (p) => { await p.focus("[role=switch] >> nth=1"); await p.keyboard.press("Space"); },
};
const out = [];
for (const slug of slugs) {
  // keyboard + live + axe (JS)
  let ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); let p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(`${B}/work/${slug}`, { waitUntil: "networkidle" }); await p.waitForTimeout(600);
  const live0 = await p.textContent("[data-testid=sig-live]");
  await keysets[slug](p); await p.waitForTimeout(900);
  const live1 = await p.textContent("[data-testid=sig-live]");
  await p.evaluate(axeSrc);
  const ax = await p.evaluate(async () => (await axe.run(document.querySelector("[data-testid=case-figure]"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa", "best-practice"] } })).violations.map((v) => v.id + ":" + v.nodes.length));
  const figText = await p.evaluate(() => document.querySelector("[data-testid=case-figure]").innerText + " " + document.querySelector("[data-testid=sig-live]").textContent);
  const bad = figText.match(/(?<![\d.])(11|12|16|34|33\.9)(?![\d.])/g);
  const small = await p.evaluate(() => [...document.querySelectorAll("[data-testid=case-figure] button")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 24 || r.width < 24); }).length);
  out.push(`${slug}: live "${live0}" -> "${live1}" | axe ${JSON.stringify(ax)} | forbidden figs ${bad ? bad : "none"} | buttons<24px ${small} | page errors ${errs.length}`);
  await ctx.close();
  // reduced motion
  ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" }); p = await ctx.newPage();
  await p.goto(`${B}/work/${slug}`, { waitUntil: "networkidle" }); await p.waitForTimeout(600);
  await keysets[slug](p); await p.waitForTimeout(80);
  const run = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect.getComputedTiming().duration > 0).map((a) => a.animationName || a.transitionProperty));
  out.push(`  reduced motion: running animations after toggle: ${JSON.stringify(run)}`);
  await ctx.close();
  // no-JS
  ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false }); p = await ctx.newPage();
  await p.goto(`${B}/work/${slug}`, { waitUntil: "load" });
  const nojs = await p.evaluate(() => { const f = document.querySelector("[data-testid=case-figure]"); const vis = (e) => e.getBoundingClientRect().height > 0; return { text: f.innerText.replace(/\s+/g, " ").slice(0, 200), controls: [...f.querySelectorAll("button")].filter(vis).length }; });
  out.push(`  no-JS: visible controls ${nojs.controls} | ${nojs.text}`);
  await ctx.close();
}
console.log(out.join("\n"));
await b.close();
