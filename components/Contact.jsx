import Section from "./Section";
import MailLink from "./MailLink";
import ExternalLink from "./ExternalLink";
import { c, typo } from "@/lib/content";
import { contactAddress } from "@/lib/content";
import PlainState from "./PlainState";

export default function Contact() {
  const has = !!contactAddress();
  const f = c.contact.freelanceDoor;
  return (
    <Section id="contact">
      <div className="grid-12 gap-y-10">
        <div className="col-span-4 md:col-span-6">
          <h2 className="t-display">{typo(c.contact.heading)}</h2>
          <p className="t-lead lead-measure mt-6">{typo(c.contact.lead)}</p>
          {has ? (
            <>
              <div className="mt-8 flex flex-wrap gap-3">
                {c.contact.doors.map((d) => (
                  <MailLink key={d.id} className="btn btn-primary" label={d.label} subject={d.subject} />
                ))}
              </div>
              <p className="eyebrow mt-3">{typo(c.contact.helper)}</p>
              <p className="mt-6 font-mono text-[.8125rem]"><MailLink className="link hit mono-break" showAddress /></p>
            </>
          ) : (
            <PlainState kind="empty" className="mt-8 max-w-md">{c.states.empty}</PlainState>
          )}
          <ul className="mt-2 flex flex-wrap gap-x-4">
            {c.contact.profiles.map((p) => (
              <li key={p.id}><ExternalLink href={p.href} className="btn btn-ghost" ariaLabel={p.accessibleName}>{p.label}</ExternalLink></li>
            ))}
          </ul>
        </div>
        <div className="col-span-4 md:col-span-5 md:col-start-8">
          <p className="t-statement">{typo(f.line)}</p>
          <p className="t-body mt-4 text-ink-2 prose-measure">{typo(f.scope)}</p>
        </div>
      </div>
    </Section>
  );
}
