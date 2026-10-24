"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="error-page"><div><h1>A brief interruption.</h1><p>The page could not load. Please try again.</p><Button onClick={reset}>Try again</Button></div></div>; }
