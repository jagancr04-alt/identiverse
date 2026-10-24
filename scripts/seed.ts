import { PrismaClient } from "@prisma/client";
import { pages, defaultSettings } from "../src/lib/catalog";
const db = new PrismaClient();
async function main() {
  await db.settings.upsert({ where: { id: "site" }, create: { id: "site", data: defaultSettings }, update: {} });
  for (const page of pages) await db.page.upsert({ where: { slug: page.slug }, create: { slug: page.slug, group: page.group, title: page.title, description: page.description, published: true, data: JSON.parse(JSON.stringify(page)) }, update: {} });
  console.log(`Seed complete: ${pages.length} content pages. Existing records were preserved.`);
}
main().catch(() => { console.error("Seed failed. Check database configuration."); process.exitCode = 1; }).finally(() => db.$disconnect());
