import test from 'node:test';
import assert from 'node:assert/strict';
import { linkSessionToAccount } from '../src/services/sessionLinking';

function createClient(opts: { updateError?: unknown } = {}) {
  const state: any = { updated: false, payload: null, sessionId: '', isUserNull: undefined };
  const client: any = {
    from() {
      return {
        update(payload: any) {
          state.updated = true;
          state.payload = payload;
          return {
            eq(_: string, id: string) {
              state.sessionId = id;
              return {
                is(__: string, val: any) {
                  state.isUserNull = val;
                  if (opts.updateError) {
                    return { error: opts.updateError };
                  }
                  return { error: null };
                },
              };
            },
          };
        },
      };
    },
    _state: state,
  };
  return client;
}

test('links session to user account', async () => {
  const client = createClient();
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.deepEqual(res, { ok: true });
  assert.equal(client._state.updated, true);
  assert.equal(client._state.sessionId, 's1');
  assert.equal(client._state.payload.user_id, 'u1');
  assert.equal(client._state.payload.email, 'a@b.com');
  assert.equal(client._state.isUserNull, null);
});

test('propagates update errors', async () => {
  const err = new Error('fail');
  const client = createClient({ updateError: err });
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.equal(res.ok, false);
  assert.equal((res as any).error, err);
});
