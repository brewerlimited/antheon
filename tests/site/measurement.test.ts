import { test } from "node:test";
import assert from "node:assert/strict";
import { analyticsAllowed, consentFrom, linkEvent, oncePerId, publicPath } from "../../lib/measurement/policy";
import { boundedJson, enquirySchema, maxEnquiryBytes, sameOrigin } from "../../lib/measurement/enquiries";
const configuration = { enabled: true, enhancedMeasurementDisabled: true, measurementId: "G-ABCDE12345" };
test("analytics requires opt-in, approved configuration, public host and explicitly public path", () => {
  assert.equal(analyticsAllowed(configuration, "www.antheon.co.uk", "/contact", "accepted"), true);
  for (const path of ["/seo", "/seo/admin", "/client-preview/gjl", "/web-design/hamilton-flooring", "/concepts/a", "/api/enquiries", "/unknown@example.org"]) {
    assert.equal(publicPath(path), null); assert.equal(analyticsAllowed(configuration, "www.antheon.co.uk", path, "accepted"), false);
  }
  assert.equal(analyticsAllowed(configuration, "localhost", "/", "accepted"), false);
  assert.equal(analyticsAllowed(configuration, "antheon-preview.vercel.app", "/", "accepted"), false);
  for (const consent of [null, "rejected"] as const) assert.equal(analyticsAllowed(configuration, "www.antheon.co.uk", "/", consent), false);
  assert.equal(analyticsAllowed({ ...configuration, enabled: false }, "www.antheon.co.uk", "/", "accepted"), false);
  assert.equal(analyticsAllowed({ ...configuration, enhancedMeasurementDisabled: false }, "www.antheon.co.uk", "/", "accepted"), false);
  assert.equal(publicPath("/contact?email=private@example.com#secret"), "/contact");
});
test("consent rejects invalid, future, old and expired choices", () => {
  const now = 2000000000000;
  assert.equal(consentFrom(JSON.stringify({ version: 1, choice: "accepted", at: now }), now), "accepted");
  for (const record of ["bad", JSON.stringify({ version: 0, choice: "accepted", at: now }), JSON.stringify({ version: 1, choice: "accepted", at: now + 1 }), JSON.stringify({ version: 1, choice: "accepted", at: now - 181 * 86400000 })]) assert.equal(consentFrom(record, now), null);
});
test("taxonomy emits intent without addresses, message text or arbitrary contexts", () => {
  assert.deepEqual(linkEvent("mailto:private@example.com?subject=Sensitive", "https://www.antheon.co.uk"), { event: "contact_click", context: "email" });
  assert.deepEqual(linkEvent("https://wa.me/447123123123?text=Sensitive", "https://www.antheon.co.uk"), { event: "contact_click", context: "whatsapp" });
  assert.deepEqual(linkEvent("tel:+4412345678", "https://www.antheon.co.uk"), { event: "contact_click", context: "phone" });
  assert.equal(linkEvent("https://unrelated.example/contact", "https://www.antheon.co.uk"), null);
  const first = oncePerId(); assert.equal(first("request1"), true); assert.equal(first("request1"), false); assert.equal(first("request2"), true);
});
test("enquiry validation enforces bounds, known services and no unexpected data", async () => {
  const payload = { name: "Example Person", email: "person@example.com", service: "web-design", message: "A website for my business.", idempotencyKey: "10000000-0000-4000-8000-000000000001", website: "" };
  assert.equal(enquirySchema.safeParse(payload).success, true);
  for (const invalid of [{ ...payload, message: "Short" }, { ...payload, message: "x".repeat(6001) }, { ...payload, email: "invalid" }, { ...payload, name: "Bad\u0000Name" }, { ...payload, service: "injected" }, { ...payload, admin: true }]) assert.equal(enquirySchema.safeParse(invalid).success, false);
  const request = new Request("https://www.antheon.co.uk/api/enquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  assert.deepEqual(await boundedJson(request), payload);
  await assert.rejects(() => boundedJson(new Request(request.url, { method: "POST", headers: { "content-type": "application/json" }, body: "x".repeat(maxEnquiryBytes + 1) })));
  assert.equal(sameOrigin(request.url, "https://www.antheon.co.uk", "same-origin"), true);
  assert.equal(sameOrigin(request.url, "https://evil.example", "cross-site"), false);
  assert.equal(sameOrigin(request.url, null, null), false);
});
