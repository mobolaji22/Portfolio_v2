import { c, typo } from "@/lib/content";
import { source } from "@/lib/demo-fixture";
import { diff } from "@/lib/demo-model";
import { figureUi } from "@/lib/figure-ui";
import { TickIcon } from "./Icons";

// A small static rendering of each case figure's END state: the memorable object of the row. Decorative
// (aria-hidden): the row's text carries the meaning. Strings are existing copy; numbers come from the fixture.
export default function WorkThumb({ id }) {
  const d = diff(source);
  const lab = c.demo.dashboardLabels, V = c.visuals;
  let body = null;
  if (id === "arsididi-admin") {
    body = (
      <div className="sig-card is-fixed" style={{ minWidth: 0 }}>
        <span className="sig-card-pill">{typo(lab.members)}</span>
        <span className="sig-card-fig"><span>{d.membersHeld}</span><span className="fig-bar" data-on="true" /></span>
      </div>
    );
  } else if (id === "arsididi-student") {
    const tabs = [c.receiptsLegend.filter.all, lab.openTickets, lab.resolvedTickets, lab.closedTickets];
    body = (
      <div className="wt-stack">
        <div className="cf-tabs">{tabs.map((t, i) => <span key={t} className="cf-tab" aria-current={i === 1 ? "true" : undefined}>{typo(t)}</span>)}</div>
        <div className="wt-line"><span className="t-mono-sm">r-01</span><span className="t-ui">{typo(lab.openTickets)}</span></div>
        <div className="wt-line"><span className="t-mono-sm">r-04</span><span className="t-ui">{typo(lab.openTickets)}</span></div>
      </div>
    );
  } else if (id === "command-center") {
    body = (
      <div className="flex flex-wrap items-center gap-3">
        <span className="btn btn-secondary">{typo(c.demo.controls.check)}</span>
        <span className="cf-slot" style={{ minWidth: 90 }} />
      </div>
    );
  } else if (id === "cake-studio") {
    body = (
      <div>
        <span className="sig-btn is-applied"><span className="sig-btn-fill" /><span className="sig-btn-text">{typo(c.contact.button)}</span></span>
        <p className="t-mono-sm mt-3 text-ink-3">{typo(V.cakeCaption)}</p>
      </div>
    );
  } else if (id === "payments-webhooks") {
    body = (
      <div className="cf-row"><span className="t-ui">{typo(V.paymentsRow)}</span><span className="t-mono-label">{typo(V.paymentsAfter)}</span></div>
    );
  }
  void figureUi; void TickIcon;
  return <div className="wt" aria-hidden="true">{body}</div>;
}
