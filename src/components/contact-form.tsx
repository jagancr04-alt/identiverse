"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { inquirySchema } from "@/lib/validation";
import { Button } from "./ui/button";
type Fields = z.infer<typeof inquirySchema>;
export function ContactForm({ services }: { services: string[] }) {
  const inFlight = useRef(false);
  const [startedAt] = useState(() => Date.now()); const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Fields>({ resolver: zodResolver(inquirySchema), defaultValues: { service: "", message: "", company: "", website: "", startedAt } });
  useEffect(() => {
    const context = (new URLSearchParams(window.location.search).get("context") || "").slice(0, 100);
    if (services.includes(context)) setValue("service", context);
    else if (context) setValue("message", `Platform / engagement: ${context}\n\n`);
  }, [services, setValue]);
  async function submit(fields: Fields) {
    if (inFlight.current) return;
    inFlight.current = true;
    setResult(null);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
      const data = await response.json();
      setResult({ ok: response.ok, text: response.ok ? data.message : data.error });
    } catch { setResult({ ok: false, text: "We couldn’t connect. Please try again." }); }
    finally { inFlight.current = false; }
  }
  if (result?.ok) return <div className="contact-form" role="status"><CheckCircle2 size={35} color="#146ef5"/><h2 style={{ fontSize: 30, marginTop: 20 }}>Let’s start a conversation.</h2><p>{result.text}</p><Button variant="outline" onClick={() => setResult(null)} style={{ marginTop: 25 }}>Send another request</Button></div>;
  return <form className="contact-form" noValidate onSubmit={handleSubmit(submit)}><div className="form-grid"><div className="field"><label htmlFor="name">Full name *</label><input id="name" autoComplete="name" placeholder="Your name" {...register("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined}/>{errors.name && <span id="name-error" className="field-error">{errors.name.message}</span>}</div><div className="field"><label htmlFor="email">Work email *</label><input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}/>{errors.email && <span id="email-error" className="field-error">{errors.email.message}</span>}</div><div className="field full"><label htmlFor="company">Company (optional)</label><input id="company" autoComplete="organization" placeholder="Your organization" {...register("company")} aria-invalid={!!errors.company} aria-describedby={errors.company ? "company-error" : undefined}/>{errors.company && <span id="company-error" className="field-error">{errors.company.message}</span>}</div><div className="field full"><label htmlFor="service">What can we help you with? *</label><select id="service" {...register("service")} aria-invalid={!!errors.service} aria-describedby={errors.service ? "service-error" : undefined}><option value="">Choose a service</option>{services.map(s => <option key={s}>{s}</option>)}<option>Something else — let’s discuss</option></select>{errors.service && <span id="service-error" className="field-error">{errors.service.message}</span>}</div><div className="field full"><label htmlFor="message">Tell us about your identity challenge *</label><textarea id="message" placeholder="Your current environment, goals, or the problem you’re working through…" {...register("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined}/>{errors.message && <span id="message-error" className="field-error">{errors.message.message}</span>}</div></div><div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" {...register("website")}/></div><input type="hidden" {...register("startedAt", { valueAsNumber: true })}/><label className="checkbox-row"><input type="checkbox" {...register("consent")} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-error" : undefined}/><span>I agree to the processing of my details to respond to this request, as described in the <Link href="/privacy">privacy notice</Link>. *</span></label>{errors.consent && <p id="consent-error" className="field-error" style={{ marginBottom: 15 }}>{errors.consent.message}</p>}<Button disabled={isSubmitting} type="submit">{isSubmitting ? "Sending your request…" : "Request a consultation"}<ArrowUpRight size={17}/></Button><p style={{ fontSize: 10, marginTop: 15 }}>Please don’t include passwords, secrets or sensitive identity records.</p>{result && <div className="form-status error" role="alert">{result.text}</div>}</form>;
}
