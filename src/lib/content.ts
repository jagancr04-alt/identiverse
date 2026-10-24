import { cache } from "react";
import { db, databaseConfigured } from "./db";
import { pages, defaultSettings, type SiteSettings, type ContentPage } from "./catalog";
import { settingsSchema } from "./validation";
export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!databaseConfigured()) return defaultSettings;
  const row = await db.settings.findUnique({ where: { id: "site" } });
  if (!row) return defaultSettings;
  return settingsSchema.parse(row.data);
});
export const getPages = cache(async (): Promise<ContentPage[]> => {
  if (!databaseConfigured()) return pages;
  const rows = await db.page.findMany();
  const entries = new Map(pages.map(p => [p.slug, p]));
  for (const row of rows) {
    if (row.published) entries.set(row.slug, row.data as unknown as ContentPage);
    else entries.delete(row.slug);
  }
  return [...entries.values()];
});
export async function getPage(slug: string) { return (await getPages()).find(p => p.slug === slug); }
