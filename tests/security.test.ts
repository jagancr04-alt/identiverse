import { test } from "node:test";
import assert from "node:assert/strict";
import { inquirySchema, contentSchema, settingsSchema } from "../src/lib/validation";
import { cleanHtml } from "../src/lib/sanitize";
import { pages, defaultSettings } from "../src/lib/catalog";
import { readJson } from "../src/lib/request";
import { HttpError } from "../src/lib/errors";
test("all initial CMS records meet the same validation as administrator edits", () => {
  for (const page of pages) assert.equal(contentSchema.safeParse({ ...page, published: true }).success, true, page.slug);
  assert.equal(settingsSchema.safeParse(defaultSettings).success, true);
  assert.equal(new Set(pages.map(p => p.slug)).size, pages.length);
});
test("contact requests require consent, reject honeypots and enforce bounds", () => {
  const request = { name: "Sample User", email: "user@example.com", company: "Example Ltd", service: "Architecture", message: "We need help with a federation migration.", consent: true, website: "", startedAt: Date.now() - 3000 };
  assert.equal(inquirySchema.safeParse(request).success, true);
  for (const change of [{ consent: false }, { website: "spam" }, { email: "invalid" }, { message: "short" }, { message: "x".repeat(5001) }]) assert.equal(inquirySchema.safeParse({ ...request, ...change }).success, false);
});
test("stored HTML removes executable and unsafe content while retaining editorial formatting", () => {
  const clean = cleanHtml('<h2>Heading</h2><p onclick="alert(1)">Text<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">bad</a><a href="https://example.com">safe</a><iframe src="https://example.com"></iframe></p>');
  assert.ok(clean.includes("<h2>Heading</h2>")); assert.ok(clean.includes('href="https://example.com"'));
  for (const unsafe of ["script", "onclick", "onerror", "javascript:", "<iframe", "<img"]) assert.ok(!clean.includes(unsafe));
});
test("CMS paths cannot escape sections or inject URL schemes", () => {
  const page = { ...pages[0], published: true };
  for (const slug of ["../admin", "services/../../api", "javascript:alert(1)", "technologies/test", "services/a?draft=true"]) assert.equal(contentSchema.safeParse({ ...page, slug }).success, false);
  for (const logoUrl of ["javascript:alert(1)", "data:image/svg+xml,test", "http://example.com/a.png"]) assert.equal(settingsSchema.safeParse({ ...defaultSettings, logoUrl }).success, false);
});
test("JSON requests enforce byte limits without trusting Content-Length", async () => {
  const valid = new Request("https://example.com", { method: "POST", body: '{"a":1}' });
  assert.deepEqual(await readJson(valid, 20), { a: 1 });
  const large = new Request("https://example.com", { method: "POST", body: JSON.stringify({ a: "x".repeat(100) }) });
  await assert.rejects(readJson(large, 20), (e: unknown) => e instanceof HttpError && e.status === 413);
  await assert.rejects(readJson(new Request("https://example.com", { method: "POST", body: "not-json" })), SyntaxError);
});
