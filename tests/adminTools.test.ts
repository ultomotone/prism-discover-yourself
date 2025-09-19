import test from "node:test";
import assert from "node:assert/strict";

process.env.VITE_SUPABASE_URL = "https://example.supabase.co";
process.env.VITE_SUPABASE_ANON_KEY = "anon-key";
process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

const adminTools = await import("@/services/adminTools");

const originalFetch = globalThis.fetch;

test("recomputeSession invokes recompute-scoring with service role", async () => {
  adminTools.__testing.resetCaches();
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ input, init });
    return new Response(JSON.stringify({ ok: true, updatedCount: 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const result = await adminTools.recomputeSession("123e4567-e89b-12d3-a456-426614174000");
    assert.deepEqual(result, { ok: true, updatedCount: 1 });
    assert.equal(calls.length, 1);
    const [{ input, init }] = calls;
    assert.equal(input, "https://example.supabase.co/functions/v1/recompute-scoring");
    assert.equal(init?.method, "POST");
    const headers = init?.headers as Record<string, string>;
    assert.equal(headers.Authorization, "Bearer service-role-key");
    assert.equal(headers.apikey, "service-role-key");
    assert.deepEqual(JSON.parse(String(init?.body)), { sessionId: "123e4567-e89b-12d3-a456-426614174000" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("recomputeSession throws when function fails", async () => {
  adminTools.__testing.resetCaches();
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: "boom" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  try {
    await assert.rejects(() => adminTools.recomputeSession("123e4567-e89b-12d3-a456-426614174000"), /boom/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("qaSession returns normalized completeness counts", async () => {
  adminTools.__testing.resetCaches();
  const rpcCalls: Array<{ name: string; params: Record<string, unknown> }> = [];
  adminTools.__testing.setServiceClient({
    rpc: async (name: string, params: Record<string, unknown>) => {
      rpcCalls.push({ name, params });
      if (name === "v2_completeness") {
        return { data: { types: "16", functions: "8", state: "2" }, error: null };
      }
      throw new Error(`unexpected rpc ${name}`);
    },
  } as unknown as any);

  const result = await adminTools.qaSession("123e4567-e89b-12d3-a456-426614174000");
  assert.deepEqual(result, { types: 16, functions: 8, state: 2 });
  assert.equal(rpcCalls.length, 1);
  assert.deepEqual(rpcCalls[0], {
    name: "v2_completeness",
    params: { p_session: "123e4567-e89b-12d3-a456-426614174000" },
  });
});

test("sampleBroken delegates to SQL helper", async () => {
  adminTools.__testing.resetCaches();
  adminTools.__testing.setServiceClient({
    rpc: async (name: string) => {
      if (name === "find_broken_sessions_sql") {
        return { data: [{ session_id: "sess-1" }], error: null };
      }
      throw new Error(`unexpected rpc ${name}`);
    },
  } as unknown as any);

  const rows = await adminTools.sampleBroken(10);
  assert.deepEqual(rows, [{ session_id: "sess-1" }]);
  await assert.rejects(() => adminTools.sampleBroken(0), /positive number/);
});

test("backfillBrokenSessions iterates recompute responses", async () => {
  adminTools.__testing.resetCaches();
  const rpcCalls: Array<string> = [];
  adminTools.__testing.setServiceClient({
    rpc: async (name: string) => {
      rpcCalls.push(name);
      if (name === "find_broken_sessions_sql") {
        return { data: [{ session_id: "sess-1" }, { session_id: "sess-2" }], error: null };
      }
      throw new Error(`unexpected rpc ${name}`);
    },
  } as unknown as any);

  type JsonValue = Record<string, unknown>;

  const responses: Array<JsonValue> = [
    { ok: true, updatedCount: 1 },
    { ok: false, error: "fc_failed" },
  ];
  let idx = 0;
  globalThis.fetch = async () =>
    new Response(JSON.stringify(responses[idx++] ?? {}), {
      status: idx === 1 ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const summary = await adminTools.backfillBrokenSessions({ days: 90, batchSize: 50 });
    assert.equal(rpcCalls.filter((name) => name === "find_broken_sessions_sql").length, 1);
    assert.equal(summary.fetched, 2);
    assert.equal(summary.recomputed, 1);
    assert.equal(summary.results.length, 2);
    assert.equal(summary.results[1].result.ok, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("input validation rejects empty session id", async () => {
  await assert.rejects(() => adminTools.recomputeSession(""), /sessionId is required/i);
});

test("input validation rejects invalid limits", async () => {
  await assert.rejects(() => adminTools.sampleBroken(0), /positive number/);
  await assert.rejects(() => adminTools.backfillBrokenSessions({ days: -1, batchSize: 10 }), /positive number/);
  await assert.rejects(() => adminTools.backfillBrokenSessions({ days: 10, batchSize: 0 }), /positive number/);
});
