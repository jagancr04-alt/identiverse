import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/security";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/content";
import { pages as defaults, type ContentPage } from "@/lib/catalog";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/admin/dashboard";
export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  let admin;
  try { admin = await requireAdmin(); } catch { redirect("/admin/login"); }
  const [settings, rows, inquiries, media, audit] = await Promise.all([getSettings(), db.page.findMany(), db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }), db.media.findMany({ orderBy: { createdAt: "desc" }, take: 100 }), admin.role === "ADMIN" ? db.audit.findMany({ orderBy: { createdAt: "desc" }, take: 100 }) : []]);
  const map = new Map(defaults.map(p => [p.slug, { ...p, published: true }]));
  rows.forEach(p => map.set(p.slug, { ...(p.data as unknown as ContentPage), published: p.published }));
  return <div className="admin-shell"><header className="admin-header"><Brand name={settings.name} logoUrl={settings.logoUrl}/><div><span>{admin.name} · {admin.role}</span><a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a><form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><Button size="sm" variant="outline">Sign out</Button></form></div></header><main className="admin-main"><h1>Website workspace.</h1><p className="admin-meta">Manage content, enquiries and company details.</p><Dashboard initialSettings={settings} initialPages={[...map.values()].sort((a, b) => a.slug.localeCompare(b.slug))} inquiries={inquiries.map(i => ({ ...i, createdAt: i.createdAt.toISOString() }))} media={media} audit={audit.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))} isOwner={admin.role === "ADMIN"}/></main></div>;
}
