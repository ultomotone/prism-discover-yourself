import test from 'node:test';
import assert from 'node:assert/strict';

(globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' } };

const { fetchResultsBySession: fetchResults, FetchResultsError } = await import('../src/features/results/api');

type FnFn = (name: string, args: any) => Promise<{ data: unknown; error: any }>;

function createClient(fn: FnFn) {
  return { rpc: fn, functions: { invoke: async () => ({ data: null, error: null }) } } as any;
}

test('unauthorized does not retry', async () => {
  let calls = 0;
  const client = createClient(async () => {
    calls++;
    if (calls === 1) return { data: null, error: { code: '401' } };
    return { data: { profile: { id: 'p' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  await assert.rejects(() => fetchResults({ sessionId: 's' }, client), (e) =>
    e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(calls, 1);
});
