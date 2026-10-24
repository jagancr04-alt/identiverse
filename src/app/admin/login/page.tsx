import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authConfigured, signIn as entraSignIn } from "@/auth";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/security";
import { withAuthDiagnostics } from "@/lib/auth-diagnostics";
async function signIn(provider: "microsoft-entra-id", options: { redirectTo: string }) {
  return withAuthDiagnostics("sign_in", () => entraSignIn(provider, options));
}
export const metadata: Metadata = { title: "Administrator sign-in", robots: { index: false, follow: false } };
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const configured = authConfigured(); let signedIn = false;
  if (configured) { try { await requireAdmin(); signedIn = true; } catch {} }
  if (signedIn) redirect("/admin");
  const { error } = await searchParams;
  return <div className="login-wrap"><div className="login-card"><Brand/><h1>Administrator access.</h1><p>Sign in with your authorized Microsoft Entra account. Access is restricted by tenant, object ID and server-side role.</p>{!configured ? <div className="admin-notice">Administrator sign-in is not configured. Follow the deployment setup in README.md to connect PostgreSQL, Microsoft Entra and an administrator account.</div> : <form action={async () => { "use server"; await signIn("microsoft-entra-id", { redirectTo: "/admin" }); }}><Button type="submit">Continue with Microsoft Entra</Button></form>}{error && <div className="form-status error" role="alert">Sign-in was not completed. Check that your account is authorized and try again.</div>}<a href="/" className="arrow-link" style={{ marginTop: 25 }}>Return to website</a></div></div>;
}
