import { test } from "node:test";
import assert from "node:assert/strict";
import { diagnosticFetch, endpoint, safeAuthError, safeProviderError } from "../src/lib/auth-diagnostics";
test("Entra diagnostics preserve support codes and discard credentials and free-form data", () => {
  const data = safeProviderError({ error: "invalid_client", error_description: "AADSTS7000215: secret=SENSITIVE password=PRIVATE", error_codes: [7000215, "SENSITIVE"], trace_id: "11111111-2222-3333-4444-555555555555", client_secret: "SENSITIVE", access_token: "PRIVATE", id_token: "PRIVATE" });
  assert.equal(data.aadsts, "AADSTS7000215"); assert.equal(data.oauthError, "invalid_client");
  assert.deepEqual(data.errorCodes, [7000215]);
  assert.ok(data.hint);
  assert.ok(!JSON.stringify(data).includes("SENSITIVE")); assert.ok(!JSON.stringify(data).includes("PRIVATE"));
});
test("Auth.js errors expose the nested provider cause without leaking stack, tokens or profile", () => {
  const details = safeAuthError({ type: "OAuthCallbackError", message: "PRIVATE", stack: "PRIVATE", cause: { error: "invalid_client", error_description: "AADSTS7000222: PRIVATE", code: "PRIVATE", profile: { email: "PRIVATE" }, err: new Error("PRIVATE") } });
  assert.equal(details.errorType, "OAuthCallbackError"); assert.equal(details.aadsts, "AADSTS7000222");
  assert.ok(!JSON.stringify(details).includes("PRIVATE"));
});
test("diagnostic endpoints strip authorization query strings and embedded credentials", () => {
  assert.equal(endpoint("https://user:password@example.com/callback?code=PRIVATE&state=PRIVATE"), "https://example.com/callback");
});
test("diagnostic fetch preserves the request, upstream normalization and consumable response", async () => {
  const response = Response.json({ error: "invalid_client", error_description: "AADSTS7000215: PRIVATE" }, { status: 401 });
  const body = new URLSearchParams({ client_id: "PUBLIC", client_secret: "PRIVATE", code: "PRIVATE", redirect_uri: "https://example.com/api/auth/callback/microsoft-entra-id" });
  const previous = process.env.AUTH_DIAGNOSTICS; process.env.AUTH_DIAGNOSTICS = "true";
  const originalInfo = console.info; const originalError = console.error; const logs: string[] = [];
  console.info = (...args) => { logs.push(JSON.stringify(args)); }; console.error = console.info;
  try {
    const upstream: typeof fetch = async (_input, init) => { assert.equal(init?.body, body); return response; };
    const result = await diagnosticFetch(upstream)("https://login.microsoftonline.com/tenant/oauth2/v2.0/token", { method: "POST", body });
    assert.equal(result, response); assert.equal((await result.json()).error, "invalid_client");
    assert.ok(logs.some(l => l.includes("token.rejected"))); assert.ok(logs.some(l => l.includes("AADSTS7000215")));
    assert.ok(!logs.join("").includes("PRIVATE"));
  } finally {
    console.info = originalInfo; console.error = originalError;
    if (previous === undefined) delete process.env.AUTH_DIAGNOSTICS; else process.env.AUTH_DIAGNOSTICS = previous;
  }
});
