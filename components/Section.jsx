// Section frame: full-width hairline above, page gutters, vertical padding per spec 2.1.
export default function Section({ id, children, band = false, lens = false, className = "" }) {
  return (
    <section id={id} className={`section ${band ? "section-band" : ""} ${className}`} data-lens-section={lens ? "" : undefined}>
      <div className="page">{children}</div>
    </section>
  );
}
