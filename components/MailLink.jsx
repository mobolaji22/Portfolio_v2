import { contactAddress } from "@/lib/content";

// A plain mailto that works with no script. The address is entity-encoded in the HTML so a simple
// scraper does not read it (D-10). Read from CONTACT_EMAIL, else the content file. Absent: nothing.
const ent = (s) => [...s].map((ch) => `&#${ch.codePointAt(0)};`).join("");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function mailHref(subject) {
  const a = contactAddress();
  if (!a) return null;
  return "mailto:" + a + (subject ? "?subject=" + encodeURIComponent(subject) : "");
}

// label: plain text; or pass showAddress to render the address as the text
export default function MailLink({ subject, label, showAddress = false, className = "", ariaLabel }) {
  const a = contactAddress();
  if (!a) return null;
  const href = ent("mailto:" + a) + (subject ? "?subject=" + esc(encodeURIComponent(subject)) : "");
  const text = showAddress ? ent(a) : esc(label);
  const aria = ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : "";
  const html = `<a class="${esc(className)}" href="${href}"${aria}>${text}</a>`;
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
