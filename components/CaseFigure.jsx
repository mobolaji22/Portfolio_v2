import { c, typo } from "@/lib/content";
import { source } from "@/lib/demo-fixture";
import { diff } from "@/lib/demo-model";
import { figureUi } from "@/lib/figure-ui";
import { AdminFigure, StudentFigure, CakeFigure, PaymentsFigure, CommandFigure } from "./sig/Figures";

// Five signature micro-interactions, one per study (coordinator brief, group 6). Strings are existing copy;
// numbers come from the demo fixture through diff(); the UI labels are Engineering-supplied (lib/figure-ui.js).
const sentences = (t) => t.split(/(?<=\.)\s+/);

export default function CaseFigure({ study }) {
  const d = diff(source);
  const L = c.work.labels, D = c.demo, V = c.visuals, lab = D.dashboardLabels;
  const did = study.whatIDid[c.settings.practiceVoice];
  const base = { ui: figureUi, sample: V.sampleData, looked: L.looked, needed: L.needed, alt: `${typo(study.title)}. ${V.sampleData}.` };
  switch (study.id) {
    case "arsididi-admin":
      return <AdminFigure t={{ ...base, ...d, members: lab.members, readout: D.defects[0].readout }} />;
    case "arsididi-student":
      return <StudentFigure t={{ ...base, all: c.receiptsLegend.filter.all, open: lab.openTickets, resolved: lab.resolvedTickets, closed: lab.closedTickets }} />;
    case "cake-studio":
      return <CakeFigure t={{ ...base, caption: sentences(V.cakeCaption), button: c.contact.button }} />;
    case "payments-webhooks":
      return <PaymentsFigure t={{ ...base, row: V.paymentsRow, before: V.paymentsBefore, after: V.paymentsAfter, rule: sentences(did[0].text)[0], replay: sentences(did[2].text)[0], reset: D.controls.reset, state: V.paymentsRow }} />;
    case "command-center":
      return <CommandFigure t={{ ...base, check: D.controls.check, design: D.controls.design, rule: sentences(did[1].text)[1] }} />;
    default: return null;
  }
}
