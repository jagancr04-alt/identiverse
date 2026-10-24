import { createHmac } from "node:crypto";
import { auth, authConfigured } from "@/auth";
import { db } from "./db";
import { HttpError } from "./errors";
export { HttpError } from "./errors";
export async function requireAdmin(ownerOnly = false) {
  if (!authConfigured()) throw new HttpError(503, "Administrator authentication is not configured.");
  const session = await auth();
  if (!session?.user?.id) throw new HttpError(401, "Sign in required.");
  const admin = await db.admin.findUnique({ where: { externalId: session.user.id } });
  if (!admin?.active || (ownerOnly && admin.role !== "ADMIN")) throw new HttpError(403, "You do not have permission for this action.");
  return admin;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : request.url)).origin;
  if (!origin || origin !== expected) throw new HttpError(403, "Request origin is not allowed.");
}
export async function rateLimit(request: Request) {
  if (!process.env.RATE_LIMIT_SALT) throw new HttpError(503, "The contact service is not configured.");
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "local";
  const minute = Math.floor(Date.now() / 600000);
  const key = createHmac("sha256", process.env.RATE_LIMIT_SALT).update(`${ip}:${minute}`).digest("hex");
  const row = await db.rateLimit.upsert({ where: { key }, create: { key, expiresAt: new Date((minute + 1) * 600000) }, update: { count: { increment: 1 } } });
  if (row.count > 5) throw new HttpError(429, "Too many requests. Please try again in ten minutes.");
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
export function apiError(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof SyntaxError) return Response.json({ error: "Invalid request." }, { status: 400 });
  console.error("Request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ error: "The service is temporarily unavailable. Please try again later." }, { status: 503 });
}
