import test from 'node:test';
import assert from 'node:assert/strict';

import supabase from '../src/lib/supabaseClient';
import { ensureSessionLinked, linkSessionToAccount } from '../src/services/sessionLinking';

const originalFetch = globalThis.fetch;
const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
const originalInvoke = supabase.functions.invoke.bind(supabase.functions);

const TEST_USER_ID = 'test-user';
const TEST_EMAIL = 'test-user@example.com';

function primeAuthMocks() {
  (supabase.auth as any).getUser = async () => ({
    data: { user: { id: TEST_USER_ID, email: TEST_EMAIL } },
    error: null,
  });
  (supabase.auth as any).getSession = async () => ({
    data: { session: { access_token: 'test-token' } },
    error: null,
  });
}

test.beforeEach(() => {
  globalThis.fetch = originalFetch;
  primeAuthMocks();
  (supabase.functions as any).invoke = async () => ({ data: null, error: { status: 500 } });
});

test('ensureSessionLinked sends POST with payload and returns true on 200', async () => {
  const calls: Array<{ url: string; body: any }> = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url: String(input), body });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }) as typeof fetch;

  const result = await ensureSessionLinked({ sessionId: 's1', userId: TEST_USER_ID, email: 'a@b.com' });

  assert.equal(result, true);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.endsWith('/link_session_to_account'));
  assert.deepEqual(calls[0].body, {
    session_id: 's1',
    user_id: TEST_USER_ID,
    email: 'a@b.com',
  });
});

test('ensureSessionLinked treats 409 as success', async () => {
  globalThis.fetch = (async () => new Response('{}', { status: 409 })) as typeof fetch;
  const result = await ensureSessionLinked({ sessionId: 's2', userId: TEST_USER_ID });
  assert.equal(result, true);
});

test('ensureSessionLinked returns false on server error', async () => {
  globalThis.fetch = (async () => new Response('{}', { status: 500 })) as typeof fetch;
  const result = await ensureSessionLinked({ sessionId: 's3', userId: TEST_USER_ID });
  assert.equal(result, false);
});

test('ensureSessionLinked returns false on network error', async () => {
  globalThis.fetch = (async () => {
    throw new Error('network');
  }) as typeof fetch;
  const result = await ensureSessionLinked({ sessionId: 's4', userId: TEST_USER_ID });
  assert.equal(result, false);
});

test('linkSessionToAccount wraps ensureSessionLinked', async () => {
  let called = 0;
  globalThis.fetch = (async () => {
    called++;
    return new Response('{}', { status: 200 });
  }) as typeof fetch;
  const res = await linkSessionToAccount({} as any, 's5', TEST_USER_ID, 'c@d.com');
  assert.deepEqual(res, { ok: true });
  assert.equal(called, 1);
});

test('linkSessionToAccount returns error payload on failure', async () => {
  globalThis.fetch = (async () => new Response('{}', { status: 500 })) as typeof fetch;
  const res = await linkSessionToAccount({} as any, 's6', TEST_USER_ID);
  assert.equal(res.ok, false);
  assert.ok(res instanceof Object && 'error' in res);
});

test.after(() => {
  globalThis.fetch = originalFetch;
  (supabase.auth as any).getUser = originalGetUser;
  (supabase.auth as any).getSession = originalGetSession;
  (supabase.functions as any).invoke = originalInvoke;
});
