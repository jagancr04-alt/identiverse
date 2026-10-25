import { platformDetail } from "./platform-details";
import { cache } from "react";
import { db, databaseConfigured } from "./db";
import { pages, defaultSettings, type SiteSettings, type ContentPage } from "./catalog";
import { settingsSchema } from "./validation";
export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!databaseConfigured()) return defaultSettings;
  const row = await db.settings.findUnique({ where: { id: "site" } });
  if (!row) return defaultSettings;
  const settings = settingsSchema.parse(row.data);
  // Upgrade untouched starter copy while preserving owner-authored settings.
  if (settings.heroTitle === "Identity is our expertise.\nSecurity is our foundation.") settings.heroTitle = defaultSettings.heroTitle;
  if (settings.heroDescription === "We architect, engineer, integrate and manage enterprise identity solutions that enable secure, seamless and scalable access across your digital ecosystem.") settings.heroDescription = defaultSettings.heroDescription;
  return settings;
});
export const getPages = cache(async (): Promise<ContentPage[]> => {
  if (!databaseConfigured()) return pages;
  const rows = await db.page.findMany();
  const entries = new Map(pages.map(p => [p.slug, p]));
  for (const row of rows) {
    if (row.published) {
      const stored = row.data as unknown as ContentPage;
      const fallback = entries.get(row.slug);
      let content = { ...fallback, ...stored };
      const starterDescription = `Architecture, implementation and hands-on integration for ${stored.title}. Plan a supportable platform, engineer the required extensions and take changes through a controlled production rollout.`;
      if (stored.group === "technologies" && stored.description === starterDescription) content = platformDetail(content);
      if (fallback?.scope && stored.group === "services") {
        if (stored.outcomes?.[0] === "A documented architecture and clear ownership of identity controls.") content.outcomes = fallback.outcomes;
        if (stored.faqs?.[0]?.q === "Can you work with our existing identity platform?") content.faqs = fallback.faqs;
      }
      entries.set(row.slug, content);
    }
    else entries.delete(row.slug);
  }
  return [...entries.values()].sort((a,b) => (a.order ?? 100) - (b.order ?? 100));
});
export async function getPage(slug: string) { return (await getPages()).find(p => p.slug === slug); }
