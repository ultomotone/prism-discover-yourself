import test from 'node:test';
import assert from 'node:assert/strict';
import type { Profile } from '../src/features/results/types';

(globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' } };

const { fetchResultsBySession: fetchResults, FetchResultsError } = await import('../src/features/results/api');

type RpcFn = (name: string, params: any) => Promise<{ data: unknown; error: any }>;

function createClient(rpcImpl: RpcFn): any {
  return {
    rpc: rpcImpl,
    functions: { invoke: async () => ({ data: null, error: null }) },
  };
}

test('calls RPC with token when provided', async () => {
  let params: any = null;
  const client = createClient(async (_n, p) => {
    params = p;
    return { data: { profile: { id: 'p1' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  const res = await fetchResults({ sessionId: 's', shareToken: 't' }, client);
  assert.equal(res.profile.id, 'p1');
  assert.deepEqual(params, { session_id: 's', t: 't' });
});

test('dedupes concurrent calls', async () => {
  let calls = 0;
  const client = createClient(async () => {
    calls++;
    return { data: { profile: { id: 'p3' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  const [a, b] = await Promise.all([
    fetchResults({ sessionId: 's' }, client),
    fetchResults({ sessionId: 's' }, client),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
});

test('retries transient errors', async () => {
  let attempts = 0;
  const client = createClient(async () => {
    attempts++;
    if (attempts < 2) {
      return { data: null, error: { status: 500 } };
    }
    return { data: { profile: { id: 'p4' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  const res = await fetchResults({ sessionId: 's' }, client);
  assert.equal(res.profile.id, 'p4');
  assert.equal(attempts, 2);
});

test('does not retry non-transient errors', async () => {
  let attempts = 0;
  const client = createClient(async () => {
    attempts++;
    return { data: null, error: { code: '401' } };
  });
  await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
    e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(attempts, 1);
});

test('maps error variants', async () => {
  const cases: Array<[string, FetchResultsError['kind']]> = [
    ['404', 'not_found'],
    ['401', 'unauthorized'],
    ['403', 'forbidden'],
    ['400', 'invalid'],
  ];
  for (const [code, kind] of cases) {
    const client = createClient(async () => ({ data: null, error: { code } }));
    await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
      e instanceof FetchResultsError && e.kind === kind,
    );
  }
});
