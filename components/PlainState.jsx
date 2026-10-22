import { typo } from "@/lib/content";
// The page's own states (spec 3.6): one form, dashed frame, no label naming the kind.
export default function PlainState({ kind, children, className = "", as: Tag = "div" }) {
  return (
    <Tag className={`plain-state ${kind === "loading" ? "plain-state-loading" : ""} ${className}`} data-kind={kind}>
      {typeof children === "string" ? typo(children) : children}
    </Tag>
  );
}
