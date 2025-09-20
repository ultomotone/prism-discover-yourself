import test from "node:test";
import assert from "node:assert/strict";

void test("buildQuoraRequestBody maps identifiers and custom data", async () => {
  const { buildQuoraRequestBody } = await import("../supabase/functions/_shared/quoraCapi.ts");

  const body = buildQuoraRequestBody({
    pixelId: "pixel-1",
    eventName: "Purchase",
    eventTime: 123456,
    conversionId: "conv-1",
    value: 99.5,
    currency: "USD",
    contents: [{ content_id: "sku-1", quantity: 1 }],
    contentIds: ["sku-1"],
    hashedEmail: "abc123",
    clientIp: "203.0.113.42",
    userAgent: "test-agent",
  });

  assert.equal(body.pixel_id, "pixel-1");
  assert.equal(body.data.length, 1);
  const event = body.data[0];
  assert.equal(event.event_name, "Purchase");
  assert.equal(event.event_time, 123456);
  assert.equal(event.conversion_id, "conv-1");
  assert.deepEqual(event.content_ids, ["sku-1"]);
  assert.deepEqual(event.user_data, {
    email: "abc123",
    client_ip_address: "203.0.113.42",
    client_user_agent: "test-agent",
  });
  assert.deepEqual(event.custom_data, {
    value: 99.5,
    currency: "USD",
    contents: [{ content_id: "sku-1", quantity: 1 }],
    content_ids: ["sku-1"],
  });
});

void test("buildQuoraRequestBody omits optional sections when absent", async () => {
  const { buildQuoraRequestBody } = await import("../supabase/functions/_shared/quoraCapi.ts");

  const body = buildQuoraRequestBody({
    pixelId: "pixel-2",
    eventName: "Lead",
    eventTime: 42,
  });

  const event = body.data[0];
  assert.equal(event.event_name, "Lead");
  assert.equal(event.action_source, "website");
  assert.equal(event.custom_data, undefined);
  assert.equal(event.user_data, undefined);
  assert.equal(event.conversion_id, undefined);
});

void test("shouldRetry matches retryable statuses", async () => {
  const { shouldRetry } = await import("../supabase/functions/_shared/quoraCapi.ts");

  assert.equal(shouldRetry(429), true);
  assert.equal(shouldRetry(500), true);
  assert.equal(shouldRetry(503), true);
  assert.equal(shouldRetry(499), false);
  assert.equal(shouldRetry(200), false);
});
