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

function createClient(invokeImpl: Client['functions']['invoke']): Client {
  return { rpc: async () => ({ data: null, error: null }), functions: { invoke: invokeImpl } };
}

test('invokes edge function with share token', async () => {
  let name = '';
  let body: any;
  const client = createClient(async (n, opts) => {
    name = n; body = opts.body;
    return { data: { profile: { id: 'p' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  await fetchResults({ sessionId: 's', shareToken: 't' }, client as any);
  assert.equal(name, 'get-results-by-session');
  assert.deepEqual(body, { session_id: 's', share_token: 't' });
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

test('requires share token', async () => {
  let calls = 0;
  const client = createClient(async () => {
    calls++;
    return { data: null, error: { code: '401' } };
  });
  await assert.rejects(() => fetchResults({ sessionId: 's' }, client as any), (e) =>
    e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(calls, 1);
});
