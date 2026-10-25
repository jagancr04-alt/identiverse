import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeLines, singleLine } from "../src/lib/text";
import { pages } from "../src/lib/catalog";
import { inquirySchema } from "../src/lib/validation";

test("editorial newlines normalize safely without interpreting markup", () => {
  assert.equal(normalizeLines("One\\nTwo"), "One\nTwo");
  assert.equal(normalizeLines("One\\r\\nTwo\r\nThree"), "One\nTwo\nThree");
  assert.equal(singleLine("One\\nTwo\nThree"), "One Two Three");
  assert.equal(normalizeLines("<script>text</script>\\nNext"), "<script>text</script>\nNext");
});

test("priority platform content has distinct scope, deliverables and valid related routes", () => {
  const slugs = ["ibm-security", "okta", "microsoft-entra", "keycloak", "auth0"];
  for (const slug of slugs) {
    const page = pages.find(p => p.slug === `technologies/${slug}`)!;
    assert.ok(page.scope && page.dependencies && page.deliverables?.length);
    for (const related of page.related || []) assert.ok(pages.some(p => p.slug === related), related);
  }
  assert.equal(new Set(slugs.map(slug => pages.find(p => p.slug === `technologies/${slug}`)?.description)).size, 5);
});

test("contact company is optional and a service must be deliberately selected", () => {
  const request = { name: "Example User", email: "test@example.com", company: "", service: "Architecture", message: "A bounded architecture review for our applications.", consent: true, website: "", startedAt: Date.now() };
  assert.ok(inquirySchema.safeParse(request).success);
  assert.equal(inquirySchema.safeParse({ ...request, service: "" }).success, false);
});
