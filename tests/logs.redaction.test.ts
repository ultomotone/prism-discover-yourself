import test from "node:test";
import assert from "node:assert/strict";

import { logger } from "../src/lib/logger.ts";

test("logger redacts sensitive fields and tokens", () => {
  const originalError = console.error;
  const calls: unknown[] = [];
  console.error = (message?: unknown) => {
    calls.push(message);
  };

  try {
    logger.error("test", {
      authorization: "Bearer abc.def.123",
      share_token: "1234567890abcdef",
      email: "user@example.com",
      nested: { token: "supersecret" },
    });
  } finally {
    console.error = originalError;
  }

  assert.equal(calls.length, 1);
  const line = String(calls[0]);
  assert.ok(!/abc\.def\.123/.test(line));
  assert.ok(!/1234567890abcdef/.test(line));
  assert.ok(!/user@example\.com/.test(line));
  assert.ok(!/supersecret/.test(line));
  assert.ok(/Bearer \*\*\*/.test(line));
});
