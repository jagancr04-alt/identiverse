import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
export const metadata: Metadata = { title: { default: "identiVerse | Identity & Access Management Engineering", template: "%s | identiVerse" }, description: "Specialist IAM architecture, engineering, integration and managed support. identiVerse, Bangalore, India.", metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={GeistSans.className}>{children}</body></html>;
}
