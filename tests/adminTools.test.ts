import test from "node:test";
import assert from "node:assert/strict";

process.env.VITE_SUPABASE_URL = "https://example.supabase.co";
process.env.VITE_SUPABASE_ANON_KEY = "anon-key";

const supabaseModule = await import("@/lib/supabaseClient");
const supabase = supabaseModule.default ?? (supabaseModule as any).supabase;
const adminTools = await import("@/services/adminTools");

const originalFetch = globalThis.fetch;

function createOkResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

test("recomputeSession attaches Authorization header when JWT available", async () => {
  const jwt = "jwt-token";
  const originalGetSession = (supabase.auth as any).getSession;
  (supabase.auth as any).getSession = async () => ({ data: { session: { access_token: jwt } } });

  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ input, init });
    return createOkResponse({ ok: true });
  };

  try {
    await adminTools.recomputeSession("123e4567-e89b-12d3-a456-426614174000");
    assert.equal(calls.length, 1);
    const { init, input } = calls[0];
    assert.equal(
      input,
      "https://example.supabase.co/functions/v1/score_prism",
      "should target score_prism edge function",
    );
    assert.ok(init?.headers, "headers should be present");
    const headers = init?.headers as Record<string, string>;
    assert.equal(headers.Authorization, `Bearer ${jwt}`);
    assert.equal(headers.apikey, "anon-key");
    assert.equal(init?.method, "POST");
    const body = init?.body;
    assert.ok(body);
    assert.deepEqual(JSON.parse(String(body)), { session_id: "123e4567-e89b-12d3-a456-426614174000" });
  } finally {
    (supabase.auth as any).getSession = originalGetSession;
    globalThis.fetch = originalFetch;
  }
});

test("qaSession omits Authorization when no JWT available", async () => {
  const originalGetSession = (supabase.auth as any).getSession;
  (supabase.auth as any).getSession = async () => ({ data: { session: null } });

  const calls: Array<{ init?: RequestInit }> = [];
  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ init });
    return createOkResponse({ ok: true });
  };

  try {
    await adminTools.qaSession("123e4567-e89b-12d3-a456-426614174001");
    assert.equal(calls.length, 1);
    const headers = calls[0].init?.headers as Record<string, string>;
    assert.ok(headers);
    assert.equal(headers.Authorization, undefined);
    assert.equal(headers.apikey, "anon-key");
  } finally {
    (supabase.auth as any).getSession = originalGetSession;
    globalThis.fetch = originalFetch;
  }
});

test("post helpers propagate error responses", async () => {
  const originalGetSession = (supabase.auth as any).getSession;
  (supabase.auth as any).getSession = async () => ({ data: { session: null } });

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: "boom" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  try {
    await assert.rejects(() => adminTools.sampleBroken(10), /boom/);
  } finally {
    (supabase.auth as any).getSession = originalGetSession;
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
