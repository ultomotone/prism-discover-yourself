import test from 'node:test';
import assert from 'node:assert/strict';
import type { Profile } from '../src/features/results/types';

(globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' } };

const { fetchResults, FetchResultsError } = await import('../src/features/results/api');

type RpcFn = (...args: any[]) => Promise<{ data: unknown; error: any }>; 
type FnFn = (...args: any[]) => Promise<{ data: unknown; error: any }>;

function createClient(rpcImpl?: RpcFn, fnImpl?: FnFn) {
  return {
    rpc: rpcImpl ?? (async () => ({ data: null, error: null })),
    functions: { invoke: fnImpl ?? (async () => ({ data: null, error: null })) },
  } as any;
}

test('uses RPC when share token provided', async () => {
  let rpcCalls = 0;
  const client = createClient(
    async () => {
      rpcCalls++;
      return { data: { id: 'p1' }, error: null };
    },
  );
  const res = await fetchResults({ sessionId: 's', shareToken: 't' }, client);
  assert.equal(res.profile.id, 'p1');
  assert.equal(rpcCalls, 1);
});

test('falls back to edge function without share token', async () => {
  let fnCalls = 0;
  const client = createClient(
    undefined,
    async () => {
      fnCalls++;
      return { data: { profile: { id: 'p2' }, session: { id: 's', status: 'completed' } }, error: null };
    },
  );
  const res = await fetchResults({ sessionId: 's' }, client);
  assert.equal(res.profile.id, 'p2');
  assert.equal(fnCalls, 1);
});

test('dedupes concurrent calls', async () => {
  let calls = 0;
  const client = createClient(
    undefined,
    async () => {
      calls++;
      return { data: { profile: { id: 'p3' }, session: { id: 's', status: 'completed' } }, error: null };
    },
  );
  const [a, b] = await Promise.all([
    fetchResults({ sessionId: 's' }, client),
    fetchResults({ sessionId: 's' }, client),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
});

test('retries transient errors', async () => {
  let attempts = 0;
  const client = createClient(
    undefined,
    async () => {
      attempts++;
      if (attempts < 2) {
        return { data: null, error: { status: 500 } };
      }
      return { data: { profile: { id: 'p4' }, session: { id: 's', status: 'completed' } }, error: null };
    },
  );
  const res = await fetchResults({ sessionId: 's' }, client);
  assert.equal(res.profile.id, 'p4');
  assert.equal(attempts, 2);
});

test('treats 429 as transient', async () => {
  let attempts = 0;
  const client = createClient(
    undefined,
    async () => {
      attempts++;
      return attempts < 2
        ? { data: null, error: { status: 429 } }
        : { data: { profile: { id: 'p5' }, session: { id: 's', status: 'completed' } }, error: null };
    },
  );
  const res = await fetchResults({ sessionId: 's' }, client);
  const profile: Profile = res.profile;
  assert.equal(profile.id, 'p5');
  assert.equal(attempts, 2);
});

test('does not retry non-transient errors', async () => {
  let attempts = 0;
  const client = createClient(
    undefined,
    async () => {
      attempts++;
      return { data: null, error: { status: 401 } };
    },
  );
  await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
    e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(attempts, 1);
});

test('maps error variants', async () => {
  const cases: Array<[number, FetchResultsError['kind']]> = [
    [404, 'not_found'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [400, 'invalid'],
  ];
  for (const [status, kind] of cases) {
    const client = createClient(undefined, async () => ({ data: null, error: { status } }));
    await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
      e instanceof FetchResultsError && e.kind === kind,
    );
  }
});
