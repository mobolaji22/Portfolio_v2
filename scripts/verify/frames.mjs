// Verification script (Playwright, run against `next start -p 3100`). Needs playwright-core (and axe-core where used) installed outside this repo. See T1.6-engineering/04-verification.md.
import { chromium } from "playwright-core";
import fs from "node:fs";
const [,, tag="r4", width="1280", height="800", theme="light"] = process.argv;
const OUT = "/home/user/dev-playbook-v4/docs/dry-runs/T1-portfolio-offer/T1.6-engineering/screens";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: +width, height: +height }, colorScheme: theme });
const p = await ctx.newPage();
await p.goto("http://localhost:3100/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
if (+width < 700) { await p.locator("#finishing-demo").scrollIntoViewIfNeeded(); }
const cdp = await ctx.newCDPSession(p);
let frames = [];
cdp.on("Page.screencastFrame", async (f) => { frames.push({ t: f.metadata.timestamp, data: f.data }); await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
async function run(name, action, ms) {
  for (const f of fs.readdirSync("/tmp").filter((x) => x.startsWith(name + "-"))) fs.unlinkSync("/tmp/" + f);
  frames = [];
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 80, everyNthFrame: 1 });
  await p.waitForTimeout(150);
  const t0 = Date.now() / 1000;
  await action(); await p.waitForTimeout(ms);
  await cdp.send("Page.stopScreencast");
  const fr = frames.filter((f) => f.t >= t0 - 0.05);
  const start = fr[0]?.t ?? t0;
  fs.writeFileSync(`/tmp/${name}.json`, JSON.stringify(fr.map((f) => +(f.t - start).toFixed(3))));
  fr.forEach((f, i) => fs.writeFileSync(`/tmp/${name}-${String(i).padStart(3, "0")}.jpg`, Buffer.from(f.data, "base64")));
  console.log(name, fr.length, "frames over", ((fr[fr.length - 1].t - fr[0].t)).toFixed(2), "s");
}
await run(`${tag}-f12`, () => p.click("[data-testid=primary]"), 2300);
await run(`${tag}-f23`, () => p.click("[data-testid=primary]"), 1800);
await run(`${tag}-f31`, () => p.click("[data-testid=primary]"), 1300);
await b.close();
