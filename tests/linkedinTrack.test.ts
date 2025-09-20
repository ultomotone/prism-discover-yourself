import test from "node:test";
import assert from "node:assert/strict";

void test("sendLinkedInSignup posts conversion event and reuses eventId", async (t) => {
  const originalFetch = globalThis.fetch;
  const lintrkCalls: Array<[string, { conversion_id: number }]> = [];
  const fetchCalls: Array<{ input: RequestInfo | URL; init?: RequestInit; body: any }> = [];

  (globalThis as any).navigator = { userAgent: "node-test-agent" };
  (globalThis as any).window = {
    lintrk(command: string, payload: { conversion_id: number }) {
      lintrkCalls.push([command, payload]);
    },
  };

  globalThis.fetch = async (input, init) => {
    const body = JSON.parse(String(init?.body ?? "{}"));
    fetchCalls.push({ input, init, body });
    return new Response(
      JSON.stringify({ ok: true, eventId: body.eventId, status: 202, requestId: "req-1" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
    delete (globalThis as any).window;
    delete (globalThis as any).navigator;
  });

  const { sendLinkedInSignup } = await import("../src/lib/linkedin/track.ts");

  const result = await sendLinkedInSignup({
    conversionId: "456",
    email: "[email protected]",
    value: 99.5,
    currency: "usd",
    alsoFireClient: true,
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, 202);
  assert.equal(result.requestId, "req-1");
  assert.ok(result.eventId);

  assert.equal(fetchCalls.length, 1);
  const [{ body, init }] = fetchCalls;
  assert.equal(body.conversionId, "456");
  assert.equal(body.email, "[email protected]");
  assert.equal(body.value, 99.5);
  assert.equal(body.currency, "usd");
  assert.equal(body.userAgent, "node-test-agent");
  assert.equal(body.eventId, result.eventId);
  assert.equal(init?.headers && (init.headers as any)["x-consent-analytics"], "true");

  assert.equal(lintrkCalls.length, 1);
  assert.equal(lintrkCalls[0][0], "track");
  assert.deepEqual(lintrkCalls[0][1], { conversion_id: 456 });
});

void test("sendLinkedInSignup returns network error payload on failure", async (t) => {
  const originalFetch = globalThis.fetch;
  delete (globalThis as any).navigator;
  delete (globalThis as any).window;

  globalThis.fetch = async () => {
    throw new Error("offline");
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const { sendLinkedInSignup } = await import("../src/lib/linkedin/track.ts");

  const result = await sendLinkedInSignup({
    conversionId: "789",
    email: "[email protected]",
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "network_error");
  assert.ok(result.eventId);
  assert.equal(result.error, "offline");
});
