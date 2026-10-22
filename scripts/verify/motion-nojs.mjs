// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core where used) installed outside this repo. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
const B = "http://localhost:3100";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const props = new Set(); 
async function sampleAnims(p, ms) {
  const out = [];
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    out.push(...await p.evaluate(() => document.getAnimations().map((a) => ({ type: a.constructor.name, props: (a.effect?.getKeyframes?.() || []).flatMap((k) => Object.keys(k).filter((x) => !["offset", "easing", "composite", "computedOffset"].includes(x))), prop: a.transitionProperty || a.animationName }))));
    await p.waitForTimeout(40);
  }
  return out;
}
// ---- AC12 animation properties (normal motion), forward and reverse ----
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  const all = [];
  await p.click("[data-testid=primary]"); all.push(...await sampleAnims(p, 2300));
  await p.click("[data-testid=primary]"); all.push(...await sampleAnims(p, 1700));
  await p.click("[data-testid=primary]"); all.push(...await sampleAnims(p, 1300)); // back
  const names = {};
  for (const a of all) for (const pr of a.props) names[pr] = (names[pr] || 0) + 1;
  console.log("AC12 keyframe properties seen:", JSON.stringify(names));
  // framer layout uses WAAPI? list transitions properties
  const tp = {}; for (const a of all) if (a.prop) tp[a.prop] = (tp[a.prop] || 0) + 1;
  console.log("animation/transition names:", JSON.stringify(tp));
  await ctx.close();
}
// ---- AC4 reduced motion ----
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  const states = [];
  const st = async () => p.getAttribute("[data-testid=plate]", "data-state");
  const anims = async () => p.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  states.push([await st(), await anims()]);
  await p.click("[data-testid=primary]"); await p.waitForTimeout(150); states.push([await st(), await anims()]);
  await p.click("[data-testid=primary]"); await p.waitForTimeout(150); states.push([await st(), await anims()]);
  await p.click("[data-testid=primary]"); await p.waitForTimeout(150); states.push([await st(), await anims()]);
  await p.click("[data-testid=primary]"); await p.waitForTimeout(100); await p.click("[data-testid=primary]"); await p.waitForTimeout(100);
  await p.keyboard.press("Tab");
  console.log("AC4 reduced: [state, running animations]", JSON.stringify(states), "note shown:", await p.locator("[data-testid=reduced-note]").count());
  // scrubber keys
  await p.focus("[role=slider]"); await p.keyboard.press("End"); await p.waitForTimeout(100); const e = await st(); await p.keyboard.press("Home"); await p.waitForTimeout(100); console.log("scrubber End->", e, "Home->", await st());
  await ctx.close();
}
// ---- AC6 no-JS ----
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "load" }); await p.waitForTimeout(3500);
  const r = await p.evaluate(() => {
    const plate = document.querySelector("[data-testid=plate]");
    const vis = (e) => e && getComputedStyle(e).visibility !== "hidden" && e.getBoundingClientRect().height > 0;
    return { look: plate.dataset.look, state: plate.dataset.state, plateVisible: vis(plate), members: document.querySelector("[data-testid=kpi-members] .run-des .count-now").textContent,
      nojs: document.querySelector("[data-testid=nojs]").innerText.slice(0, 400), toolbarVisible: vis(document.querySelector(".demo-toolbar")), skip: !!document.querySelector(".skip"),
      navLinks: [...document.querySelectorAll("header a")].map((a) => a.textContent.trim()), themeVisible: [...document.querySelectorAll("header button")].some(vis) };
  });
  console.log("AC6 no-JS:", JSON.stringify(r, null, 1));
  await p.screenshot({ path: "/tmp/nojs.png", fullPage: false });
  await ctx.close();
}
await b.close();
