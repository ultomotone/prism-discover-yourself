import test from 'node:test';
import assert from 'node:assert/strict';
import { linkSessionToAccount } from '../src/services/sessionLinking';

function createClient(opts: { data?: any; error?: unknown } = {}) {
  const state: any = { invoked: false, body: null, name: '' };
  const client: any = {
    functions: {
      invoke(name: string, { body }: { body: any }) {
        state.invoked = true;
        state.name = name;
        state.body = body;
        return Promise.resolve({ data: opts.data ?? { success: true }, error: opts.error ?? null });
      },
    },
    _state: state,
  };
  return client;
}

test('links session to user account via function', async () => {
  const client = createClient();
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.deepEqual(res, { ok: true });
  assert.equal(client._state.invoked, true);
  assert.equal(client._state.name, 'link_session_to_account');
  assert.deepEqual(client._state.body, { session_id: 's1', user_id: 'u1', email: 'a@b.com' });
});

test('propagates invoke errors', async () => {
  const err = new Error('fail');
  const client = createClient({ error: err });
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.equal(res.ok, false);
  assert.equal((res as any).error, err);
});

test('handles unsuccessful responses', async () => {
  const client = createClient({ data: { success: false, error: 'nope' } });
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.equal(res.ok, false);
});
