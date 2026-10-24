import { db, databaseConfigured } from "@/lib/db";
import { inquirySchema } from "@/lib/validation";
import { apiError, HttpError, rateLimit, sameOrigin } from "@/lib/security";
import { readJson } from "@/lib/request";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!databaseConfigured()) throw new HttpError(503, "The consultation form is not yet connected. Please try again later.");
    if (Number(request.headers.get("content-length") || 0) > 20000) throw new HttpError(413, "Request is too large.");
    await rateLimit(request);
    const parsed = inquirySchema.safeParse(await readJson(request, 20000));
    if (!parsed.success) throw new HttpError(400, "Please check the form fields and try again.");
    const { website, startedAt, consent, ...fields } = parsed.data;
    void website; void consent;
    if (Date.now() - startedAt < 2500 || Date.now() - startedAt > 86400000) throw new HttpError(400, "Please refresh the page and try again.");
    const inquiry = await db.inquiry.create({ data: fields });
    let emailStatus = "NOT_CONFIGURED";
    if (process.env.RESEND_API_KEY && process.env.CONTACT_FROM && process.env.CONTACT_TO) {
      try {
        const result = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": inquiry.id }, body: JSON.stringify({ from: process.env.CONTACT_FROM, to: [process.env.CONTACT_TO], reply_to: fields.email, subject: `IAM consultation: ${fields.service}`, text: `Name: ${fields.name}\nCompany: ${fields.company}\nEmail: ${fields.email}\nService: ${fields.service}\n\n${fields.message}` }), signal: AbortSignal.timeout(8000) });
        emailStatus = result.ok ? "SENT" : "FAILED";
      } catch { emailStatus = "FAILED"; }
    }
    await db.inquiry.update({ where: { id: inquiry.id }, data: { emailStatus } });
    return Response.json({ message: "Your consultation request has been received. Thank you for getting in touch." }, { status: 201 });
  } catch (error) { return apiError(error); }
}
