"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
export function Consent({ force = false }: { force?: boolean }) {
  const [show, setShow] = useState(force);
  const [saved, setSaved] = useState(false);
  useEffect(() => { try { setShow(force || !localStorage.getItem("identiverse-consent-v1")); } catch { setShow(true); } }, [force]);
  function save() { try { localStorage.setItem("identiverse-consent-v1", JSON.stringify({ essential: true, optional: false, at: new Date().toISOString() })); } catch {} setSaved(true); if (!force) setShow(false); }
  if (!show) return null;
  return <div className={force ? "consent-settings" : "consent-banner"} role="region" aria-label="Cookie preferences"><div><strong>Your privacy, by design.</strong><p>We use essential authentication cookies and local storage for your privacy preference. Optional analytics and advertising are disabled. <Link href="/privacy">Privacy notice</Link></p></div><Button size="sm" variant="outline" onClick={save}>{saved ? "Preference saved" : "Essential only"}</Button></div>;
}
