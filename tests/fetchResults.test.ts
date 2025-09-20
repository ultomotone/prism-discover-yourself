import test from 'node:test';
import assert from 'node:assert/strict';
import type { Profile } from '../src/features/results/types';

(globalThis as any).window = {
  __APP_CONFIG__: {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
  },
};

const { fetchResultsBySession: fetchResults, FetchResultsError } = await import(
  '../src/features/results/api'
);

type InvokeFn = (name: string, opts: any) => Promise<{ data: unknown; error: any }>;

function createClient(invokeImpl: InvokeFn): any {
  return {
    rpc: async () => ({ data: null, error: null }),
    functions: { invoke: invokeImpl },
  };
}

test('calls RPC with token when provided', async () => {
  let name = '';
  let body: any = null;
  const client = createClient(async (n, opts) => {
    name = n; body = opts.body;
    return {
      data: { profile: { id: 'p1' }, session: { id: 's', status: 'completed' } },
      error: null,
    };
  });
  const res = await fetchResults({ sessionId: 's', shareToken: 't' }, client);
  assert.equal(res.profile.id, 'p1');
  assert.equal(name, 'get-results-by-session');
  assert.deepEqual(body, { session_id: 's', share_token: 't' });
});

test('dedupes concurrent calls', async () => {
  let calls = 0;
  const client = createClient(async () => {
    calls++;
    return {
      data: { profile: { id: 'p3' }, session: { id: 's', status: 'completed' } },
      error: null,
    };
  });
  const [a, b] = await Promise.all([
    fetchResults({ sessionId: 's', shareToken: 't' }, client),
    fetchResults({ sessionId: 's', shareToken: 't' }, client),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
});

test('retries transient errors', async () => {
  let attempts = 0;
  const client = createClient(async () => {
    attempts++;
    if (attempts < 2) {
      return { data: null, error: { code: '500' } };
    }
    return {
      data: { profile: { id: 'p4' }, session: { id: 's', status: 'completed' } },
      error: null,
    };
  });
  const res = await fetchResults({ sessionId: 's', shareToken: 't' }, client);
  assert.equal(res.profile.id, 'p4');
  assert.equal(attempts, 2);
});

test('treats 429 as transient', async () => {
  let attempts = 0;
  const client = createClient(async () => {
    attempts++;
    return attempts < 2
      ? { data: null, error: { code: '429' } }
      : { data: { profile: { id: 'p5' }, session: { id: 's', status: 'completed' } }, error: null };
  });
  const res = await fetchResults({ sessionId: 's', shareToken: 't' }, client);
  const profile: Profile = res.profile;
  assert.equal(profile.id, 'p5');
  assert.equal(attempts, 2);
});

test('does not retry non-transient errors', async () => {
  let attempts = 0;
  const client = createClient(async () => {
    attempts++;
    return { data: null, error: { code: '401' } };
  });
  await assert.rejects(
    () => fetchResults({ sessionId: 's', shareToken: 't' }, client),
    (e) => e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(attempts, 1);
});

test('maps error variants', async () => {
  const cases: Array<[string, FetchResultsError['kind']]> = [
    ['404', 'not_found'],
    ['401', 'unauthorized'],
    ['403', 'forbidden'],
    ['400', 'invalid'],
    ['PGRST116', 'not_found'],
  ];
  for (const [status, kind] of cases) {
    const client = createClient(async () => ({ data: null, error: { code: String(status) } }));
    await assert.rejects(() => fetchResults({ sessionId: 's', shareToken: 't' }, client), (e) =>
      e instanceof FetchResultsError && e.kind === kind,
    );
  }
});

test('missing share token throws unauthorized without invoking RPC', async () => {
  let calls = 0;
  const client = createClient(async () => {
    calls++;
    return { data: null, error: { code: '401' } };
  });
  await assert.rejects(
    () => fetchResults({ sessionId: 's' }, client),
    (e) => e instanceof FetchResultsError && e.kind === 'unauthorized',
  );
  assert.equal(calls, 0);
});
