// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core for axe.mjs) installed outside this repo; Chromium path as in the file. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
for (const w of (process.argv[2]||"360,390,600,768,1024,1280,1440").split(",").map(Number)) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3100/", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const hs = [];
  const h = async () => Math.round((await p.locator("[data-testid=plate]").boundingBox()).height * 10) / 10;
  hs.push(await h());
  await p.click("[data-testid=primary]"); await p.waitForTimeout(2300); hs.push(await h());
  await p.click("[data-testid=primary]"); await p.waitForTimeout(1800); hs.push(await h());
  const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(w, hs.join(" / "), "hscroll", sw);
  await ctx.close();
}
await b.close();
