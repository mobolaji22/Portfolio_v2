import raw from "@/content/site-content.json";
import { siteConfig } from "@/config/site";

// ---- guard: nothing internal may be in the bundle (spec N6) ------------------------------
const FORBIDDEN = /(^_meta$|Note$|^note$|[Rr]ule$|^rules$|^absentSlots$|^visualBrief$|^guard$|^ladder$)/;
function assertClean(node, trail = "") {
  if (Array.isArray(node)) return node.forEach((n, i) => assertClean(n, `${trail}[${i}]`));
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (FORBIDDEN.test(k)) throw new Error(`content: forbidden key ${trail}.${k}`);
      assertClean(v, `${trail}.${k}`);
    }
  }
}
assertClean(raw);

export const c = raw;
export const settings = { ...raw.settings, ...siteConfig };

// ---- text helpers --------------------------------------------------------------------------
// Typographic apostrophes at render time (T1.5-F9). The source copy is not changed.
export const typo = (s) => (typeof s === "string" ? s.replace(/'/g, "’") : s);

// {token} filler for demo and page tokens. Unknown tokens throw: a missing figure must not pass.
export function fill(str, tokens = {}) {
  return typo(
    str.replace(/\{(\w+)\}/g, (m, k) => {
      if (!(k in tokens)) throw new Error(`fill: no value for {${k}} in "${str}"`);
      return String(tokens[k]);
    })
  );
}

// ---- resolvers (the build resolves, never by hand) -----------------------------------------
export const byVoice = (v) => (v && typeof v === "object" && "owner" in v ? v[settings.practiceVoice] : v);
export const byName = (v, studyId) => {
  if (!(v && typeof v === "object" && "named" in v && "unnamed" in v)) return v;
  const named = studyId === "cake-studio" ? settings.velvetiiNamed : settings.arsididiNamed;
  return named ? v.named : v.unnamed;
};
export const aiLine = (kind) => c.aiAuthorship[settings.aiRung][kind];

// ---- studies ------------------------------------------------------------------------------
const RENDERABLE = new Set([
  "ready_for_owner_review",
  "ready_for_owner_review_unnamed_only",
  "ready_for_owner_review_consent_needed",
]);
export function studies() {
  return c.work.order
    .map((id) => c.caseStudies.find((s) => s.id === id))
    .filter((s) => s && RENDERABLE.has(s.status) && settings.showStudy[s.id] !== false);
}
export const studyBySlug = (slug) => studies().find((s) => s.slug === slug);
export function resolveStudy(s) {
  const n = (v) => byName(v, s.id);
  return {
    ...s,
    kicker: n(s.kicker),
    title: n(s.title),
    role: n(s.role),
    whatIDidList: byVoice(s.whatIDid),
    limitShown: s.limit && s.limit.status !== "draft_pending_owner" && s.limit.text ? s.limit : null,
  };
}

// ---- contact -------------------------------------------------------------------------------
// The live address is read from configuration first (spec 4.7); the copy file value is the default.
export function contactAddress() {
  const fromEnv = (process.env.CONTACT_EMAIL || "").trim();
  if (fromEnv) return fromEnv;
  const href = c.contact.email && c.contact.email.href;
  return href ? href.replace(/^mailto:/, "") : null;
}
