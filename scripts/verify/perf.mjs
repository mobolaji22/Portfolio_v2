// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core for axe.mjs) installed outside this repo; Chromium path as in the file. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
async function measure(label, vw, vh, throttle) {
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: vw < 500 ? 2 : 1, isMobile: vw < 500, hasTouch: vw < 500 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  if (throttle) { await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); }
  await p.addInitScript(() => {
    window.__m = { lcp: 0, lcpEl: "", cls: 0, long: [], ev: [] };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__m.lcp = e.startTime; window.__m.lcpEl = e.element ? e.element.tagName + "." + String(e.element.className).slice(0, 30) : ""; } }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.ev.push(Math.round(e.duration)); }).observe({ type: "event", durationThreshold: 16, buffered: true });
  });
  await p.goto("http://localhost:3100/", { waitUntil: "load" });
  await p.waitForTimeout(4000);
  const load = await p.evaluate(() => ({ lcp: Math.round(window.__m.lcp), lcpEl: window.__m.lcpEl, cls: +window.__m.cls.toFixed(4), long: window.__m.long.slice() }));
  await p.evaluate(() => { window.__m.long = []; });
  const t0 = await p.evaluate(() => performance.now());
  await p.click("[data-testid=primary]"); await p.waitForTimeout(2600 * (throttle ? 1.2 : 1));
  const l12 = await p.evaluate(() => window.__m.long.slice()); await p.evaluate(() => { window.__m.long = []; });
  await p.click("[data-testid=primary]"); await p.waitForTimeout(2000 * (throttle ? 1.2 : 1));
  const l23 = await p.evaluate(() => window.__m.long.slice()); await p.evaluate(() => { window.__m.long = []; });
  await p.click("[data-testid=primary]"); await p.waitForTimeout(1500 * (throttle ? 1.2 : 1));
  const l31 = await p.evaluate(() => window.__m.long.slice());
  const m = await p.evaluate(() => ({ cls: +window.__m.cls.toFixed(4), ev: window.__m.ev }));
  console.log(label, JSON.stringify({ ...load, long1to2: l12, long2to3: l23, longBack: l31, clsTotal: m.cls, slowEvents: m.ev }));
  await ctx.close();
}
await measure("desktop 1280 unthrottled", 1280, 800, false);
await measure("mobile 390 4x CPU + slow 4G", 390, 844, true);
await b.close();
