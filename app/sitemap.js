import { absolute } from "@/lib/site";
import { studies } from "@/lib/content";

export default function sitemap() {
  return [
    { url: absolute("/") },
    ...studies().map((s) => ({ url: absolute(`/work/${s.slug}`) })),
  ];
}
