import type { MetadataRoute } from "next";
import { getPages } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return ["", "services", "solutions", "technologies", "industries", "compliance", "resources", "about", "contact", "privacy", "terms", "cookies", "compliance/controls", "resources/faqs", ...(await getPages()).map(p => p.slug)].map(path => ({ url: `${base}/${path}`, changeFrequency: "monthly", priority: path ? .7 : 1 }));
}
