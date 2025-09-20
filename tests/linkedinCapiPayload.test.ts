import test from "node:test";
import assert from "node:assert/strict";

import { sha256HexLower } from "../supabase/functions/_shared/crypto.ts";
import {
  buildLinkedInRequestBody,
  shouldRetry,
} from "../supabase/functions/_shared/linkedinCapi.ts";

void test("sha256HexLower normalizes casing and trims", async () => {
  const hash = await sha256HexLower("  Test@Example.com  ");
  const expected = "973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b";
  assert.equal(hash, expected);
});

void test("buildLinkedInRequestBody includes identifiers and metadata", () => {
  const { body, identifiers } = buildLinkedInRequestBody({
    conversionId: "123",
    eventId: "evt-1",
    eventTime: 1700000000,
    hashedEmail: "abc",
    hashedPhone: undefined,
    value: 10.1234,
    currency: "usd",
    ip: "203.0.113.1",
    userAgent: "UA",
  });

  assert.deepEqual(body.conversion, { id: "123" });
  assert.equal(body.eventId, "evt-1");
  assert.equal(body.eventTime, 1700000000);
  assert(body.value);
  assert.equal(body.value?.amount, 10.12);
  assert.equal(body.value?.currencyCode, "USD");
  assert(body.user);
  assert.deepEqual(body.user?.userIdentifiers, [{ hashedEmail: "abc" }]);
  assert.equal(body.user?.sourceIpAddress, "203.0.113.1");
  assert.equal(body.user?.userAgent, "UA");
  assert.equal(identifiers.hasEmail, true);
  assert.equal(identifiers.hasPhone, false);
});

void test("buildLinkedInRequestBody omits incomplete value", () => {
  const { body } = buildLinkedInRequestBody({
    conversionId: "123",
    eventId: "evt-2",
    eventTime: 1700000001,
    value: 20,
    currency: "", // invalid
  });

  assert.equal(body.value, undefined);
  assert.equal(body.user, undefined);
});

void test("shouldRetry flags 429 and 5xx", () => {
  assert.equal(shouldRetry(429), true);
  assert.equal(shouldRetry(500), true);
  assert.equal(shouldRetry(503), true);
  assert.equal(shouldRetry(400), false);
  assert.equal(shouldRetry(404), false);
});
