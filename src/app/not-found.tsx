import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <div className="error-page"><div><span className="eyebrow">404 / CONNECTION NOT FOUND</span><h1>Let’s reconnect.</h1><p>This page may have moved or is not available.</p><Button asChild><Link href="/">Back to identiVerse</Link></Button></div></div>; }
