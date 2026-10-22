import { ArrowUpRight } from "./Icons";
import { c, typo } from "@/lib/content";

// External links add the 12 px arrow and the visually hidden suffix (spec 2.3).
export default function ExternalLink({ href, children, className = "link", ariaLabel }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={ariaLabel}>
      {children}
      <ArrowUpRight className="ext-arrow" />
      {!ariaLabel && <span className="sr-only"> {typo(c.states.externalLinkSuffix)}</span>}
    </a>
  );
}
