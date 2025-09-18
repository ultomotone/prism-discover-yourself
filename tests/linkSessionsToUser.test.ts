import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureSessionLinked } from '../src/services/sessionLinking';

const originalFetch = globalThis.fetch;

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
  const result = await ensureSessionLinked({ sessionId: 's2', userId: 'u2' });
  assert.equal(result, true);
  assert.equal(captured.email, null);
});

test.after(() => {
  globalThis.fetch = originalFetch;
});
