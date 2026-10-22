import { c, typo } from "@/lib/content";
import { source } from "@/lib/demo-fixture";
import { diff } from "@/lib/demo-model";
import { TickIcon } from "./Icons";
import { GenGlyph } from "./Icons";

// The five case-study figures (spec 7): the page's own components, two panels, demonstration data.
// Strings are existing copy; numbers come from the demo fixture through diff().
const sentences = (t) => t.split(/(?<=\.)\s+/);

function Panel({ heading, children }) {
  return (
    <div className="cf-panel">
      <p className="eyebrow">{typo(heading)}</p>
      <div className="cf-body">{children}</div>
    </div>
  );
}
function GenCard({ label, value }) {
  return (
    <div className="cf-gcard">
      <span className="cf-gicon" aria-hidden="true"><GenGlyph /></span>
      <span className="cf-gpill">{typo(label)}</span>
      <span className="cf-gfig t-g-kpi">{value}</span>
    </div>
  );
}

export default function CaseFigure({ study }) {
  const d = diff(source);
  const L = c.work.labels;
  const D = c.demo;
  const V = c.visuals;
  const lab = D.dashboardLabels;
  let left, right, alt;
  switch (study.id) {
    case "arsididi-admin":
      left = <GenCard label={lab.members} value={d.membersShown} />;
      right = (
        <div>
          <span className="cf-fig t-figure-xl"><span className="cf-figtext">{d.membersHeld}<span className="fig-bar" data-on="true" /></span><TickIcon className="cf-tick" /></span>
          <p className="t-ui mt-1 text-ink-2">{typo(lab.members)}</p>
          <p className="t-mono-sm mt-2 text-ink-3">{typo(D.defects[0].readout.replace("{membersShown}", d.membersShown).replace("{membersHeld}", d.membersHeld))}</p>
        </div>
      );
      alt = `Two states of one card. Left: ${lab.members} reads ${d.membersShown}. Right: ${lab.members} reads ${d.membersHeld}, with the readout: Shows ${d.membersShown}. The source holds ${d.membersHeld}.`;
      break;
    case "arsididi-student": {
      left = <div className="cf-tabs"><span className="cf-tab" aria-current="true">{typo(c.receiptsLegend.filter.all)}</span></div>;
      right = (
        <div className="cf-tabs">
          {[c.receiptsLegend.filter.all, lab.openTickets, lab.resolvedTickets, lab.closedTickets].map((t, i) => (
            <span key={t} className="cf-tab" aria-current={i === 1 ? "true" : undefined}>{typo(t)}</span>
          ))}
        </div>
      );
      alt = `Two states of one filter bar. Left: one tab, ${c.receiptsLegend.filter.all}, selected. Right: four tabs, ${c.receiptsLegend.filter.all}, ${lab.openTickets}, ${lab.resolvedTickets}, ${lab.closedTickets}, the second selected.`;
      break;
    }
    case "command-center": {
      const rule = sentences(byVoiceList(study)[1].text)[1];
      left = (
        <div className="flex flex-wrap gap-3">
          <span className="btn btn-secondary" aria-hidden="true">{typo(D.controls.check)}</span>
          <span className="btn btn-secondary" aria-hidden="true">{typo(D.controls.design)}</span>
        </div>
      );
      right = (
        <div>
          <div className="flex flex-wrap gap-3">
            <span className="btn btn-secondary" aria-hidden="true">{typo(D.controls.check)}</span>
            <span className="cf-slot" aria-hidden="true" />
          </div>
          <p className="t-body-sm mt-4 text-ink-2">{typo(rule)}</p>
        </div>
      );
      alt = `Two states of one control row. Left: two buttons, ${D.controls.check} and ${D.controls.design}. Right: ${D.controls.check} only, with an empty dashed slot where the second control is not drawn. ${rule}`;
      break;
    }
    case "cake-studio":
      left = <span className="cf-bare t-ui">{typo(c.contact.button)}</span>;
      right = (
        <div>
          <span className="btn btn-primary" aria-hidden="true">{typo(c.contact.button)}</span>
          <p className="t-mono-sm mt-4 text-ink-3">{typo(V.cakeCaption)}</p>
        </div>
      );
      alt = `Two states of one button. Left: ${c.contact.button} with no fill. Right: ${c.contact.button} filled. ${V.cakeCaption}`;
      break;
    case "payments-webhooks": {
      const rule = sentences(byVoiceList(study)[0].text)[0];
      left = <div className="cf-row"><span className="t-ui">{typo(V.paymentsRow)}</span><span className="t-mono-label">{typo(V.paymentsBefore)}</span></div>;
      right = (
        <div>
          <div className="cf-row"><span className="t-ui">{typo(V.paymentsRow)}</span><span className="t-mono-label">{typo(V.paymentsAfter)}</span></div>
          <p className="t-body-sm mt-4 text-ink-2">{typo(rule)}</p>
        </div>
      );
      alt = `Two states of one booking row. Left: ${V.paymentsRow}, ${V.paymentsBefore}. Right: ${V.paymentsRow}, ${V.paymentsAfter}. ${rule}`;
      break;
    }
    default: return null;
  }
  return (
    <figure className="case-plate" data-testid="case-figure" data-figure={study.id}>
      <div role="img" aria-label={typo(alt)} className="cf-grid">
        <Panel heading={L.looked}>{left}</Panel>
        <Panel heading={L.needed}>{right}</Panel>
      </div>
      <figcaption className="eyebrow mt-4">{typo(V.demonstrationData)}</figcaption>
    </figure>
  );
}
function byVoiceList(s) { return s.whatIDid[c.settings.practiceVoice]; }
