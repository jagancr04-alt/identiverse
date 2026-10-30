"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Brand } from "./brand";
import type { ContentPage, SiteSettings } from "@/lib/catalog";
export function Header({ settings, pages }: { settings: SiteSettings; pages: Pick<ContentPage, "slug" | "group" | "title">[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function close(e: KeyboardEvent) { if (e.key === "Escape") { setOpen(null); setMobile(false); (trigger.current || toggle.current)?.focus(); } }
    function outside(e: PointerEvent) { if (!ref.current?.contains(e.target as Node)) setOpen(null); }
    document.addEventListener("keydown", close); document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); };
  }, []);
  const groups = ["services", "technologies", "resources"];
  const links = open === "company" ? [{ slug: "about", title: `About ${settings.name}` }, { slug: "contact", title: "Contact us" }, { slug: "contact", title: "Request a consultation" }] : open === "resources" ? [{ slug: "resources", title: "Technical insights" }, { slug: "resources/knowledge-center", title: "IAM knowledge center" }] : pages.filter(p => p.group === open);
  function finish() { setOpen(null); setMobile(false); }
  return <header ref={ref} className="site-header" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setOpen(null); setMobile(false); } }}>
    <div className="container nav-row"><Brand name={settings.name} logoUrl={settings.logoUrl}/>
      <button ref={toggle} className="mobile-toggle" aria-expanded={mobile} aria-controls="main-navigation" aria-label={mobile ? "Close menu" : "Open menu"} onClick={() => { trigger.current = null; setMobile(!mobile); setOpen(null); }}>{mobile ? <X/> : <Menu/>}</button>
      <nav id="main-navigation" className={mobile ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
        {groups.map(group => <button key={group} className={open === group ? "nav-link active" : "nav-link"} aria-expanded={open === group} aria-controls="navigation-panel" onClick={e => { trigger.current = e.currentTarget; setOpen(open === group ? null : group); }}>{group === "resources" ? "Insights" : group.charAt(0).toUpperCase() + group.slice(1)}<ChevronDown size={11}/></button>)}
        <Link prefetch={false} className="nav-link" href="/about" onClick={finish}>About</Link><Link prefetch={false} className="nav-link" href="/contact" onClick={finish}>Contact</Link>
        <Link prefetch={false} className="button button-primary nav-consultation" href="/contact" onClick={finish}>Schedule consultation</Link>
    {open && <div id="navigation-panel" className="mega-menu"><div className="container mega-inner"><div className="mega-intro"><span className="eyebrow">EXPLORE {open.toUpperCase()}</span><h2>Identity.<br/>With intention.</h2><Link prefetch={false} href={open === "company" ? "/about" : `/${open}`} onClick={finish}>View overview <ArrowDownRight size={18}/></Link></div><div className="mega-links">{links.map((p, i) => <Link prefetch={false} key={p.slug + i} href={`/${p.slug}`} onClick={finish}>{p.title}<ArrowRight size={14}/></Link>)}{open === "services" && <><Link prefetch={false} href="/industries" onClick={finish}>Industries <ArrowRight size={14}/></Link><Link prefetch={false} href="/solutions" onClick={finish}>Identity solutions <ArrowRight size={14}/></Link><Link prefetch={false} href="/compliance/controls" onClick={finish}>Compliance control mapping <ArrowRight size={14}/></Link></>}{open === "compliance" && <Link prefetch={false} href="/compliance/controls" onClick={finish}>Compliance control mapping <ArrowRight size={14}/></Link>}{open === "resources" && <Link prefetch={false} href="/resources/faqs" onClick={finish}>Frequently asked questions <ArrowRight size={14}/></Link>}</div></div></div>}
      </nav>
    </div>

  </header>;
}
