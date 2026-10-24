import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { apiError, HttpError, requireAdmin, sameOrigin } from "@/lib/security";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const admin = await requireAdmin();
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new HttpError(503, "Image storage is not configured.");
    if (Number(request.headers.get("content-length") || 0) > 4500000) throw new HttpError(413, "Use an image smaller than 4 MB.");
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File) || file.size > 4000000) throw new HttpError(400, "Choose a PNG, JPEG or WebP image smaller than 4 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    const type = png ? "image/png" : jpeg ? "image/jpeg" : webp ? "image/webp" : "";
    if (!type || type !== file.type) throw new HttpError(400, "Invalid image format.");
    const blob = await put(`images/${randomUUID()}.${png ? "png" : jpeg ? "jpg" : "webp"}`, Buffer.from(bytes), { access: "public", contentType: type });
    const media = await db.media.create({ data: { url: blob.url, name: file.name.slice(0, 200), type } });
    await db.audit.create({ data: { actor: admin.id, action: "UPLOAD_IMAGE", target: media.id } });
    return Response.json(media, { status: 201 });
  } catch (error) { return apiError(error); }
}
