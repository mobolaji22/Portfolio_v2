// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core for axe.mjs) installed outside this repo; Chromium path as in the file. See T1.6-engineering/04-verification.md.
import fs from "node:fs";
import { chromium } from "playwright-core";
const root = ".";
const tokens = JSON.parse(fs.readFileSync(root + "/design/tokens.json", "utf8"));
const cssDir = root + "/.next/static/css";
const css = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(cssDir + "/" + f, "utf8")).join("\n");
// ---- pass 1: variables read from the SHIPPED css ----
function vars(block) { const o = {}; for (const m of block.matchAll(/--c-([\w-]+):\s*#([0-9a-fA-F]{3,6})\b/g)) { let h = m[2]; if (h.length === 3) h = [...h].map((c) => c + c).join(""); o[m[1]] = "#" + h.toUpperCase(); } return o; }
const light = vars(css.match(/:root\s*\{[^}]*\}/)[0]);
const dark = vars(css.match(/:root\.dark\s*\{[^}]*\}/)[0]);
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const nm = (k) => k.replace(/\./g, "-");
let fails = 0, n = 0; const rows = [];
for (const p of tokens.contrast.pairs) {
  const set = p.theme === "dark" ? dark : light;
  const fg = set[nm(p.fg)], bg = set[nm(p.bg)];
  if (!fg || !bg) { rows.push(`MISSING ${p.id}`); fails++; continue; }
  const r = ratio(fg, bg); n++;
  const need = p.kind === "decorative" ? 0 : p.minimum;
  const ok = r + 1e-9 >= need;
  if (!ok) { fails++; rows.push(`FAIL ${p.id} ${fg} on ${bg} ${r.toFixed(2)} < ${need}`); }
  if (Math.abs(r - p.ratio) > 0.02) rows.push(`DRIFT ${p.id} shipped ${r.toFixed(2)} vs tokens.json ${p.ratio}`);
}
console.log(`pass 1 (shipped CSS vs tokens.json pairs): ${n} pairs, ${fails} failures`); rows.forEach((r) => console.log(" ", r));
// ---- pass 2: computed styles of rendered text ----
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
for (const theme of ["light", "dark"]) {
  for (const path of ["/", "/work/command-center"]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
    const p = await ctx.newPage();
    await p.goto("http://localhost:3100" + path, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
    const states = path === "/" ? [1, 2, 3] : [0];
    for (const st of states) {
      if (path === "/" && st === 2) { await p.click("[data-testid=primary]"); await p.waitForTimeout(2300); }
      if (path === "/" && st === 3) { await p.click("[data-testid=primary]"); await p.waitForTimeout(1700); }
      const res = await p.evaluate(() => {
        const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(",").map((x) => parseFloat(x)); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
        const L = (c) => { const f = [c.r, c.g, c.b].map((x) => x / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
        const bgOf = (el) => { let e = el; while (e) { const cs = getComputedStyle(e); if (cs.backgroundImage !== "none") return "image"; const c = parse(cs.backgroundColor); if (c && c.a > 0.5) return c; e = e.parentElement; } return { r: 255, g: 255, b: 255, a: 1 }; };
        const out = []; const seen = new Set();
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
          const t = w.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement;
          const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
          const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.5) continue;
          let o = el, hidden = false; while (o) { if (getComputedStyle(o).opacity === "0" || o.closest("[aria-hidden=true]") === o && false) { hidden = true; break; } o = o.parentElement; } if (hidden) continue;
          const bg = bgOf(el); if (bg === "image") continue;
          const fg = parse(cs.color); if (!fg) continue;
          const a = L(fg), c2 = L(bg); const rr = (Math.max(a, c2) + 0.05) / (Math.min(a, c2) + 0.05);
          const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700; const large = size >= 24 || (bold && size >= 18.66);
          const need = large ? 3 : 4.5; const key = cs.color + bg.r + bg.g + bg.b + el.className;
          if (rr + 0.01 < need && !seen.has(key)) { seen.add(key); out.push({ text: t.textContent.trim().slice(0, 40), cls: String(el.className).slice(0, 50), fg: cs.color, bg: `rgb(${bg.r},${bg.g},${bg.b})`, ratio: rr.toFixed(2), need }); }
        }
        return out;
      });
      console.log(`pass 2 ${theme} ${path} state ${st}: ${res.length} text nodes under threshold`, res.length ? JSON.stringify(res.slice(0, 8)) : "");
    }
    await ctx.close();
  }
}
await b.close();
