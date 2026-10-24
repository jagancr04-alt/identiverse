import Link from "next/link";
import { ChevronRight } from "lucide-react";
export function PageHero({ title, description, eyebrow, group, children }: { title: string; description: string; eyebrow: string; group?: string; children?: React.ReactNode }) {
  return <section className="page-hero"><div className="container"><div className="breadcrumb"><Link href="/">Home</Link><ChevronRight size={12}/>{group && <><Link href={`/${group}`}>{group.charAt(0).toUpperCase() + group.slice(1)}</Link><ChevronRight size={12}/></>}<span>{title.split("\n")[0]}</span></div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children}</div></section>;
}
