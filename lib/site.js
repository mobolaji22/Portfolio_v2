// SITE_URL: one value for canonical, og:url, JSON-LD and the sitemap (spec 9, AS-13).
// Safe default for a build with nothing set: http://localhost:3000, with a warning.
// A preview address is refused outright.
const FALLBACK = "http://localhost:3000";

export function siteUrl() {
  const raw = (process.env.SITE_URL || "").trim();
  const value = (raw || FALLBACK).replace(/\/+$/, "");
  let host = "";
  try {
    host = new URL(value).host;
  } catch {
    throw new Error(`SITE_URL is not a valid URL: ${value}`);
  }
  if (/\.vercel\.(app|com)$/.test(host)) {
    throw new Error("SITE_URL must be the final domain, never a vercel preview address (AS-13).");
  }
  if (!raw && process.env.NODE_ENV === "production" && !globalThis.__siteUrlWarned) {
    globalThis.__siteUrlWarned = true;
    console.warn(`[site] SITE_URL is not set; canonical and sitemap use ${FALLBACK}. Set SITE_URL before publishing.`);
  }
  return value;
}

export const absolute = (path = "/") => siteUrl() + (path.startsWith("/") ? path : "/" + path);
