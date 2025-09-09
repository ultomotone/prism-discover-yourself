import test from 'node:test';
import assert from 'node:assert/strict';

(globalThis as any).window = {
  __APP_CONFIG__: {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
  },
};

const { fetchResultsBySession: fetchResults, FetchResultsError } = await import(
  '../src/features/results/api'
);

type Client = {
  rpc: (name: string, params: any) => Promise<{ data: unknown; error: any }>;
  functions: { invoke: (name: string, opts: any) => Promise<{ data: unknown; error: any }> };
};

function createClient(rpcImpl: Client['rpc']): Client {
  return { rpc: rpcImpl, functions: { invoke: async () => ({ data: null, error: null }) } };
}

test('sends snake_case args to RPC', async () => {
  let name = '';
  let params: any;
  const client = createClient(async (n, p) => {
    name = n; params = p;
    return { data: { profile: { id: 'p' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  await fetchResults({ sessionId: 's' }, client as any);
  assert.equal(name, 'get_results_by_session');
  assert.deepEqual(params, { session_id: 's' });
});

test('unauthorized does not retry', async () => {
  let calls = 0;
  const client = createClient(async () => {
    calls++;
    if (calls === 1) return { data: null, error: { code: '401' } };
    return { data: { profile: { id: 'p' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  await assert.rejects(() => fetchResults({ sessionId: 's' }, client as any), (e) =>
    e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(calls, 1);
});

test('falls back to legacy RPC when enabled and no token', async () => {
  process.env.VITE_ALLOW_LEGACY_RESULTS = 'true';
  let name = '';
  let params: any;
  const client = createClient(async (n, p) => {
    name = n; params = p;
    return { data: { profile: { id: 'p' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  await fetchResults({ sessionId: 's' }, client as any);
  assert.equal(name, 'get_results_by_session_legacy');
  assert.deepEqual(params, { session_id: 's' });
  delete process.env.VITE_ALLOW_LEGACY_RESULTS;
});
