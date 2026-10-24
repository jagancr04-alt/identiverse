import NextAuth, { customFetch } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { db, databaseConfigured } from "@/lib/db";
import { authLog, diagnosticFetch, safeAuthError } from "@/lib/auth-diagnostics";
const tenant = () => process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER?.match(/^https:\/\/login\.microsoftonline\.com\/([0-9a-f-]{36})\/v2\.0$/i)?.[1]?.toLowerCase();
export const authConfigured = () => Boolean(databaseConfigured() && process.env.AUTH_SECRET && process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET && tenant());
const entra = MicrosoftEntraID({
    clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
    clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    client: { token_endpoint_auth_method: "client_secret_post" },
    authorization: { params: { scope: "openid profile email" } }
  });
// Retain the provider's discovery normalization while observing sanitized results.
entra[customFetch] = diagnosticFetch(entra[customFetch] || fetch);
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [entra],
  logger: {
    error(error) { authLog("auth.error", safeAuthError(error), "error"); },
    warn(code) { authLog("auth.warning", { warning: code }); },
    // Auth.js debug metadata can contain credentials, PKCE verifiers and tokens.
    debug() {}
  },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 4 },
  callbacks: {
    async signIn({ profile }) {
      const claimsValid = typeof profile?.oid === "string" && typeof profile.tid === "string" && profile.tid.toLowerCase() === tenant();
      authLog("authorization.claims", { configured: authConfigured(), objectIdPresent: typeof profile?.oid === "string", tenantMatches: typeof profile?.tid === "string" && profile.tid.toLowerCase() === tenant() });
      if (!authConfigured() || !claimsValid || typeof profile?.oid !== "string") return false;
      try {
        const admin = await db.admin.findUnique({ where: { externalId: profile.oid } });
        authLog("authorization.admin_lookup", { found: !!admin, active: !!admin?.active, role: admin?.role });
        if (!admin?.active) return false;
        await db.audit.create({ data: { actor: admin.id, action: "SIGN_IN", target: "admin" } });
        authLog("authorization.allowed", { role: admin.role });
        return true;
      } catch (error) {
        authLog("authorization.database_error", safeAuthError(error), "error");
        throw error;
      }
    },
    async jwt({ token, profile }) {
      if (typeof profile?.oid === "string") { token.externalId = profile.oid; token.tenantId = profile.tid; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = typeof token.externalId === "string" && typeof token.tenantId === "string" && token.tenantId.toLowerCase() === tenant() ? token.externalId : "";
      return session;
    }
  }
});
