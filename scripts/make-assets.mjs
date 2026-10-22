// Builds the favicon family and the Open Graph card with the local Chromium. No network.
// usage: PLAYWRIGHT_CORE=/path/to/playwright-core CHROMIUM=/opt/pw-browsers/chromium node scripts/make-assets.mjs
// Playwright is not a dependency of this repo; install playwright-core anywhere and point PLAYWRIGHT_CORE at it.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PLAYWRIGHT_CORE ? pathToFileURL(path.join(process.env.PLAYWRIGHT_CORE, "index.mjs")).href : "playwright-core");

const root = process.cwd();
const content = JSON.parse(fs.readFileSync("content/site-content.json", "utf8"));
const fx = content.demo.fixture.source;
const apos = (s) => s.replace(/'/g, "’");
const MO = "M11.95 41V23H17.95L22.95 40.35H20.77L25.77 23H31.8V41H28V24.07H28.65L23.77 41H19.8L14.97 24.22H15.6V41ZM42.52 41.25Q40.52 41.25 38.84 40.58Q37.15 39.9 35.91 38.66Q34.67 37.42 33.99 35.71Q33.3 34 33.3 31.92Q33.3 29.17 34.47 27.11Q35.65 25.05 37.74 23.9Q39.82 22.75 42.5 22.75Q45.22 22.75 47.3 23.9Q49.38 25.05 50.56 27.12Q51.75 29.2 51.75 31.95Q51.75 34 51.06 35.71Q50.38 37.42 49.14 38.66Q47.9 39.9 46.21 40.58Q44.52 41.25 42.52 41.25ZM42.5 38.2Q44.07 38.2 45.27 37.4Q46.47 36.6 47.16 35.19Q47.85 33.77 47.85 31.9Q47.85 30.05 47.17 28.67Q46.5 27.3 45.3 26.55Q44.1 25.8 42.5 25.8Q40.92 25.8 39.72 26.55Q38.52 27.3 37.86 28.66Q37.2 30.02 37.2 31.9Q37.2 33.8 37.88 35.21Q38.55 36.62 39.75 37.41Q40.95 38.2 42.5 38.2Z";
const M_ONLY = "M11.95 41V23H17.95L22.95 40.35H20.77L25.77 23H31.8V41H28V24.07H28.65L23.77 41H19.8L14.97 24.22H15.6V41Z";
const INK = "#14130F", PAPER = "#FBFAF6", MARK = "#FFD43B", MUTED = "#66625A", RULE = "#D8D3C4";

// ---- icon.svg: the mark, outlined, with a dark scheme inside the file ----
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>.d{fill:${INK}}.l{fill:${PAPER}}@media (prefers-color-scheme: dark){.d{fill:#F3F0E7}.l{fill:#12110E}}</style><circle class="d" cx="32" cy="32" r="32"/><path class="l" d="${MO}"/></svg>`;
fs.writeFileSync("app/icon.svg", iconSvg);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
async function png(html, w, h, out, scale = 1) {
  const tmp = path.join(root, ".asset-tmp.html");
  fs.writeFileSync(tmp, html);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, omitBackground: false });
  await ctx.close();
  fs.unlinkSync(tmp);
}
const markSvg = (paths, bg = INK, fg = PAPER, pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%"><circle cx="32" cy="32" r="32" fill="${bg}"/>${paths}</svg>`;
const bodyCss = "html,body{margin:0;padding:0;background:transparent}";
// 32 px, 16 px ("M" only), 180 px (apple)
const full = `<path fill="${PAPER}" d="${MO}"/>`;
const mOnly = `<g transform="translate(32 32) scale(1.5) translate(-21.875 -32)"><path fill="${PAPER}" d="${M_ONLY}"/></g>`;
await png(`<style>${bodyCss}</style><div style="width:32px;height:32px">${markSvg(full)}</div>`, 32, 32, ".f32.png");
await png(`<style>${bodyCss}</style><div style="width:16px;height:16px">${markSvg(mOnly)}</div>`, 16, 16, ".f16.png");
await png(`<style>${bodyCss}</style><div style="width:180px;height:180px;background:${PAPER};display:flex;align-items:center;justify-content:center"><div style="width:144px;height:144px">${markSvg(full)}</div></div>`, 180, 180, "app/apple-icon.png");
// ICO with two PNG images
const imgs = [[32, fs.readFileSync(".f32.png")], [16, fs.readFileSync(".f16.png")]];
const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
let offset = 6 + 16 * imgs.length; const dir = [], data = [];
for (const [s, b] of imgs) { const e = Buffer.alloc(16); e[0] = s; e[1] = s; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(b.length, 8); e.writeUInt32LE(offset, 12); offset += b.length; dir.push(e); data.push(b); }
fs.writeFileSync("app/favicon.ico", Buffer.concat([head, ...dir, ...data]));
fs.unlinkSync(".f32.png"); fs.unlinkSync(".f16.png");

// ---- Open Graph card, 1200 x 630, light theme, from the Designed state ----
const f = (n) => pathToFileURL(path.join(root, "app/fonts", n)).href;
const [s1, s2] = content.hero.h1.split(/(?<=\.)\s+/);
const series = fx.signupsByWeek; const ymax = Math.ceil(Math.max(...series) / 10) * 10;
const W = 320, H = 64;
const pts = series.map((v, i) => [(i / (series.length - 1)) * W, H - (v / ymax) * H]);
const last = pts[pts.length - 1];
const sub = content.hero.sub.replace("finish", '<span class="mk">finish</span>');
const og = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:NR;src:url(${f("newsreader-latin-opsz-normal.woff2")});font-weight:200 800}
@font-face{font-family:PM;src:url(${f("ibm-plex-mono-latin-400-normal.woff2")});font-weight:400}
@font-face{font-family:PM;src:url(${f("ibm-plex-mono-latin-500-normal.woff2")});font-weight:500}
@font-face{font-family:IS;src:url(${f("instrument-sans-latin-wght-normal.woff2")});font-weight:400 700}
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;background:${PAPER};color:${INK};overflow:hidden}
.eyebrow{position:absolute;left:64px;top:72px;font:400 20px/1.4 PM;color:${MUTED}}
h1{position:absolute;left:64px;top:128px;margin:0;font:500 64px/1.04 NR;font-optical-sizing:auto;letter-spacing:-0.015em;width:900px}
h1 span{display:block}
.sub{position:absolute;left:64px;top:300px;font:400 40px/1.2 NR;font-optical-sizing:auto}
.mk{position:relative;display:inline-block;z-index:0}.mk:before{content:"";position:absolute;z-index:-1;left:-4px;right:-4px;top:12%;bottom:0;background:${MARK}}
.plate{position:absolute;left:744px;top:286px;width:392px;height:296px;background:#F3F0E7;border:1px solid ${RULE};border-radius:2px;padding:22px 28px}
.fig{position:relative;display:inline-block;font:500 104px/0.95 PM;letter-spacing:-0.05em}
.bar{position:absolute;left:0;right:0;top:calc(100% + 6px);height:13px;background:${MARK}}
.lab{margin-top:28px;font:500 20px/1.3 IS;color:#44413A}
svg{position:absolute;left:28px;top:208px}
.rule{position:absolute;left:0;right:0;top:0;height:1px;background:${RULE}}
.mono{position:absolute;left:64px;bottom:56px;font:400 18px/1.4 PM;color:${MUTED}}
</style>
<div class="eyebrow">${apos(content.hero.eyebrow)}</div>
<h1><span>${apos(s1)}</span><span>${apos(s2)}</span></h1>
<div class="sub">${sub}</div>
<div class="plate"><span class="fig">${fx.activeMembers}<i class="bar"></i></span><div class="lab">${content.demo.dashboardLabels.members}</div>
<svg width="${W}" height="${H + 10}" viewBox="-6 -6 ${W + 12} ${H + 16}"><line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#8A8576" stroke-width="1"/><polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="miter"/><circle cx="${last[0]}" cy="${last[1]}" r="5" fill="${MARK}" stroke="${INK}" stroke-width="1.5"/></svg></div>
`;
await png(og, 1200, 630, "app/opengraph-image.png");
fs.copyFileSync("app/opengraph-image.png", "app/twitter-image.png");
fs.writeFileSync("app/opengraph-image.alt.txt", apos(content.meta.openGraph.image.alt) + "\n");
fs.writeFileSync("app/twitter-image.alt.txt", apos(content.meta.openGraph.image.alt) + "\n");
await browser.close();
console.log("assets written");
