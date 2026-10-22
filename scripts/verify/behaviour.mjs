// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core for axe.mjs) installed outside this repo; Chromium path as in the file. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
const B = "http://localhost:3100";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const log = (...a) => console.log(...a);
// --- demo functional (T-D2, T-D8, T-D9, interruption, focus stays) ---
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  const st = () => p.getAttribute("[data-testid=plate]", "data-state");
  log("start state", await st(), "| live:", await p.textContent("[data-testid=live]"));
  const font = async (sel) => p.evaluate((s) => getComputedStyle(document.querySelector(s)).fontFamily.split(",")[0], sel);
  log("T-D9 generated figure font:", await font("[data-testid=kpi-members] .run-gen"));
  await p.click("[data-testid=primary]");
  const t0 = Date.now(); await p.waitForFunction(() => document.querySelector("[data-testid=plate]").dataset.state === "checked"); log("T-D2 checked after ms:", Date.now() - t0, "(limit 2200)");
  log("live:", await p.textContent("[data-testid=live]"));
  log("checked values:", await p.evaluate(() => ["members", "open", "resolved", "closed"].map((k) => { const e = document.querySelector(`[data-testid=kpi-${k}]`); return k + "=" + e.querySelector(".run-gen .val-new").textContent; }).join(" ")));
  log("focus on primary after state change:", await p.evaluate(() => document.activeElement.dataset.testid));
  // interruption: press design then immediately scrub back
  await p.click("[data-testid=primary]"); await p.waitForTimeout(300); const mid = await st();
  await p.keyboard.press("Tab"); // move focus to reset
  await p.click("[data-testid=primary]"); await p.waitForTimeout(100);
  log("mid transition state:", mid, "after interrupting press:", await st());
  await p.waitForTimeout(1500); log("settled:", await st());
  log("T-D9 designed lead font:", await font("[data-testid=kpi-members] .run-des"));
  // reset
  await p.click("[data-testid=reset]"); log("after reset:", await st(), "| focus:", await p.evaluate(() => document.activeElement.dataset.testid), "| reset rendered:", await p.locator("[data-testid=reset]").count());
  // scrubber drag
  const thumb = await p.locator("[role=slider]").boundingBox(); const track = await p.locator(".scrub-track-wrap").boundingBox();
  await p.mouse.move(thumb.x + 14, thumb.y + 14); await p.mouse.down(); await p.mouse.move(track.x + track.width * 0.5, thumb.y + 14, { steps: 5 });
  log("during drag state (should be unchanged):", await st()); await p.mouse.up(); await p.waitForTimeout(1800);
  log("after drag release at 50%:", await st(), "valuetext:", await p.getAttribute("[role=slider]", "aria-valuetext"));
  await p.click(".scrub-label[data-pos='3']"); await p.waitForTimeout(1600); log("label tap ->", await st());
  // escape clears note
  await p.click(".note-btn >> nth=0"); const n1 = await p.getAttribute("#finishing-demo", "data-note"); await p.keyboard.press("Escape"); log("note", n1, "-> after Escape", await p.getAttribute("#finishing-demo", "data-note"));
  await ctx.close();
}
// --- lens ---
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const vis = () => p.evaluate(() => ({ units: [...document.querySelectorAll("[data-lens-unit]")].filter((u) => !u.hidden).length, of: document.querySelectorAll("[data-lens-unit]").length, sections: [...document.querySelectorAll("[data-lens-section]")].map((s) => s.id + ":" + (s.hidden ? "hidden" : "shown")).join(","), count: document.querySelector("[data-testid=lens-count]").textContent, hash: location.hash }));
  log("lens all", JSON.stringify(await vis()));
  await p.click("[data-testid=lens-check]"); log("lens check", JSON.stringify(await vis()));
  await p.click("[data-testid=lens-shown]"); log("lens shown", JSON.stringify(await vis()));
  await p.click("[data-testid=lens-word]"); log("lens word", JSON.stringify(await vis()));
  await p.focus("[data-testid=lens-word]"); await p.keyboard.press("ArrowRight"); log("arrow wraps to", await p.evaluate(() => document.activeElement.dataset.testid));
  await p.goto(B + "/#tag=check", { waitUntil: "networkidle" }); await p.waitForTimeout(600); log("reload with #tag=check", JSON.stringify(await vis()));
  await ctx.close();
}
// --- theme, storage blocked, menu ---
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" });
  log("dark preference -> html class:", await p.evaluate(() => document.documentElement.className.split(" ").filter((c) => /dark|light|js/.test(c)).join(" ")));
  await p.click("[aria-controls=menu-panel]"); log("menu open:", await p.locator("#menu-panel").count(), "expanded:", await p.getAttribute("[aria-controls=menu-panel]", "aria-expanded"));
  await p.keyboard.press("Escape"); log("after Escape panel:", await p.locator("#menu-panel").count(), "focus returned:", await p.evaluate(() => document.activeElement.getAttribute("aria-controls")));
  await p.click("[aria-controls=menu-panel]"); await p.click("#menu-panel >> text=Theme"); 
  log("after toggle class:", await p.evaluate(() => document.documentElement.classList.contains("light") + "/" + localStorage.theme));
  await p.reload({ waitUntil: "networkidle" }); log("persisted after reload:", await p.evaluate(() => document.documentElement.classList.contains("light")));
  await p.click("[aria-controls=menu-panel]"); await p.click("#menu-panel >> text=Work"); await p.waitForTimeout(300); log("menu closes on item, hash:", await p.evaluate(() => location.hash), "panel:", await p.locator("#menu-panel").count());
  await ctx.close();
  const c2 = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await c2.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }); });
  const p2 = await c2.newPage(); const errs = []; p2.on("pageerror", (e) => errs.push(e.message));
  await p2.goto(B + "/", { waitUntil: "networkidle" }); await p2.click("header button >> text=Theme"); log("storage blocked: page errors:", errs.length, errs.join("|"), "| toggled:", await p2.evaluate(() => document.documentElement.classList.contains("dark")));
  await c2.close();
}
// --- widths / case pages / coarse targets / forced colours / text spacing / zoom ---
for (const w of [360, 390, 768, 1024, 1280, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); const p = await ctx.newPage();
  const r = [];
  for (const path of ["/", "/work/command-center", "/work/payments-webhooks", "/nope"]) { await p.goto(B + path, { waitUntil: "networkidle" }); r.push(path + ":" + await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)); }
  log("AC5 hscroll at", w, r.join(" "));
  await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const small = await p.evaluate(() => [...document.querySelectorAll("a,button,[role=slider],[role=radio]")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44) && getComputedStyle(e).visibility !== "hidden" && !e.closest("[hidden]") && !e.closest("p, li.t-body-sm"); }).map((e) => (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 30) + " " + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)));
  log("AC14 coarse <44:", JSON.stringify(small));
  await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, forcedColors: "active" }); const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  await p.click("[data-testid=primary]"); await p.waitForTimeout(2300); await p.click("[data-testid=primary]"); await p.waitForTimeout(1700);
  await p.locator("#finishing-demo").screenshot({ path: "/home/user/dev-playbook-v4/docs/dry-runs/T1-portfolio-offer/T1.6-engineering/screens/forced-colors-demo-designed.png" });
  await p.goto(B + "/#tag=word", { waitUntil: "networkidle" }); await p.locator(".lens").scrollIntoViewIfNeeded(); await p.locator(".lens").screenshot({ path: "/home/user/dev-playbook-v4/docs/dry-runs/T1-portfolio-offer/T1.6-engineering/screens/forced-colors-lens.png" });
  await ctx.close();
}
{ // text spacing 1.4.12 + 200%/400% zoom emulation by narrow viewport
  for (const [label, w] of [["200% zoom (640 effective)", 640], ["400% zoom (320 effective)", 320]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); const p = await ctx.newPage();
    await p.goto(B + "/", { waitUntil: "networkidle" });
    await p.addStyleTag({ content: "*{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important} p{margin-bottom:2em !important}" });
    await p.waitForTimeout(400);
    const over = await p.evaluate(() => ({ h: document.documentElement.scrollWidth - innerWidth, clipped: [...document.querySelectorAll("h1,h2,h3,p,a,button")].filter((e) => { const cs = getComputedStyle(e); return e.scrollWidth > e.clientWidth + 2 && (cs.overflow === "hidden" || cs.overflowX === "hidden") && e.clientWidth > 0; }).map((e) => e.textContent.slice(0, 25)) }));
    log("AC19", label, "+ text spacing:", JSON.stringify(over));
    await p.screenshot({ path: `/home/user/dev-playbook-v4/docs/dry-runs/T1-portfolio-offer/T1.6-engineering/screens/textspacing-${w}.png` });
    await ctx.close();
  }
}
await b.close();
