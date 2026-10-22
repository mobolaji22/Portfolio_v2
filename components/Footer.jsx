import { c, typo, aiLine, fill } from "@/lib/content";
import ExternalLink from "./ExternalLink";
import MailLink from "./MailLink";

export default function Footer({ base = "" }) {
  const gh = c.contact.profiles.find((p) => p.id === "github");
  const li = c.contact.profiles.find((p) => p.id === "linkedin");
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-rule">
      <div className="page grid-12 gap-y-8 py-12 md:py-16">
        <div className="col-span-4 md:col-span-5">
          <p className="t-body-sm prose-measure">{typo(aiLine("footer"))}</p>
          <p className="t-body-sm prose-measure mt-3 text-ink-2">{typo(c.footer.accessibility)}</p>
        </div>
        <div className="col-span-4 md:col-span-4">
          <p className="t-body-sm text-ink-2">
            {typo(c.footer.tagsNote)}{" "}
            <a className="link" href={base + c.footer.tagsNoteLink}>{typo(c.receiptsLegend.heading)}</a>
          </p>
        </div>
        <ul className="col-span-4 flex flex-col gap-1 font-mono text-[.8125rem] md:col-span-3">
          <li><ExternalLink href={gh.href} className="link hit" ariaLabel={gh.accessibleName}>{gh.label}</ExternalLink></li>
          <li><ExternalLink href={li.href} className="link hit" ariaLabel={li.accessibleName}>{li.label}</ExternalLink></li>
          <li><MailLink className="link hit" label={c.contact.button} /></li>
          <li className="eyebrow pt-2">{fill(c.footer.copyright, { year })}</li>
        </ul>
      </div>
    </footer>
  );
}
