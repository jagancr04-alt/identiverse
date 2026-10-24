import { PrismaClient } from "@prisma/client";
const [externalId, name, role = "ADMIN"] = process.argv.slice(2);
if (!externalId || !/^[0-9a-f-]{36}$/i.test(externalId) || !name || !["ADMIN", "EDITOR"].includes(role)) {
  console.error('Usage: npm run admin:create -- <Entra-object-ID> "Full name" [ADMIN|EDITOR]'); process.exit(1);
}
const db = new PrismaClient();
async function main() {
  const data = { name, role: role as "ADMIN" | "EDITOR", active: true };
  const admin = await db.admin.upsert({ where: { externalId }, create: { externalId, ...data }, update: data });
  await db.audit.create({ data: { actor: "bootstrap-cli", action: "PROVISION_ADMIN", target: admin.id } });
  console.log(`Authorized ${name} with role ${role}.`);
}
main().catch(() => { console.error("Administrator provisioning failed. Check database configuration."); process.exitCode = 1; }).finally(() => db.$disconnect());
