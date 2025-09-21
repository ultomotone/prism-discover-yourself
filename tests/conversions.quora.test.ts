import test from "node:test";
import assert from "node:assert/strict";

import { sendQuoraEvent } from "../src/services/conversions.ts";

test("sendQuoraEvent posts minimal payload without PII", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return {
      ok: true,
      status: 200,
      async json() {
        return { ok: true };
      },
    } as Response;
  }) as typeof fetch;

  try {
    const res = await sendQuoraEvent({
      token: "t",
      url: "https://quora.example/conv",
      event: {
        name: "ViewContent",
        eventId: "sess:ViewContent",
        timestamp: 1,
        ip: "1.2.3.4",
        userAgent: "ua",
      },
    });

    assert.equal(res.ok, true);
    assert.equal(calls.length, 1);
    const call = calls[0];
    assert.equal(call.url, "https://quora.example/conv");
    const body = JSON.parse(String(call.init.body));
    assert.equal(body.event_name, "ViewContent");
    assert.equal(body.event_id, "sess:ViewContent");
    assert.equal(body.context.ip_address, "1.2.3.4");
    assert.equal(body.context.user_agent, "ua");
    assert.ok(!Object.prototype.hasOwnProperty.call(body, "email"));
    assert.ok(!Object.prototype.hasOwnProperty.call(body, "share_token"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
