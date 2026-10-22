import { absolute } from "@/lib/site";

export default function robots() {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: absolute("/sitemap.xml") };
}
