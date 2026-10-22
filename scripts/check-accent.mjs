// AC2 (spec N1): the accent may be referenced only in app/mark.css (and defined in app/tokens.css).
import fs from "node:fs";
import path from "node:path";
const bad = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? (["node_modules", ".next", ".git"].includes(e.name) ? [] : walk(p)) : [p];
});
const ALLOWED = new Set(["app/mark.css", "app/tokens.css", "tailwind.config.js", "design/tokens.json", "scripts/check-accent.mjs", "scripts/make-assets.mjs", "scripts/gen-tokens.mjs"]);
for (const f of walk(".")) {
  const rel = f.replace(/^\.\//, "");
  if (!/\.(js|jsx|css|mjs)$/.test(rel) || ALLOWED.has(rel)) continue;
  const t = fs.readFileSync(f, "utf8");
  for (const m of t.matchAll(/--c-mark-(fill|ink)|\b(bg|text|border|ring|fill|stroke)-mark\b/g)) bad.push(`${rel}: ${m[0]}`);
}
// compiled CSS: every rule that mentions the mark must come from mark.css selectors
const compiled = fs.existsSync(".next/static/css") ? fs.readdirSync(".next/static/css").filter((x) => x.endsWith(".css")) : [];
for (const f of compiled) {
  const css = fs.readFileSync(path.join(".next/static/css", f), "utf8");
  const stray = [...css.matchAll(/\.(bg|text|border|ring|fill|stroke)-mark[\w\\./:-]*/g)].map((m) => m[0]);
  stray.forEach((s) => bad.push(`compiled ${f}: ${s}`));
}
if (bad.length) { console.error("accent used outside its roles:\n" + bad.join("\n")); process.exit(1); }
console.log("check-accent: zero stray uses");
