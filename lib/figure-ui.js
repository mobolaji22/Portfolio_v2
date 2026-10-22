// Neutral UI labels for the five case-study micro-interactions. These are Engineering-supplied, not in
// site-content.json, and are listed as "missing strings" in 05-report.md for Content to adopt or replace.
// They are technical identifiers and state words only; none states a claim.
export const figureUi = {
  response: "Response",
  reads: "Reads",
  key: "Key read",
  level: "Level read",
  apply: "Apply",
  applied: "Applied",
  signed: "Signed",
  unsigned: "Unsigned",
  send: "Send",
  eventType: "Event",
  check: "Signature",
  matches: "matches",
  differs: "does not match",
  flags: "Capabilities",
  on: "On",
  off: "Off",
  tokens: "Tokens",
  page: "Page",
  log: "Log",
};
// Sample event body for the payments figure. Money is whole kobo, never decimal naira.
export const sampleEvent = { booking: "bk-01", amount_kobo: 250000 };
export const sampleRows = [
  { id: "r-01", s: "open" }, { id: "r-02", s: "resolved" }, { id: "r-03", s: "closed" },
  { id: "r-04", s: "open" }, { id: "r-05", s: "resolved" }, { id: "r-06", s: "closed" },
];
// A small, real check (FNV-1a) standing in for the provider's HMAC: the signature either matches the body or it does not.
export function sign(body) {
  let h = 0x811c9dc5;
  const s = JSON.stringify(body);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}
