import { z } from "zod";
const safeUrl = z.string().max(500).refine(v => !v || /^https:\/\//.test(v), "Use an https:// URL");
const imageUrl = z.string().max(500).refine(v => !v || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(v), "Use an uploaded image URL from the media library");
export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(60), tagline: z.string().trim().max(150), location: z.string().trim().min(2).max(100),
  email: z.union([z.email(), z.literal("")]), phone: z.string().max(40), linkedin: safeUrl, logoUrl: imageUrl,
  heroTitle: z.string().trim().min(5).max(160), heroDescription: z.string().trim().min(20).max(500)
});
export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.email("Enter a valid work email").max(254),
  company: z.string().trim().min(2, "Enter your company").max(150),
  service: z.string().trim().min(2).max(100),
  message: z.string().trim().min(20, "Please add at least 20 characters").max(5000),
  consent: z.literal(true, { error: "Please agree before sending" }),
  website: z.string().max(0), startedAt: z.number()
});
export const contentSchema = z.object({
  slug: z.string().regex(/^(services|solutions|technologies|industries|compliance|resources)\/[a-z0-9]+(?:-[a-z0-9]+)*$/),
  group: z.enum(["services", "solutions", "technologies", "industries", "compliance", "resources"]),
  title: z.string().trim().min(2).max(160), eyebrow: z.string().max(100), description: z.string().trim().min(20).max(600),
  capabilities: z.array(z.string().min(1).max(300)).min(1).max(30), challenges: z.array(z.string().max(500)).max(15),
  outcomes: z.array(z.string().max(500)).max(15), platforms: z.array(z.string().max(100)).max(30),
  faqs: z.array(z.object({ q: z.string().min(1).max(200), a: z.string().min(1).max(1500) })).max(20),
  body: z.string().max(100000).optional(), logoUrl: imageUrl.optional(), published: z.boolean()
}).refine(v => v.slug.startsWith(v.group + "/"), "Slug must match the selected section");
