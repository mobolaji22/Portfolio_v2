// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core for axe.mjs) installed outside this repo; Chromium path as in the file. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
const B = "http://localhost:3100";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const res = {};
// ---- AC8 network ----
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const reqs = [];
  p.on("request", (r) => reqs.push(r.url()));
  await p.goto(B + "/", { waitUntil: "networkidle" });
  for (const path of ["/work/arsididi-admin", "/work/command-center", "/nope"]) { await p.goto(B + path, { waitUntil: "networkidle" }); }
  const ext = reqs.filter((u) => !u.startsWith(B) && !u.startsWith("data:"));
  const fonts = reqs.filter((u) => /\.woff2?/.test(u));
  res.network = { total: reqs.length, external: ext, fonts: fonts.map((u) => u.replace(B, "")) };
  await ctx.close();
}
// ---- AC3 keyboard ----
async function tabWalk(w) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const stops = [];
  for (let i = 0; i < 90; i++) {
    await p.keyboard.press("Tab");
    const info = await p.evaluate(() => {
      const e = document.activeElement; if (!e || e === document.body) return null;
      const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      const hd = document.querySelector("header").getBoundingClientRect();
      const sticky = getComputedStyle(document.querySelector("header")).position === "sticky";
      return { tag: e.tagName.toLowerCase(), name: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 40), outline: cs.outlineStyle + " " + cs.outlineWidth, role: e.getAttribute("role"),
        obscured: sticky && r.top < hd.bottom - 1 && r.bottom > hd.top && e.closest("header") === null, w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (!info) break; stops.push(info);
    if (info.name.startsWith("GitHub") && stops.length > 40) break;
  }
  await ctx.close();
  return stops;
}
res.tab1280 = await tabWalk(1280);
res.tab360 = await tabWalk(360);
console.log(JSON.stringify({ network: res.network }, null, 1));
for (const k of ["tab1280", "tab360"]) {
  console.log(k, res[k].length, "stops; no-outline:", res[k].filter((s) => /none/.test(s.outline)).map((s) => s.name), "obscured:", res[k].filter((s) => s.obscured).map((s) => s.name), "small(<24):", res[k].filter((s) => s.w < 24 || s.h < 24).map((s) => s.name + s.w + "x" + s.h));
  console.log(res[k].map((s) => s.tag + ":" + s.name).join(" | "));
}
await b.close();
