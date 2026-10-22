"use client";
import { useLayoutEffect, useState } from "react";
import { plan } from "@/lib/demo-machine";

// P2 overlays for the Designed notes (spec 5.11). Drawn from measured rects of the real elements.
// Decorative (aria-hidden): the note text carries the meaning. No yellow. No text depends on them.
export default function Overlay({ note, plateRef, active }) {
  const [m, setM] = useState(null);
  useLayoutEffect(() => {
    if (!note || !active || !plateRef.current) { setM(null); return; }
    const screen = plateRef.current.querySelector(".screen");
    const o = screen.getBoundingClientRect();
    const rel = (el) => { const r = el.getBoundingClientRect(); return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height }; };
    const q = (s) => [...screen.querySelectorAll(s)];
    const lead = rel(screen.querySelector('[data-ov="lead"]'));
    const chart = rel(screen.querySelector('[data-ov="chart"]'));
    const ledger = q('[data-ov="ledger"]').map(rel);
    const title = rel(screen.querySelector('[data-ov="title"]'));
    const accents = q(".run-des .fig-bar, .chart-dot").map(rel).filter((r) => r.w > 0);
    setM({ w: o.width, h: o.height, lead, chart, ledger, title, accents });
  }, [note, active, plateRef]);
  if (!m || !note) return null;
  if (note === "order") {
    const pts = [[m.lead.x, m.lead.y], [m.chart.x, m.chart.y], [m.ledger[0].x, m.ledger[0].y]];
    return (
      <div className="ov" aria-hidden="true" data-overlay="order">
        {pts.map(([x, y], i) => <span key={i} className="ov-disc t-mono-label" style={{ left: x - 10, top: y - 10 }}>{i + 1}</span>)}
      </div>
    );
  }
  if (note === "space") {
    const gaps = [
      [m.title.y + m.title.h, m.lead.y], [Math.max(m.lead.y + m.lead.h, m.chart.y + m.chart.h), m.ledger[0].y],
      ...m.ledger.slice(0, -1).map((r, i) => [r.y + r.h, m.ledger[i + 1].y]),
    ].filter(([a, b]) => b - a > 2);
    return (
      <div className="ov" aria-hidden="true" data-overlay="space">
        <span className="ov-rhythm" style={{ height: m.h }} />
        {gaps.map(([a, b], i) => <span key={i} className="ov-gap" style={{ top: a, height: b - a, left: 8, width: 6 }} />)}
      </div>
    );
  }
  if (note === "colour") {
    return (
      <div className="ov" aria-hidden="true" data-overlay="colour">
        {m.accents.map((r, i) => <span key={i} className="ov-dash" style={{ left: r.x - 3, top: r.y - 3, width: r.w + 6, height: r.h + 6 }} />)}
      </div>
    );
  }
  if (note === "motion") {
    // the same beat table the transition runs (spec 5.9), one 6 px bar per beat, length proportional to duration
    const pl = plan(2, 3, "story");
    const total = pl.end;
    const W = Math.min(m.w - 260, 360);
    return (
      <div className="ov ov-motion" aria-hidden="true" data-overlay="motion" style={{ right: 20, top: 8, width: W, left: "auto" }}>
        {pl.beatBars.map((b, i) => <span key={b.id + i} className="ov-bar" style={{ marginLeft: (b.t / total) * W, width: Math.max(3, (b.dur / total) * W) }} />)}
      </div>
    );
  }
  return null;
}
