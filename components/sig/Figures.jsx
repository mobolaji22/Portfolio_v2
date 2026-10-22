"use client";
import { useState } from "react";
import { Segmented, Switch, useStart, useCounter } from "./parts";
import { TickIcon } from "../Icons";
import { sign, sampleEvent, sampleRows } from "@/lib/figure-ui";

const apos = (s) => s.replace(/'/g, "’");
const fill = (s, t) => s.replace(/\{(\w+)\}/g, (_, k) => String(t[k]));

function Frame({ id, alt, sample, left, right, status, headLeft, headRight }) {
  return (
    <figure className="case-plate sig" data-testid="case-figure" data-figure={id}>
      <div role="group" aria-label={apos(alt)}>
        <div className="sig-grid">
          <div className="sig-panel">
            <p className="eyebrow">{headLeft}</p>
            <div className="sig-body">{left}</div>
          </div>
          <div className="sig-panel sig-right">
            <p className="eyebrow">{headRight}</p>
            <div className="sig-body">{right}</div>
          </div>
        </div>
      </div>
      <div role="status" className="sr-only" data-testid="sig-live">{status}</div>
      <figcaption className="eyebrow mt-4">{sample}</figcaption>
    </figure>
  );
}

// 1. ARSIDIDI admin: the response, the key the component reads, the card.
export function AdminFigure({ t }) {
  const [key, setKey, ready] = useStart("activeMembers", "members");
  const fixed = key === "activeMembers";
  const n = useCounter(t.membersHeld, fixed, !ready);
  const readout = fill(t.readout, { membersShown: fixed ? t.membersHeld : t.membersShown, membersHeld: t.membersHeld });
  const status = `${t.members}: ${fixed ? t.membersHeld : t.membersShown}. ${readout}`;
  return (
    <Frame id="arsididi-admin" alt={t.alt} sample={t.sample} status={ready ? status : ""}
      headLeft={t.ui.response} headRight={fixed ? t.needed : t.looked}
      left={
        <>
          <ul className="sig-code" aria-label={t.ui.response}>
            <li data-hit={fixed}><span>activeMembers</span><span>{t.membersHeld}</span>{fixed && <TickIcon className="sig-tick" />}</li>
            <li><span>tickets.open</span><span>{t.openHeld}</span></li>
            <li><span>tickets.resolved</span><span>{t.resolvedHeld}</span></li>
            <li><span>tickets.closed</span><span>{t.closedHeld}</span></li>
          </ul>
          <Segmented label={t.ui.key} value={key} onChange={setKey} hidden={!ready}
            options={[{ value: "members", label: "members", mono: true }, { value: "activeMembers", label: "activeMembers", mono: true }]} />
        </>
      }
      right={
        <div className={`sig-card ${fixed ? "is-fixed" : ""}`}>
          <span className="sig-card-pill">{apos(t.members)}</span>
          <span className="sig-card-fig">
            <span className="count"><span className="count-spacer" aria-hidden="true">{t.membersHeld}</span><span className="count-now">{ready ? n : t.membersHeld}</span></span>
            <span className="fig-bar" data-on={fixed} aria-hidden="true" />
          </span>
          <p className="t-mono-sm sig-readout">{apos(readout)}</p>
        </div>
      }
    />
  );
}

// 2. ARSIDIDI student: the level of the response the list reads.
export function StudentFigure({ t }) {
  const [level, setLevel, ready] = useStart("response.data", "response");
  const [tab, setTab] = useState("all");
  const right = level === "response.data";
  const tabs = [{ value: "all", label: t.all }, { value: "open", label: t.open }, { value: "resolved", label: t.resolved }, { value: "closed", label: t.closed }];
  const rows = right ? sampleRows.filter((r) => tab === "all" || r.s === tab) : [];
  const label = (s) => ({ open: t.open, resolved: t.resolved, closed: t.closed }[s]);
  const status = right ? `${tabs.find((x) => x.value === tab).label}: ${rows.length}` : `${t.all}: ${rows.length}`;
  const changeLevel = (v) => { setLevel(v); if (v !== "response.data") setTab("all"); };
  return (
    <Frame id="arsididi-student" alt={t.alt} sample={t.sample} status={ready ? status : ""}
      headLeft={t.ui.level} headRight={right ? t.needed : t.looked}
      left={
        <>
          <ul className="sig-code" aria-label={t.ui.level}>
            <li data-hit={right}><span>response.data</span><span>{sampleRows.length}</span>{right && <TickIcon className="sig-tick" />}</li>
            <li data-hit={false}><span>response</span><span>{"{ data }"}</span></li>
          </ul>
          <Segmented label={t.ui.level} value={level} onChange={changeLevel} hidden={!ready}
            options={[{ value: "response", label: "response", mono: true }, { value: "response.data", label: "response.data", mono: true }]} />
        </>
      }
      right={
        <div className="sig-list">
          {ready ? (
            <Segmented label={t.looked} value={right ? tab : "all"} onChange={setTab} hidden={false}
              options={(right ? tabs : tabs.slice(0, 1)).map((x) => ({ ...x, label: apos(x.label) }))} />
          ) : (
            <div className="cf-tabs">{tabs.map((x) => <span key={x.value} className="cf-tab" aria-current={x.value === "all" ? "true" : undefined}>{apos(x.label)}</span>)}</div>
          )}
          <ul className="sig-rows" aria-live="off">
            {rows.map((r) => (
              <li key={r.id}><span className="t-mono-sm">{r.id}</span><span className="t-ui">{apos(label(r.s))}</span></li>
            ))}
            {!right && <li className="sig-blank" aria-hidden="true" />}
          </ul>
        </div>
      }
    />
  );
}

// 3. Cake studio: a token that resolves when queried and is used by nothing until applied.
export function CakeFigure({ t }) {
  const [on, setOn, ready] = useStart(true, false);
  const [q, s] = [t.caption[0], on ? `${t.caption[1].split(":")[0]}: ${t.button}.` : t.caption[1]];
  const status = `${q} ${s}`;
  return (
    <Frame id="cake-studio" alt={t.alt} sample={t.sample} status={ready ? status : ""}
      headLeft={t.ui.tokens} headRight={on ? t.needed : t.looked}
      left={
        <>
          <ul className="sig-code" aria-label={t.ui.tokens}>
            <li data-hit="true"><span>--accent</span><span className="sig-swatch" aria-hidden="true" /></li>
          </ul>
          <p className="t-mono-label sig-q">{apos(q)}</p>
          <Switch label={t.ui.apply} name={t.ui.apply} checked={on} onChange={setOn} onWord={t.ui.on} offWord={t.ui.off} hidden={!ready} />
        </>
      }
      right={
        <div>
          <span className={`sig-btn ${on ? "is-applied" : ""}`}><span className="sig-btn-fill" aria-hidden="true" /><span className="sig-btn-text">{apos(t.button)}</span></span>
          <p className="t-mono-label sig-q mt-4">{apos(s)}</p>
        </div>
      }
    />
  );
}

// 4. Payments: a status that only a valid signature can change; money in whole kobo.
export function PaymentsFigure({ t }) {
  const ok = { ...sampleEvent };
  const [paid, setPaid, ready] = useStart(true, false);
  const [kind, setKind] = useState("signed");
  const [log, setLog] = useStart([{ k: "signed", r: "paid" }], []);
  const body = kind === "signed" ? ok : { ...ok, amount_kobo: ok.amount_kobo + 1 }; // an unsigned event: the body no longer matches
  const sig = sign(ok);
  const matches = sign(body) === sig;
  const send = () => {
    const replay = matches && paid;
    const next = matches ? true : paid;
    setPaid(next);
    setLog((l) => [{ k: kind, r: matches ? (replay ? "replay" : "paid") : "refused" }, ...l].slice(0, 3));
  };
  const reset = () => { setPaid(false); setLog([]); setKind("signed"); };
  const state = paid ? t.after : t.before;
  const last = log[0];
  const status = !ready ? "" : last ? `${t.state}: ${state}.${last.r === "replay" ? " " + t.replay : ""}` : `${t.state}: ${state}.`;
  return (
    <Frame id="payments-webhooks" alt={t.alt} sample={t.sample} status={status}
      headLeft={t.ui.eventType} headRight={paid ? t.needed : t.looked}
      left={
        <>
          <ul className="sig-code" aria-label={t.ui.eventType}>
            <li><span>booking</span><span>{body.booking}</span></li>
            <li><span>amount_kobo</span><span>{body.amount_kobo}</span></li>
            <li data-hit={matches}><span>{t.ui.check}</span><span>{matches ? t.ui.matches : t.ui.differs}</span>{matches && <TickIcon className="sig-tick" />}</li>
          </ul>
          <div className="sig-actions" hidden={!ready}>
            <Segmented label={t.ui.eventType} value={kind} onChange={setKind} hidden={!ready}
              options={[{ value: "signed", label: t.ui.signed }, { value: "unsigned", label: t.ui.unsigned }]} />
            <button type="button" className="btn btn-secondary" onClick={send}>{t.ui.send}</button>
            <button type="button" className="btn btn-ghost" onClick={reset}>{apos(t.reset)}</button>
          </div>
        </>
      }
      right={
        <div>
          <div className="cf-row sig-state" data-paid={paid}>
            <span className="t-ui">{apos(t.row)}</span>
            <span className="t-mono-label sig-state-word" key={state}>{apos(state)}</span>
          </div>
          <p className="t-body-sm mt-4 text-ink-2">{apos(t.rule)}</p>
          {log.length > 0 && (
            <ul className="sig-log t-mono-sm" aria-label={t.ui.log}>
              {log.map((l, i) => (
                <li key={i}>{apos(`${l.k === "signed" ? t.ui.signed : t.ui.unsigned} → ${l.r === "paid" ? t.after : l.r === "replay" ? t.replay : t.before}`)}</li>
              ))}
            </ul>
          )}
        </div>
      }
    />
  );
}

// 5. Command center: a control the back end cannot serve is not drawn.
export function CommandFigure({ t }) {
  const [caps, setCaps, ready] = useStart({ check: true, design: false }, { check: true, design: true });
  const missing = !caps.check || !caps.design;
  const status = apos([caps.check && t.check, caps.design && t.design].filter(Boolean).join(". ") + (missing ? `${caps.check || caps.design ? ". " : ""}${t.rule}` : "."));
  return (
    <Frame id="command-center" alt={t.alt} sample={t.sample} status={ready ? status : ""}
      headLeft={t.ui.flags} headRight={missing ? t.needed : t.looked}
      left={
        <div className="sig-switches">
          <Switch label={t.check} name="canCheck" checked={caps.check} onChange={(v) => setCaps({ ...caps, check: v })} onWord={t.ui.on} offWord={t.ui.off} hidden={!ready} />
          <Switch label={t.design} name="canDesign" checked={caps.design} onChange={(v) => setCaps({ ...caps, design: v })} onWord={t.ui.on} offWord={t.ui.off} hidden={!ready} />
          <ul className="sig-code" aria-label={t.ui.flags} hidden={ready}>
            <li data-hit="true"><span>canCheck</span><span>{t.ui.on}</span></li>
            <li><span>canDesign</span><span>{t.ui.off}</span></li>
          </ul>
        </div>
      }
      right={
        <div>
          <div className="sig-controls">
            {[["check", t.check], ["design", t.design]].map(([k, label]) => (
              caps[k] ? <span key={k} className="btn btn-secondary sig-ctrl" aria-hidden="true">{apos(label)}</span> : <span key={k} className="cf-slot sig-ctrl" aria-hidden="true" />
            ))}
          </div>
          {missing && <p className="t-body-sm mt-4 text-ink-2">{apos(t.rule)}</p>}
        </div>
      }
    />
  );
}
