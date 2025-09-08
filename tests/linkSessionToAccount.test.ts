import test from 'node:test';
import assert from 'node:assert/strict';
import { linkSessionToAccount } from '../src/services/sessionLinking';

type ClientOpts = {
  invokeData?: any;
  invokeError?: any;
  updateError?: any;
};

function createClient(opts: ClientOpts = {}) {
  const state: any = {
    invoked: false,
    invokedName: '',
    invokedBody: null,
    updated: false,
    updatePayload: null,
    updateSessionId: '',
    isUserNull: undefined,
  };
  const client: any = {
    functions: {
      invoke(name: string, { body }: { body: any }) {
        state.invoked = true;
        state.invokedName = name;
        state.invokedBody = body;
        return Promise.resolve({
          data: opts.invokeData,
          error: opts.invokeError ?? null,
        });
      },
    },
    from() {
      return {
        update(payload: any) {
          state.updated = true;
          state.updatePayload = payload;
          return {
            eq(_: string, id: string) {
              state.updateSessionId = id;
              return {
                is(__: string, val: any) {
                  state.isUserNull = val;
                  if (opts.updateError) return { error: opts.updateError };
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

test('prefers Edge Function when available (success)', async () => {
  const client = createClient({ invokeData: { success: true } });
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.deepEqual(res, { ok: true });
  assert.equal(client._state.invoked, true);
  assert.equal(client._state.invokedName, 'link_session_to_account');
  assert.deepEqual(client._state.invokedBody, { session_id: 's1', user_id: 'u1', email: 'a@b.com' });
  assert.equal(client._state.updated, false); // no fallback
});

test('propagates Edge Function error (non-404)', async () => {
  const err: any = new Error('fail');
  err.status = 500;
  const client = createClient({ invokeError: err });
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.equal(res.ok, false);
  assert.equal((res as any).error, err);
  assert.equal(client._state.updated, false);
});

test('falls back to direct update when function missing (404)', async () => {
  const err: any = new Error('not found');
  err.status = 404;
  const client = createClient({ invokeError: err });
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.equal(res.ok, true);
  assert.equal(client._state.updated, true);
  assert.equal(client._state.updateSessionId, 's1');
  assert.equal(client._state.updatePayload.user_id, 'u1');
  assert.equal(client._state.updatePayload.email, 'a@b.com');
  assert.equal(client._state.isUserNull, null);
});

test('fallback path propagates update errors', async () => {
  const notFound: any = new Error('not found');
  notFound.status = 404;
  const updateErr = new Error('update fail');
  const client = createClient({ invokeError: notFound, updateError: updateErr });
  const res = await linkSessionToAccount(client as any, 's1', 'u1', 'a@b.com');
  assert.equal(res.ok, false);
  assert.equal((res as any).error, updateErr);
});
