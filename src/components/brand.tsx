import Link from "next/link";
export function Brand({ name = "identiVerse", logoUrl = "" }: { name?: string; logoUrl?: string }) {
  return <Link className="brand" href="/" aria-label={`${name} home`}>
    {logoUrl ? <img src={logoUrl} alt="" width="36" height="36" /> : <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M7 11 20 4l13 7v15l-13 8L7 26V11Z" stroke="currentColor" strokeWidth="2.4"/><path d="m7 11 13 8 13-8M20 19v15M13 8l14 8v7l-7 4-7-4V8Z" stroke="currentColor" strokeWidth="2.1"/></svg>}
    <span>{name === "identiVerse" ? <>identi<strong>Verse</strong></> : name}</span>
  </Link>;
}
