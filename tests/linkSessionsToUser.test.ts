import test from 'node:test';
import assert from 'node:assert/strict';

import supabase from '../src/lib/supabaseClient';
import { ensureSessionLinked } from '../src/services/sessionLinking';

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

test('ensureSessionLinked short-circuits without session id', async () => {
  globalThis.fetch = (async () => {
    throw new Error('should not be called');
  }) as typeof fetch;
  const result = await ensureSessionLinked({ sessionId: '', userId: 'u1' });
  assert.equal(result, false);
});

test('ensureSessionLinked short-circuits without user id', async () => {
  globalThis.fetch = (async () => {
    throw new Error('should not be called');
  }) as typeof fetch;
  const result = await ensureSessionLinked({ sessionId: 's1', userId: '' });
  assert.equal(result, false);
});

test('ensureSessionLinked handles null email gracefully', async () => {
  let captured: any = null;
  globalThis.fetch = (async (_input, init) => {
    captured = init?.body ? JSON.parse(String(init.body)) : null;
    return new Response('{}', { status: 200 });
  }) as typeof fetch;
  const result = await ensureSessionLinked({ sessionId: 's2', userId: TEST_USER_ID });
  assert.equal(result, true);
  assert.equal(captured.email, null);
});

test.after(() => {
  globalThis.fetch = originalFetch;
  (supabase.auth as any).getUser = originalGetUser;
  (supabase.auth as any).getSession = originalGetSession;
  (supabase.functions as any).invoke = originalInvoke;
});
