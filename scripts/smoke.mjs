import assert from "node:assert/strict";
const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const checks = ["/", "/services", "/services/iam-development", "/solutions/non-human-identity", "/technologies/keycloak", "/industries/healthcare", "/compliance/controls", "/resources/saml-oidc", "/contact", "/about", "/privacy", "/cookies", "/admin/login", "/sitemap.xml", "/robots.txt", "/opengraph-image", "/icon.svg"];
for (const path of checks) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, `${path}: ${response.status}`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  if (path === "/") { const text = await response.text(); assert.ok(text.includes("identi")); assert.ok(text.includes("Bangalore, India")); assert.ok(text.includes("Discuss your IAM project")); }
  console.log(`PASS ${path}`);
}
const unknown = await fetch(base + "/this-route-does-not-exist");
// React's streamed notFound can return a 200 shell, but must include the noindex and not-found UI.
const unknownHtml = await unknown.text();
assert.ok(unknown.status === 404 || unknownHtml.includes('content="noindex"'));
assert.ok(unknownHtml.includes("Let’s reconnect."));
const admin = await fetch(base + "/admin", { redirect: "manual" });
assert.ok([303, 307].includes(admin.status)); assert.ok(admin.headers.get("location")?.includes("/admin/login"));
for (const route of ["/api/admin", "/api/admin/media", "/api/contact"]) {
  const forbidden = await fetch(base + route, { method: "POST", headers: { Origin: "https://untrusted.example", "Content-Type": "application/json" }, body: "{}" });
  assert.equal(forbidden.status, 403, `cross-origin ${route}`);
}
const write = await fetch(base + "/api/admin", { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ action: "settings", data: {} }) });
assert.ok([401, 503].includes(write.status));
const contact = await fetch(base + "/api/contact", { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: "{}" });
assert.ok([400, 503].includes(contact.status));
console.log("PASS unknown route, admin redirect, cross-origin rejection, protected writes and contact failure handling");
