import { db } from "@/lib/db";
import { apiError, HttpError, requireAdmin, sameOrigin } from "@/lib/security";
import { contentSchema, settingsSchema } from "@/lib/validation";
import { cleanHtml } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { readJson } from "@/lib/request";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (Number(request.headers.get("content-length") || 0) > 150000) throw new HttpError(413, "Request is too large.");
    const raw = await readJson(request);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new HttpError(400, "Invalid request.");
    const input = raw as Record<string, unknown>;
    const admin = await requireAdmin(input.action === "settings");
    if (input.action === "settings") {
      const parsed = settingsSchema.safeParse(input.data);
      if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
      await db.$transaction([db.settings.upsert({ where: { id: "site" }, create: { id: "site", data: parsed.data }, update: { data: parsed.data } }), db.audit.create({ data: { actor: admin.id, action: "UPDATE_SETTINGS", target: "site" } })]);
    } else if (input.action === "page") {
      const parsed = contentSchema.safeParse(input.data);
      if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);
      const { published, ...content } = parsed.data;
      content.body = cleanHtml(content.body || "");
      const record = { group: content.group, title: content.title, description: content.description, published, data: content };
      await db.$transaction([db.page.upsert({ where: { slug: content.slug }, create: { slug: content.slug, ...record }, update: record }), db.audit.create({ data: { actor: admin.id, action: published ? "PUBLISH_PAGE" : "SAVE_DRAFT", target: content.slug } })]);
    } else if (input.action === "inquiry") {
      if (typeof input.id !== "string" || typeof input.status !== "string" || !["NEW", "IN_PROGRESS", "CLOSED"].includes(input.status)) throw new HttpError(400, "Invalid inquiry update.");
      await db.$transaction([db.inquiry.update({ where: { id: input.id }, data: { status: input.status } }), db.audit.create({ data: { actor: admin.id, action: "UPDATE_INQUIRY", target: input.id } })]);
    } else throw new HttpError(400, "Unknown action.");
    revalidatePath("/", "layout");
    return Response.json({ message: "Changes saved." });
  } catch (error) { return apiError(error); }
}
