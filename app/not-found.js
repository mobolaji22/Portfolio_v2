import Link from "next/link";
import PlainState from "@/components/PlainState";
import { c, typo } from "@/lib/content";

export const metadata = { title: { absolute: c.notFound.metaTitle }, robots: c.notFound.robots };

export default function NotFound() {
  return (
    <main id="main" className="page py-16 md:py-24">
      <PlainState kind="empty" className="max-w-[1100px] !p-8 md:!p-12">
        <h1 className="t-display" data-testid="nf-h1">{typo(c.notFound.title)}</h1>
        <p className="t-lead mt-4">{typo(c.notFound.body)}</p>
        <Link href="/#finishing-demo" className="btn btn-primary mt-8">{typo(c.notFound.link)}</Link>
      </PlainState>
    </main>
  );
}
