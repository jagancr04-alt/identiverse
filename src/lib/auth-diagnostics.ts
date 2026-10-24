import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

const attempts = new AsyncLocalStorage<string>();
export const diagnosticsEnabled = () => process.env.AUTH_DIAGNOSTICS === "true" || (process.env.NODE_ENV !== "production" && process.env.AUTH_DIAGNOSTICS !== "false");
type Detail = string | number | boolean | null | undefined | number[];
export function authLog(event: string, details: Record<string, Detail> = {}, level: "info" | "error" = "info") {
  if (!diagnosticsEnabled() && level !== "error") return;
  console[level]("[admin-auth]", JSON.stringify({ time: new Date().toISOString(), attempt: attempts.getStore() || "background", event, ...details }));
}
const guid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value) ? value : undefined;
const identifier = (value: unknown) => typeof value === "string" && /^[a-zA-Z_][a-zA-Z0-9_.-]{0,79}$/.test(value) ? value : undefined;
export function endpoint(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try { const url = new URL(value); return `${url.origin}${url.pathname}`; } catch { return "INVALID_URL"; }
}
const hints: Record<string, string> = {
  AADSTS7000215: "Entra rejected the secret for this client. Check app/tenant pairing, secret value and environment overrides.",
  AADSTS7000222: "Entra reports an expired client secret.",
  AADSTS7000218: "Entra did not receive the required client credential.",
  AADSTS700016: "Application not found in the selected tenant. Check the application client ID and issuer tenant.",
  AADSTS50011: "Redirect URI does not match the app registration's Web redirect URI.",
  AADSTS9002326: "Check that the redirect URI is registered as Web, not SPA."
};
// Allowlist provider diagnostic fields. Never serialize the error object, request,
// headers, token response, profile, or free-form provider error_description.
export function safeProviderError(input: unknown): Record<string, Detail> {
  if (!input || typeof input !== "object") return {};
  const value = input as Record<string, unknown>;
  const description = typeof value.error_description === "string" ? value.error_description : "";
  const aadsts = description.match(/\bAADSTS\d{4,10}\b/)?.[0];
  const numbers = Array.isArray(value.error_codes) ? value.error_codes.filter((n): n is number => typeof n === "number" && Number.isSafeInteger(n)).slice(0, 10) : undefined;
  return { oauthError: identifier(value.error), aadsts, errorCodes: numbers, traceId: guid(value.trace_id), correlationId: guid(value.correlation_id), hint: aadsts ? hints[aadsts] : undefined };
}
export function safeAuthError(error: unknown): Record<string, Detail> {
  if (!error || typeof error !== "object") return { errorType: "UnknownError" };
  const value = error as Record<string, unknown>;
  const cause = value.cause && typeof value.cause === "object" ? value.cause as Record<string, unknown> : {};
  const nested = cause.err && typeof cause.err === "object" ? cause.err as Record<string, unknown> : {};
  const code = value.code || nested.code || cause.code;
  return { errorType: identifier(value.type) || identifier(value.name) || "UnknownError", causeType: identifier(nested.name), systemCode: typeof code === "string" && /^(P\d{4}|E[A-Z_]{2,40}|UND_ERR_[A-Z_]{2,40}|CERT_[A-Z_]{2,40})$/.test(code) ? code : undefined, ...safeProviderError(cause) };
}
export function logAuthConfiguration() {
  const env = process.env;
  const secret = env.AUTH_MICROSOFT_ENTRA_ID_SECRET || "";
  const clientId = env.AUTH_MICROSOFT_ENTRA_ID_ID || "";
  const issuer = env.AUTH_MICROSOFT_ENTRA_ID_ISSUER || "";
  authLog("configuration", {
    nodeEnvironment: env.NODE_ENV, clientId: guid(clientId), clientIdPresent: !!clientId, clientIdIsGuid: !!guid(clientId),
    issuer: endpoint(issuer), issuerFormatValid: /^https:\/\/login\.microsoftonline\.com\/[0-9a-f-]{36}\/v2\.0$/i.test(issuer),
    secretPresent: !!secret, secretLength: secret.length, secretHasWhitespace: secret !== secret.trim(), secretLooksLikeId: !!guid(secret),
    secretEqualsAuthSecret: !!secret && secret === env.AUTH_SECRET, secretEqualsClientId: !!secret && secret === clientId,
    authSecretPresent: !!env.AUTH_SECRET, databaseConfigured: !!env.DATABASE_URL,
    authOrigin: endpoint(env.AUTH_URL), siteOrigin: endpoint(env.NEXT_PUBLIC_SITE_URL),
    callbackUrl: endpoint(`${env.AUTH_URL || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/callback/microsoft-entra-id`),
    tokenAuthentication: "client_secret_post"
  });
}
export async function withAuthDiagnostics<T>(stage: string, task: () => Promise<T>, request?: Request): Promise<T> {
  return attempts.run(randomUUID().slice(0, 8), async () => {
    const started = Date.now();
    authLog("request.start", { stage, method: request?.method, path: request ? new URL(request.url).pathname : undefined });
    if (stage === "sign_in") logAuthConfiguration();
    if (request) {
      const query = new URL(request.url).searchParams;
      if (query.has("error")) authLog("authorization.rejected", safeProviderError(Object.fromEntries(["error", "error_description"].map(k => [k, query.get(k)]))), "error");
    }
    try {
      const result = await task();
      authLog("request.complete", { stage, elapsedMs: Date.now() - started, status: result instanceof Response ? result.status : undefined, redirect: result instanceof Response ? endpoint(result.headers.get("location") || undefined) : undefined });
      return result;
    } catch (error) {
      const redirect = error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");
      authLog(redirect ? "request.redirect" : "request.failed", { stage, elapsedMs: Date.now() - started, ...(!redirect ? safeAuthError(error) : {}) }, redirect ? "info" : "error");
      throw error;
    }
  });
}
export function diagnosticFetch(upstream: typeof fetch): typeof fetch {
  return async (input, init) => {
    const started = Date.now();
    const url = input instanceof Request ? input.url : input.toString();
    const tokenRequest = new URL(url).pathname.endsWith("/token");
    const body = init?.body instanceof URLSearchParams ? init.body : undefined;
    authLog("provider.request", { endpoint: endpoint(url), method: init?.method || "GET", isTokenRequest: tokenRequest,
      ...(tokenRequest ? { clientIdInBody: body?.has("client_id"), secretInBody: body?.has("client_secret"), basicAuthPresent: new Headers(init?.headers).has("authorization"), pkcePresent: body?.has("code_verifier"), redirectUri: endpoint(body?.get("redirect_uri") || undefined) } : {}) });
    try {
      const response = await upstream(input, init);
      authLog("provider.response", { endpoint: endpoint(url), status: response.status, elapsedMs: Date.now() - started });
      if (tokenRequest && diagnosticsEnabled()) {
        try {
          const payload: unknown = await response.clone().json();
          if (payload && typeof payload === "object" && "error" in payload) authLog("token.rejected", { status: response.status, ...safeProviderError(payload) }, "error");
        } catch { authLog("token.unreadable_response", { status: response.status }); }
      }
      return response;
    } catch (error) {
      authLog("provider.network_error", { endpoint: endpoint(url), elapsedMs: Date.now() - started, ...safeAuthError(error) }, "error");
      throw error;
    }
  };
}
