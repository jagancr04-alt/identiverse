import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPages, getSettings } from "@/lib/content";
import type { Metadata } from "next";
export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: { default: "Identity & Access Management Engineering", template: `%s | ${settings.name}` }, description: settings.heroDescription, alternates: { canonical: "/" }, openGraph: { title: `${settings.name} — ${settings.tagline}`, description: settings.heroDescription, type: "website", images: ["/opengraph-image"] } };
}
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, pages] = await Promise.all([getSettings(), getPages()]);
  const schema = { "@context": "https://schema.org", "@type": "Organization", name: settings.name, description: settings.tagline, address: { "@type": "PostalAddress", addressLocality: settings.location, addressCountry: "IN" }, ...(process.env.NEXT_PUBLIC_SITE_URL ? { url: process.env.NEXT_PUBLIC_SITE_URL } : {}), ...(settings.email ? { email: settings.email } : {}), ...(settings.linkedin ? { sameAs: [settings.linkedin] } : {}) };
  return <div className="company-site"><a className="skip-link" href="#main-content">Skip to content</a><Header settings={settings} pages={pages.map(({ slug, group, title }) => ({ slug, group, title }))}/><main id="main-content">{children}</main><Footer settings={settings}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}/></div>;
}
