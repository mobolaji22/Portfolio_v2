// The Finishing demo's state machine (spec 5.10) and beat tables (spec 5.9). Pure JS, no React:
// a controller with an injected scheduler so it can be tested in node.
//
// rest states: 1 generated, 2 checked, 3 designed. moving(from, to, tempo).
// A transition is a list of timed patches over a `view` object; rest states are complete views.

export const STATE_NAMES = { 1: "generated", 2: "checked", 3: "designed" };
export const TEMPO = { story: { dur: 1, delay: 1 }, compare: { dur: 0.55, delay: 0.4 } };
const REVERSE_SCALE = 0.7;

export const VIEW_GENERATED = {
  look: "g", deco: 1, surf: "g", ty: 0, rules: false,
  bm: false, bo: false, br: false, bc: false, bs: false,
  rm: false, rc: false, rr: false,
  mFixed: false, series: false, rFixed: false, closed: false, last: false,
  scan: false, find: 0, notes: false, cap: "generated",
};
export const VIEW_CHECKED = {
  ...VIEW_GENERATED,
  bm: true, bo: true, br: true, bc: true, bs: true,
  rm: true, rc: true, rr: true,
  mFixed: true, series: true, rFixed: true, closed: true, last: true,
  find: 3, cap: "checked",
};
export const VIEW_DESIGNED = {
  ...VIEW_CHECKED,
  look: "d", deco: 0, surf: "p", ty: 5, rules: true, rc: false, rr: false, notes: true, cap: "designed",
};
export const REST_VIEW = { 1: VIEW_GENERATED, 2: VIEW_CHECKED, 3: VIEW_DESIGNED };

// Beat tables. `t` and `dur` are milliseconds at story tempo; `patches` are applied at t + at.
// The Motion overlay draws one bar per beat from `t` and `dur`, so it is honest by construction.
export const BEATS_1_2 = [
  { id: "press", t: 0, dur: 200 },
  { id: "scan", t: 0, dur: 420, patches: [{ at: 0, p: { scan: true } }, { at: 420, p: { scan: false } }], scanOnly: true },
  { id: "b1-readout", t: 280, dur: 120, patches: [{ at: 0, p: { rm: true } }] },
  { id: "b1-correct", t: 520, dur: 320, patches: [{ at: 0, p: { mFixed: true } }, { at: 120, p: { bm: true } }] },
  { id: "confirm-open", t: 120, dur: 320, patches: [{ at: 0, p: { bo: true } }] },
  { id: "b2-readout", t: 700, dur: 120, patches: [{ at: 0, p: { rc: true, cap: "checked" } }] },
  { id: "b2-reveal", t: 760, dur: 700, patches: [{ at: 0, p: { series: true } }] },
  { id: "find-1", t: 960, dur: 120, patches: [{ at: 0, p: { find: 1 } }] },
  { id: "b3-readout", t: 1100, dur: 120, patches: [{ at: 0, p: { rr: true } }] },
  { id: "b3-travel", t: 1240, dur: 520, patches: [{ at: 0, p: { rFixed: true, closed: true } }, { at: 160, p: { br: true } }, { at: 220, p: { bc: true } }] },
  { id: "b2-end", t: 1440, dur: 120, patches: [{ at: 0, p: { last: true } }, { at: 80, p: { bs: true } }] },
  { id: "find-2", t: 1380, dur: 120, patches: [{ at: 0, p: { find: 2 } }] },
  { id: "find-3", t: 1720, dur: 120, patches: [{ at: 0, p: { find: 3 } }] },
];
export const END_1_2 = 1850;

export const BEATS_2_3 = [
  { id: "press", t: 0, dur: 80 },
  { id: "deco-recedes", t: 0, dur: 160, patches: [{ at: 0, p: { deco: 0 } }] },
  { id: "order-arrives", t: 120, dur: 520, patches: [{ at: 0, p: { look: "d", surf: "p" } }] },
  { id: "type-swap", t: 420, dur: 200, patches: [
    { at: 0, p: { ty: 1 } }, { at: 40, p: { ty: 2 } }, { at: 80, p: { ty: 3 } }, { at: 120, p: { ty: 4 } }, { at: 160, p: { ty: 5 } },
  ] },
  { id: "hairlines", t: 640, dur: 240, patches: [{ at: 0, p: { rules: true } }] },
  { id: "caption", t: 700, dur: 120, patches: [{ at: 0, p: { cap: "designed", rc: false, rr: false } }] },
  { id: "notes", t: 1000, dur: 360, patches: [{ at: 0, p: { notes: true } }] },
];
export const END_2_3 = 1450;

// Reverse tables are written out (the figure 61 travels back, decoration returns last,
// readouts stay until the state they belong to is left).
export const BEATS_3_2 = [
  { id: "notes-out", t: 0, dur: 120, patches: [{ at: 0, p: { notes: false, rules: false } }] },
  { id: "caption", t: 100, dur: 120, patches: [{ at: 0, p: { cap: "checked", rc: true, rr: true } }] },
  { id: "type-swap", t: 160, dur: 240, patches: [
    { at: 0, p: { ty: 4 } }, { at: 60, p: { ty: 3 } }, { at: 100, p: { ty: 2 } }, { at: 160, p: { ty: 1 } }, { at: 240, p: { ty: 0 } },
  ] },
  { id: "order-leaves", t: 120, dur: 520, patches: [{ at: 0, p: { look: "g", surf: "g" } }] },
  { id: "deco-returns", t: 800, dur: 160, patches: [{ at: 0, p: { deco: 1 } }] },
];
export const END_3_2 = 1450;

export const BEATS_2_1 = [
  { id: "find-out", t: 0, dur: 300, patches: [{ at: 0, p: { find: 2 } }, { at: 200, p: { find: 1 } }] },
  { id: "b3-back", t: 200, dur: 520, patches: [{ at: 0, p: { rFixed: false, closed: false, br: false, bc: false } }] },
  { id: "b3-readout", t: 300, dur: 120, patches: [{ at: 0, p: { rr: false } }] },
  { id: "b2-back", t: 500, dur: 560, patches: [{ at: 0, p: { series: false, last: false, bs: false } }] },
  { id: "b2-readout", t: 700, dur: 120, patches: [{ at: 0, p: { rc: false, cap: "generated", find: 0 } }] },
  { id: "b1-back", t: 900, dur: 320, patches: [{ at: 0, p: { mFixed: false, bm: false, rm: false } }, { at: 200, p: { bo: false } }] },
];
export const END_2_1 = 1300;

// Build a plan: array of {t, p} sorted, and the total duration, at a tempo.
function table(beats, end, { tempo, reverse, noScan }) {
  const k = TEMPO[tempo];
  const rs = reverse ? REVERSE_SCALE : 1;
  const steps = [];
  for (const b of beats) {
    if (noScan && b.scanOnly) continue;
    for (const pt of b.patches || []) {
      steps.push({ t: (b.t * k.delay + pt.at * k.dur) * rs, p: pt.p });
    }
  }
  steps.sort((a, b) => a.t - b.t);
  const beatBars = beats.map((b) => ({ id: b.id, t: b.t * k.delay * rs, dur: b.dur * k.dur * rs }));
  return { steps, end: end * k.dur * rs, beatBars };
}

export function plan(from, to, tempo) {
  const opts = { tempo, noScan: tempo === "compare" };
  if (from === 1 && to === 2) return table(BEATS_1_2, END_1_2, { ...opts, reverse: false });
  if (from === 2 && to === 3) return table(BEATS_2_3, END_2_3, { ...opts, reverse: false });
  if (from === 3 && to === 2) return table(BEATS_3_2, END_3_2, { ...opts, reverse: true });
  if (from === 2 && to === 1) return table(BEATS_2_1, END_2_1, { ...opts, reverse: true });
  // two-table jumps overlap: the second starts at 40 percent of the first (compare tempo)
  const [a, b] = from < to ? [plan(1, 2, "compare"), plan(2, 3, "compare")] : [plan(3, 2, "compare"), plan(2, 1, "compare")];
  const off = a.end * 0.4;
  // leaving for Generated in one go: the readouts and findings go first, so no text lies over the moving plate
  const leaving = from > to;
  const strip = (p) => { if (!leaving) return p; const { rc, rr, ...rest } = p; return rest; };
  const lead = leaving ? [{ t: 0, p: { rm: false, rc: false, rr: false, find: 0, notes: false } }] : [];
  return {
    steps: [...lead, ...a.steps.map((s) => ({ t: s.t, p: strip(s.p) })), ...b.steps.map((s) => ({ t: s.t + off, p: s.p }))].sort((x, y) => x.t - y.t),
    end: off + b.end,
    beatBars: [...a.beatBars, ...b.beatBars.map((x) => ({ ...x, t: x.t + off }))],
  };
}

const NOTES = ["order", "space", "colour", "motion", "states", "focus"];
export const PREVIEWS = ["data", "loading", "empty", "error"];

// ---------------------------------------------------------------------------------------------
export class DemoController {
  constructor({ initialRest = 3, reduced = false, now = (f, ms) => setTimeout(f, ms), clear = (t) => clearTimeout(t) } = {}) {
    this.schedule = now;
    this.clearT = clear;
    this.timers = [];
    this.listeners = new Set();
    this.reduced = reduced;
    this.s = {
      rest: initialRest, moving: null, view: { ...REST_VIEW[initialRest] },
      note: null, preview: 0, open: [], announced: initialRest, instant: false, beatBars: [],
    };
  }
  subscribe = (fn) => { this.listeners.add(fn); return () => this.listeners.delete(fn); };
  getSnapshot = () => this.s;
  set(patch) { this.s = { ...this.s, ...patch }; this.listeners.forEach((f) => f()); }
  setReduced(v) { this.reduced = v; }

  // jump with no animation (hydration, reset)
  jump(rest, { clearNote = true } = {}) {
    this.cancel();
    this.set({ rest, moving: null, view: { ...REST_VIEW[rest] }, announced: rest, instant: true, beatBars: [],
      ...(clearNote ? { note: null, preview: 0, open: [] } : {}) });
    this.schedule(() => this.set({ instant: false }), 60);
  }
  cancel() { this.timers.forEach((t) => this.clearT(t)); this.timers = []; }

  // FINISH: every element jumps to the end state of the running transition (D-T15-09)
  finish() {
    if (!this.s.moving) return;
    const to = this.s.moving.to;
    this.cancel();
    this.set({ rest: to, moving: null, view: { ...REST_VIEW[to] }, announced: to, instant: true });
    this.schedule(() => this.set({ instant: false }), 60);
  }

  go(to, tempo) {
    const from = this.s.rest;
    if (from === to) return;
    if (this.reduced) { this.jump(to); return; }
    const pl = plan(from, to, tempo);
    // leaving designed clears note and preview
    this.set({ moving: { from, to, tempo }, note: from === 3 ? null : this.s.note, preview: from === 3 ? 0 : this.s.preview, beatBars: pl.beatBars, instant: false });
    for (const st of pl.steps) {
      this.timers.push(this.schedule(() => this.set({ view: { ...this.s.view, ...st.p } }), st.t));
    }
    this.timers.push(this.schedule(() => {
      this.timers = [];
      this.set({ rest: to, moving: null, view: { ...REST_VIEW[to] }, announced: to });
    }, pl.end));
  }

  // events (spec 5.10)
  dispatch(ev) {
    if (this.s.moving) this.finish();
    const { rest } = this.s;
    switch (ev.type) {
      case "CHECK": if (rest === 1) this.go(2, "story"); break;
      case "DESIGN": if (rest === 2) this.go(3, "story"); break;
      case "BACK": if (rest === 3) this.go(1, "compare"); break;
      case "SCRUB": if (ev.n !== rest) this.go(ev.n, "compare"); break;
      case "RESET": if (rest !== 1) this.jump(1); break;
      case "NOTE":
        if (rest !== 3 || !NOTES.includes(ev.k)) break;
        if (this.s.note === ev.k) {
          if (ev.k === "states") this.set({ preview: (this.s.preview + 1) % PREVIEWS.length });
          else this.set({ note: null, preview: 0 });
        } else this.set({ note: ev.k, preview: 0 });
        break;
      case "CLEAR_NOTE": if (rest === 3) this.set({ note: null, preview: 0 }); break;
      case "FINDING": {
        const open = this.s.open.includes(ev.id) ? this.s.open.filter((x) => x !== ev.id) : [...this.s.open, ev.id];
        this.set({ open });
        break;
      }
      default: break;
    }
  }
  destroy() { this.cancel(); }
}
