import test from 'node:test';
import assert from 'node:assert/strict';
import { linkSessionsToUser } from '../src/services/sessionLinking';

function createClient(opts: {
  sessions?: Array<{ id: string }>;
  selectError?: unknown;
  updateError?: unknown;
}) {
  const state = { updateCalled: false, ids: [] as string[] };
  const client: any = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                is() {
                  if (opts.selectError) {
                    return { data: null, error: opts.selectError };
                  }
                  return { data: opts.sessions ?? [], error: null };
                },
              };
            },
          };
        },
        update() {
          return {
            in(_: string, ids: string[]) {
              state.updateCalled = true;
              state.ids = ids;
              if (opts.updateError) {
                return { error: opts.updateError };
              }
              return { error: null };
            },
          };
        },
      };
    },
    _state: state,
  };
  return client;
}

test('links unowned sessions to user', async () => {
  const client = createClient({ sessions: [{ id: 's1' }, { id: 's2' }] });
  const res = await linkSessionsToUser(client as any, 'a@b.com', 'u1');
  assert.deepEqual(res, { ok: true, linked: 2 });
  assert.equal(client._state.updateCalled, true);
  assert.deepEqual(client._state.ids, ['s1', 's2']);
});

test('returns zero when no sessions found', async () => {
  const client = createClient({ sessions: [] });
  const res = await linkSessionsToUser(client as any, 'a@b.com', 'u1');
  assert.deepEqual(res, { ok: true, linked: 0 });
  assert.equal(client._state.updateCalled, false);
});

test('propagates select errors', async () => {
  const err = new Error('fail');
  const client = createClient({ selectError: err });
  const res = await linkSessionsToUser(client as any, 'a@b.com', 'u1');
  assert.equal(res.ok, false);
  assert.equal((res as any).error, err);
});

test('propagates update errors', async () => {
  const err = new Error('update');
  const client = createClient({ sessions: [{ id: 's1' }], updateError: err });
  const res = await linkSessionsToUser(client as any, 'a@b.com', 'u1');
  assert.equal(res.ok, false);
  assert.equal((res as any).error, err);
});
