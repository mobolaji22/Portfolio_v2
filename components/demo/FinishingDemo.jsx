"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, useCallback } from "react";
import { LazyMotion, domMax, m, LayoutGroup, MotionConfig } from "framer-motion";
import Scrubber from "./Scrubber";
import Overlay from "./Overlay";
import { DemoController, STATE_NAMES, PREVIEWS } from "@/lib/demo-machine";
import { niceCeil } from "@/lib/demo-model";
import { GenGlyph, TickIcon } from "../Icons";

const SPRING = { type: "spring", duration: 0.52, bounce: 0 };
const fillTokens = (s, t) => s.replace(/\{(\w+)\}/g, (_, k) => {
  if (!(k in t)) throw new Error(`demo: missing token ${k}`);
  return String(t[k]);
});
const apos = (s) => s.replace(/'/g, "’");
const T = (s, t = {}) => apos(fillTokens(s, t));

// ---- a figure: two stacked glyph runs (Inter, Plex Mono); the only cross-dissolve (spec 5.9) ----
function Fig({ des, genCls, desCls, confirmed, hidden, children, align, preview, previewText }) {
  if (preview && preview !== "data") {
    return (
      <span className="fig fig-preview" data-preview={preview}>
        {preview === "error" ? <span className="t-mono-sm">{previewText}</span> : <span className="hatch" aria-hidden="true" />}
      </span>
    );
  }
  const run = (cls, isDes) => (
    <span className={`run ${isDes ? "run-des" : "run-gen"} ${cls}`} aria-hidden={isDes !== des ? "true" : undefined}>
      <span className="fig-text">
        {children}
        <span className="fig-bar" data-on={confirmed} aria-hidden="true" />
      </span>
      <TickIcon className="fig-tick" />
    </span>
  );
  return (
    <span className="fig" data-align={align} data-confirmed={confirmed} style={hidden ? { visibility: "hidden" } : undefined}>
      {run(genCls, false)}
      {run(desCls, true)}
    </span>
  );
}

// a value with an old (wrong) and a new (checked) reading; the new one sizes the figure
function Reading({ oldV, newV, fixed, travelId }) {
  return (
    <>
      <span className="val val-old" data-on={!fixed}>
        <span className="val-travel" data-travel={travelId}>{oldV}</span>
      </span>
      <span className="val val-new" data-on={fixed}>{newV}</span>
    </>
  );
}

export default function FinishingDemo({ copy, tokens, source, chips, noJsBody, credit, designCredit }) {
  const ctrlRef = useRef(null);
  if (!ctrlRef.current) ctrlRef.current = new DemoController({ initialRest: 3 });
  const ctrl = ctrlRef.current;
  const snap = useSyncExternalStore(ctrl.subscribe, ctrl.getSnapshot, ctrl.getSnapshot);
  const [hydrated, setHydrated] = useState(false);
  const [reduced, setReduced] = useState(false);
  const plateRef = useRef(null);
  const primaryRef = useRef(null);
  const resetRef = useRef(null);

  // SSR renders the Designed state; on mount the client starts at Generated with no animation (spec 5.13)
  useLayoutEffect(() => {
    ctrl.jump(1);
    setHydrated(true);
  }, [ctrl]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => { setReduced(mq.matches); ctrl.setReduced(mq.matches); };
    on();
    mq.addEventListener("change", on);
    return () => { mq.removeEventListener("change", on); ctrl.destroy(); };
  }, [ctrl]);

  const { rest, moving, view, note, preview, open, announced, instant } = snap;
  // Beat B3 (bet B9): the figure 61 travels from the Resolved card to the new Closed card. A hand-made FLIP on
  // transform only (shared-layout opacity crossfades stalled at 360 px in the first build: friction T1.6-F5).
  const lastFrom = useRef(null);
  useLayoutEffect(() => {
    const plate = plateRef.current; if (!plate) return;
    if (!view.closed) {
      const old = plate.querySelector('[data-testid="kpi-resolved"] .val-old .val-travel');
      if (old) lastFrom.current = old.getBoundingClientRect();
      return;
    }
    const el = plate.querySelector('[data-testid="closed-61"]');
    if (el && lastFrom.current && !instant && !reduced && moving) {
      const to = el.getBoundingClientRect(); const f = lastFrom.current;
      el.animate([{ transform: `translate(${f.left - to.left}px, ${f.top - to.top}px)` }, { transform: "none" }], { duration: 320 * (moving.tempo === "compare" ? 0.55 : 1), easing: "cubic-bezier(0.65, 0, 0.35, 1)" });
    }
    lastFrom.current = null;
  }, [view.closed]); // eslint-disable-line react-hooks/exhaustive-deps
  const d = tokens;
  const dispatch = useCallback((ev) => ctrl.dispatch(ev), [ctrl]);

  // keep focus on the primary button if the focused control is removed (Start over)
  const onReset = () => { dispatch({ type: "RESET" }); primaryRef.current?.focus(); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && note) dispatch({ type: "CLEAR_NOTE" }); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [note, dispatch]);

  const tempoK = moving?.tempo === "compare" ? 0.55 : 1;
  const delayK = moving?.tempo === "compare" ? 0.4 : 1;
  const toggling = moving && (moving.to === 3 || moving.from === 3);
  const lay = (i) => instant || reduced
    ? { layout: { duration: 0 } }
    : { layout: { ...SPRING, duration: SPRING.duration * (moving ? tempoK : 1), delay: toggling ? ([0, 0.06, 0.12, 0.16, 0.2][i] ?? 0) * delayK : 0 } };

  const stateName = STATE_NAMES[announced];
  const announce = useMemo(() => T(copy.states[stateName].announce, d), [stateName, d, copy]);
  const hint = rest === 1 && copy.preStep ? copy.hero.preStep : copy.controls.scrubberHint;
  const primary = rest === 1 ? { label: copy.controls.check, cls: "btn-mark", ev: "CHECK" }
    : rest === 2 ? { label: copy.controls.design, cls: "btn-mark", ev: "DESIGN" }
    : { label: copy.controls.back, cls: "btn-secondary", ev: "BACK" };
  const loading = moving && moving.from === 1 && moving.to === 2 && moving.tempo === "story";
  const valueText = T(copy.a11y.scrubber.valueText, { stateName: copy.controls.stateNames[stateName], n: rest });

  const isDesignedRest = rest === 3 && !moving;
  const ty = view.ty;
  const ymax = niceCeil(d.seriesMax);
  const series = source.signupsByWeek;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * 100, 100 - (v / ymax) * 100]);
  const polyline = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `0,100 ${polyline} 100,100`;
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const chartAlt = T(
    announced === 1 ? copy.labels.chartAltGenerated : announced === 2 ? copy.labels.chartAltChecked : copy.labels.chartAltDesigned, d);
  const previewKind = isDesignedRest && note === "states" ? PREVIEWS[preview] : "data";
  const previewText = { loading: copy.states.loading, empty: copy.states.empty, error: copy.states.error }[previewKind];
  // in the error preview every figure reads "Not checked." and no zero is drawn (spec 5.11)
  const figText = previewKind === "error" ? copy.states.notChecked : previewText;
  const [scanDist, setScanDist] = useState(0);
  useEffect(() => { if (view.scan && plateRef.current) setScanDist(plateRef.current.clientHeight); }, [view.scan]);

  const cardLabel = (key) => copy.labels[key];
  const kpi = (key, idx, value) => T(copy.a11y.cardAnnouncement, { label: cardLabel(key), value });

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <section
          id="finishing-demo" data-demo="" data-hydrated={hydrated ? "" : undefined} tabIndex={-1}
          aria-label={copy.regionLabel} className="demo" data-note={note && isDesignedRest ? note : undefined}
        >
          <p className="demo-hint t-mono-label js-only" data-testid="hint" hidden={!hydrated}>{apos(hint)}</p>
          {reduced && <p className="demo-reduced t-mono-label" data-testid="reduced-note">{apos(copy.reducedMotion)}</p>}

          <div className="demo-toolbar js-only" hidden={!hydrated}>
            <Scrubber
              rest={rest} names={copy.controls.stateNames && { 1: copy.controls.stateNames.generated, 2: copy.controls.stateNames.checked, 3: copy.controls.stateNames.designed }}
              label={copy.controls.scrubberLabel} valueText={valueText}
              onCommit={(n) => dispatch({ type: "SCRUB", n })}
            />
            <button ref={primaryRef} type="button" data-tabn="2" className={`btn ${primary.cls} demo-primary`} data-testid="primary" aria-busy={loading ? "true" : undefined}
              onClick={() => dispatch({ type: primary.ev })}>
              <span key={loading ? "loading" : primary.label} className="label-fade">{apos(loading ? copy.states.loading : primary.label)}</span>
            </button>
            {rest !== 1 && (
              <button ref={resetRef} type="button" data-tabn="3" className="btn btn-ghost demo-reset" data-testid="reset" onClick={onReset}>{apos(copy.controls.reset)}</button>
            )}
          </div>

          <div
            ref={plateRef} role="group" aria-label={copy.a11y.dashboard.name} aria-busy={moving ? "true" : undefined}
            className="plate" data-testid="plate"
            data-look={view.look} data-deco={view.deco} data-surf={view.surf} data-closed={view.closed}
            data-state={moving ? "moving" : STATE_NAMES[rest]} data-from={moving?.from ?? ""} data-to={moving?.to ?? ""} data-tempo={moving?.tempo ?? ""}
            data-note={note ?? ""} data-preview={previewKind}
            style={{ "--tempo": tempoK, "--scan-dist": `${scanDist}px` }}
          >
            <LayoutGroup>
              <div className="screen" data-testid="screen">
                <span className="screen-layer screen-g" aria-hidden="true" />
                <span className="screen-layer screen-p" aria-hidden="true" />

                <m.p layout="position" transition={lay(0)} className="dash-title" data-testid="dash-title" data-ov="title">
                  <span className="dash-title-gen t-g-title">{apos(copy.dashboardTitle)}</span>
                  <span className="dash-title-des t-mono-label">{apos(copy.dashboardTitle)}</span>
                  <span className="gen-glyph-tile" aria-hidden="true"><GenGlyph /></span>
                </m.p>
                <span className="title-rule rule-draw" data-on={view.rules} aria-hidden="true" />

                {/* members: the lead figure in the Designed look */}
                <m.article layout transition={lay(0)} className="kpi" data-key="members" data-testid="kpi-members" data-des={ty > 0} data-ov="lead"
                  aria-label={kpi("members", 0, moving || rest === 1 ? (view.mFixed ? d.membersHeld : d.membersShown) : d.membersHeld)}>
                  <span className="chrome" aria-hidden="true" />
                  <span className="icon-tile" aria-hidden="true"><GenGlyph /></span>
                  <m.div layout="position" transition={lay(0)} className="kpi-label"><span className="pill-chrome" aria-hidden="true" /><span className="kpi-label-text">{apos(copy.labels.members)}</span></m.div>
                  <m.div layout="position" transition={lay(0)} className="kpi-fig">
                    <Fig des={ty > 0} genCls="t-g-kpi" desCls="t-figure-xl" confirmed={view.bm} preview={previewKind} previewText={figText}>
                      <Reading oldV={d.membersShown} newV={d.membersHeld} fixed={view.mFixed} />
                    </Fig>
                  </m.div>
                  <m.p layout="position" transition={lay(0)} className="readout t-mono-sm" data-on={view.rm} data-testid="readout-members">{T(copy.defects[0].readout, d)}</m.p>
                </m.article>

                {/* the chart */}
                <m.figure layout transition={lay(1)} className="chart" data-key="chart" data-testid="chart" data-des={ty > 1} data-ov="chart">
                  <span className="chrome" aria-hidden="true" />
                  <m.figcaption layout="position" transition={lay(1)} className="chart-label"><span className="chart-label-text">{apos(copy.labels.chart)}</span></m.figcaption>
                  <div className="chart-body">
                    <div className="grid-lines" aria-hidden="true"><i /><i /><i /><i /></div>
                    <div className="base-line rule-draw" data-on={view.rules} aria-hidden="true" />
                    <div className="chart-inner">
                      <div className="line-layer">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={chartAlt} className="chart-svg">
                          <polygon points={area} className="chart-area" />
                          <polyline points={polyline} className="chart-line" fill="none" vectorEffect="non-scaling-stroke" />
                        </svg>
                        <span className="chart-dot-wrap" style={{ left: `${lastPt[0]}%`, top: `${lastPt[1]}%` }} data-on={view.last} aria-hidden="true"><i className="chart-dot" /></span>
                        <span className="end-label end-first" style={{ top: `${firstPt[1]}%` }} aria-hidden="true" data-on={view.last}><span className="t-mono-sm">{d.seriesFirst}</span></span>
                        <span className="end-label end-last" style={{ top: `${lastPt[1]}%` }} data-on={view.last}>
                          <Fig des={ty > 1} genCls="t-g-label" desCls="t-figure-l" confirmed={view.bs} align="right"><span>{d.seriesLast}</span></Fig>
                        </span>
                        <div className="curtain" data-on={view.series} aria-hidden="true" />
                      </div>
                      <div className="ticks" aria-hidden="true">
                        {series.map((_, i) => (
                          <span key={i} className="tick t-g-axis" data-major={i === 0 || i === 4 || i === 9} style={{ left: `${(i / (series.length - 1)) * 100}%` }}>{i + 1}</span>
                        ))}
                      </div>
                    </div>
                    {previewKind !== "data" && (
                      <div className="chart-preview" data-preview={previewKind}>
                        <div className={`plain-state ${previewKind === "loading" ? "plain-state-loading" : ""} t-body-sm`}>{apos(previewText)}</div>
                      </div>
                    )}
                  </div>
                  <m.p layout="position" transition={lay(1)} className="readout t-mono-sm" data-on={view.rc} data-testid="readout-chart">{T(copy.defects[1].readout, d)}</m.p>
                </m.figure>

                {/* tickets: cards in the Generated look, ledger rows in the Designed look */}
                <m.article layout transition={lay(2)} className="kpi" data-key="open" data-testid="kpi-open" data-des={ty > 2} data-ov="ledger" aria-label={kpi("openTickets", 2, d.openHeld)}>
                  <span className="chrome" aria-hidden="true" />
                  <span className="rule rule-draw" data-on={view.rules} aria-hidden="true" />
                  <span className="icon-tile" aria-hidden="true"><GenGlyph /></span>
                  <m.div layout="position" transition={lay(2)} className="kpi-label"><span className="pill-chrome" aria-hidden="true" /><span className="kpi-label-text">{apos(copy.labels.openTickets)}</span></m.div>
                  <span className="leader" aria-hidden="true" data-on={view.rules} />
                  <m.div layout="position" transition={lay(2)} className="kpi-fig">
                    <Fig des={ty > 2} genCls="t-g-kpi" desCls="t-figure-l" confirmed={view.bo} align="right" preview={previewKind} previewText={figText}><span className="val val-new" data-on="true">{d.openHeld}</span></Fig>
                  </m.div>
                </m.article>

                <m.article layout transition={lay(3)} className="kpi" data-key="resolved" data-testid="kpi-resolved" data-des={ty > 3} data-ov="ledger" aria-label={kpi("resolvedTickets", 3, view.rFixed ? d.resolvedHeld : d.resolvedShown)}>
                  <span className="chrome" aria-hidden="true" />
                  <span className="rule rule-draw" data-on={view.rules} aria-hidden="true" />
                  <span className="icon-tile" aria-hidden="true"><GenGlyph /></span>
                  <m.div layout="position" transition={lay(3)} className="kpi-label"><span className="pill-chrome" aria-hidden="true" /><span className="kpi-label-text">{apos(copy.labels.resolvedTickets)}</span></m.div>
                  <span className="leader" aria-hidden="true" data-on={view.rules} />
                  <m.div layout="position" transition={lay(3)} className="kpi-fig">
                    <Fig des={ty > 3} genCls="t-g-kpi" desCls="t-figure-l" confirmed={view.br} align="right" preview={previewKind} previewText={figText}>
                      <Reading oldV={d.resolvedShown} newV={d.resolvedHeld} fixed={view.rFixed} travelId="fig-61" />
                    </Fig>
                  </m.div>
                  <m.p layout="position" transition={lay(3)} className="readout t-mono-sm" data-on={view.rr} data-testid="readout-resolved">{T(copy.defects[2].readout, d)}</m.p>
                </m.article>

                {view.closed && (
                  <m.article layout transition={lay(4)} className="kpi kpi-closed" data-key="closed" data-testid="kpi-closed" data-des={ty > 4} data-ov="ledger" aria-label={kpi("closedTickets", 4, d.closedHeld)}>
                    <span className="chrome" aria-hidden="true" />
                    <span className="rule rule-draw" data-on={view.rules} aria-hidden="true" />
                    <span className="icon-tile" aria-hidden="true"><GenGlyph /></span>
                    <m.div layout="position" transition={lay(4)} className="kpi-label"><span className="pill-chrome" aria-hidden="true" /><span className="kpi-label-text">{apos(copy.labels.closedTickets)}</span></m.div>
                    <span className="leader" aria-hidden="true" data-on={view.rules} />
                    <m.div layout="position" transition={lay(4)} className="kpi-fig">
                      <Fig des={ty > 4} genCls="t-g-kpi" desCls="t-figure-l" confirmed={view.bc} align="right" preview={previewKind} previewText={figText}>
                        <span className="val val-new" data-on="true"><span className="val-travel" data-travel="fig-61" data-testid="closed-61">{d.closedHeld}</span></span>
                      </Fig>
                    </m.div>
                  </m.article>
                )}

                {view.scan && <div className="scan" aria-hidden="true" />}
                <Overlay note={note} plateRef={plateRef} active={isDesignedRest} />
              </div>
            </LayoutGroup>
          </div>

          <div role="status" className="sr-only" data-testid="live">{announce}</div>

          <div className="demo-caption" data-testid="caption">
            <p key={view.cap} className="t-lead cap-fade">{apos(copy.states[view.cap].caption)}</p>
            {view.cap === "checked" && copy.states.checked.captionSub && (
              <p className="t-body-sm cap-sub">{apos(copy.states.checked.captionSub)}</p>
            )}
            {view.cap === "checked" && copy.states.checked.gloss && (
              <p className="t-body-sm cap-gloss">{apos(copy.states.checked.gloss)}</p>
            )}
          </div>

          <ul className="findings js-only" data-testid="findings" hidden={!hydrated}>
            {copy.defects.map((df, i) => {
              const on = i < view.find;
              const isOpen = open.includes(df.id);
              return (
                <li key={df.id} className="finding" data-on={on} aria-hidden={on ? undefined : "true"}>
                  <button type="button" data-tabn={4 + i} className="finding-btn t-mono-label" aria-expanded={isOpen} tabIndex={on ? 0 : -1}
                    aria-controls={`finding-${df.id}`} onClick={() => dispatch({ type: "FINDING", id: df.id })}>
                    <span className="finding-name">{apos(df.name)}</span>
                    <span className="finding-read">{T(df.readout, d)}{i === 2 && df.caption ? ` ${apos(df.caption)}` : ""}</span>
                  </button>
                  <p id={`finding-${df.id}`} className="t-body-sm finding-explain" hidden={!isOpen}>{apos(df.explain)}</p>
                </li>
              );
            })}
          </ul>

          <div className="notes js-only" data-on={view.notes} data-testid="notes" hidden={!hydrated || !(view.notes || rest === 3)}>
            <div className="notes-row" role="group" aria-label={apos(copy.regionLabel)}>
              {copy.notes.map((nt, i) => (
                <button key={nt.id} type="button" data-tabn={7 + i} className="note-btn t-ui-sm" aria-pressed={note === nt.id} tabIndex={view.notes && isDesignedRest ? 0 : -1}
                  style={{ transitionDelay: `${i * 40}ms` }} onClick={() => dispatch({ type: "NOTE", k: nt.id })}>{apos(nt.label)}</button>
              ))}
            </div>
            {note && <p className="t-body-sm note-text" data-testid="note-text">{apos(copy.notes.find((x) => x.id === note).text)}
              {note === "states" && preview > 0 && <span className="t-mono-label preview-count"> {preview}/{PREVIEWS.length - 1}</span>}</p>}
            <p className="t-mono-label contrast-line" data-on={view.notes}><span className="th-light">{copy.contrast.light}</span><span className="th-dark">{copy.contrast.dark}</span></p>
          </div>

          <div className="credits">
            <p className="t-mono-label">{apos(credit)}</p>
            <p className="t-mono-label">{apos(designCredit)}</p>
            {chips}
          </div>

          <div className="nojs-only" data-testid="nojs">
            <p className="t-body-sm">{apos(copy.states.noScript)}</p>
            <h3 className="t-h3">{apos(copy.noJs.title)}</h3>
            <p className="t-body">{noJsBody}</p>
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
