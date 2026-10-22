"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, RingDot, QuoteIcon } from "./Icons";

const GLYPH = { check: ArrowUpRight, shown: RingDot, word: QuoteIcon };

// The tag lens (spec 4.3): filters lensable units by hiding them. State is the hash #tag=check|shown|word.
export default function TagLens({ label, options, counts, countTemplate, emptyText }) {
  const [sel, setSel] = useState("all");
  const refs = useRef({});
  const keys = options.map((o) => o.key);

  const apply = (key) => {
    document.querySelectorAll("[data-lens-unit]").forEach((el) => {
      const tags = (el.dataset.tags || "").split(" ").filter(Boolean);
      el.hidden = key !== "all" && !tags.includes(key);
    });
    document.querySelectorAll("[data-lens-section]").forEach((sec) => {
      const units = sec.querySelectorAll("[data-lens-unit]");
      sec.hidden = units.length > 0 && ![...units].some((u) => !u.hidden);
    });
  };

  useEffect(() => {
    const m = /tag=(check|shown|word)/.exec(window.location.hash);
    if (m) { setSel(m[1]); apply(m[1]); }
  }, []);

  const choose = (key, focus = false) => {
    setSel(key);
    apply(key);
    try {
      const url = window.location.pathname + window.location.search + (key === "all" ? "" : `#tag=${key}`);
      window.history.replaceState(null, "", url);
    } catch {}
    if (focus) refs.current[key]?.focus();
  };
  const onKey = (e, i) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    choose(keys[(i + d + keys.length) % keys.length], true);
  };
  const n = counts[sel];
  return (
    <div className="lens js-only">
      <div role="radiogroup" aria-label={label} className="lens-group">
        {options.map((o, i) => {
          const G = GLYPH[o.key];
          return (
            <button key={o.key} ref={(el) => (refs.current[o.key] = el)} type="button" role="radio" aria-checked={sel === o.key}
              tabIndex={sel === o.key ? 0 : -1} className="lens-opt t-ui-sm" onClick={() => choose(o.key)} onKeyDown={(e) => onKey(e, i)} data-testid={`lens-${o.key}`}>
              {G && <G className="lens-glyph" />}
              {o.label}
            </button>
          );
        })}
      </div>
      <p role="status" className="t-mono-label lens-count" data-testid="lens-count">{countTemplate.replace("{n}", n)}</p>
      {n === 0 && <div className="plain-state t-body-sm mt-4" data-kind="empty">{emptyText}</div>}
    </div>
  );
}
