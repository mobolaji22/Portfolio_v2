import { c, typo } from "@/lib/content";
import { absolute } from "@/lib/site";

export const dynamic = "force-static";

// Built from meta.llmsTxt in the content file; {SITE_URL} is filled from the one environment value.
export function GET() {
  const body = c.meta.llmsTxt.map((l) => typo(l).replace("{SITE_URL}", absolute("/").replace(/\/$/, ""))).join("\n\n") + "\n";
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
