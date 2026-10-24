"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowRight, ChevronDown, Globe2, Menu, X } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import type { ContentPage, SiteSettings } from "@/lib/catalog";
export function Header({ settings, pages }: { settings: SiteSettings; pages: ContentPage[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    function close(e: KeyboardEvent) { if (e.key === "Escape") { setOpen(null); setMobile(false); } }
    function outside(e: PointerEvent) { if (!ref.current?.contains(e.target as Node)) setOpen(null); }
    document.addEventListener("keydown", close); document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); };
  }, []);
  const groups = ["services", "solutions", "technologies", "industries", "compliance", "resources", "company"];
  const links = open === "company" ? [{ slug: "about", title: `About ${settings.name}` }, { slug: "contact", title: "Contact us" }, { slug: "contact", title: "Request a consultation" }] : open === "resources" ? [{ slug: "resources", title: "Technical insights" }, { slug: "resources/knowledge-center", title: "IAM knowledge center" }, { slug: "resources/case-studies", title: "Case studies" }, { slug: "resources/testimonials", title: "Client testimonials" }] : pages.filter(p => p.group === open);
  function finish() { setOpen(null); setMobile(false); }
  return <header ref={ref} className="site-header">
    <div className="utility"><div className="container"><span>Specialist identity engineering. Global perspective.</span><span><Globe2 size={12}/>{settings.location}</span></div></div>
    <div className="container nav-row"><Brand name={settings.name} logoUrl={settings.logoUrl}/>
      <button className="mobile-toggle" aria-expanded={mobile} aria-controls="main-navigation" aria-label={mobile ? "Close menu" : "Open menu"} onClick={() => setMobile(!mobile)}>{mobile ? <X/> : <Menu/>}</button>
      <nav id="main-navigation" className={mobile ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
        {groups.map(group => <button key={group} className={open === group ? "nav-link active" : "nav-link"} aria-expanded={open === group} aria-controls="navigation-panel" onClick={() => setOpen(open === group ? null : group)}>{group.charAt(0).toUpperCase() + group.slice(1)}<ChevronDown size={11}/></button>)}
        <Button asChild size="sm"><Link href="/contact" onClick={finish}>Talk to an IAM expert <ArrowRight size={15}/></Link></Button>
      </nav>
    </div>
    {open && <div id="navigation-panel" className="mega-menu"><div className="container mega-inner"><div className="mega-intro"><span className="eyebrow">EXPLORE {open.toUpperCase()}</span><h2>Identity.<br/>With intention.</h2><Link href={open === "company" ? "/about" : `/${open}`} onClick={finish}>View overview <ArrowDownRight size={18}/></Link></div><div className="mega-links">{links.map((p, i) => <Link key={p.slug + i} href={`/${p.slug}`} onClick={finish}>{p.title}<ArrowRight size={14}/></Link>)}{open === "compliance" && <Link href="/compliance/controls" onClick={finish}>Compliance control mapping <ArrowRight size={14}/></Link>}{open === "resources" && <Link href="/resources/faqs" onClick={finish}>Frequently asked questions <ArrowRight size={14}/></Link>}</div></div></div>}
  </header>;
}
