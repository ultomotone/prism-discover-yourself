import test from 'node:test';
import assert from 'node:assert/strict';

(globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' } };

const { fetchResults, FetchResultsError } = await import('../src/features/results/api');
import type { ProfileResult } from '../src/types/profile';

type RpcFn = (...args: any[]) => Promise<{ data: unknown; error: any }>; 
type FnFn = (...args: any[]) => Promise<{ data: unknown; error: any }>;

function createClient(rpcImpl?: RpcFn, fnImpl?: FnFn) {
  return {
    rpc: rpcImpl ?? (async () => ({ data: null, error: null })),
    functions: { invoke: fnImpl ?? (async () => ({ data: null, error: null })) },
  } as any;
}

function makeProfile(overrides: Partial<ProfileResult> = {}): ProfileResult {
  return {
    session_id: 's',
    type_code: 'IEE',
    base_func: 'Ne',
    creative_func: 'Fi',
    overlay: '+',
    strengths: {},
    dimensions: {},
    trait_scores: {},
    score_fit_raw: 0,
    score_fit_calibrated: 0,
    fit_band: 'High',
    confidence: 'High',
    conf_raw: 0,
    conf_calibrated: 0,
    close_call: false,
    top_gap: 0,
    top_types: [],
    type_scores: {},
    results_version: 'v1.0.0',
    ...overrides,
  };
}

test('uses RPC when share token provided', async () => {
  let rpcCalls = 0;
  const client = createClient(
    async () => {
      rpcCalls++;
      return { data: makeProfile({ session_id: 's' }), error: null };
    },
  );
  const res = await fetchResults({ sessionId: 's', shareToken: 't' }, client);
  assert.equal(res.profile.session_id, 's');
  assert.equal(rpcCalls, 1);
});

test('falls back to edge function without share token', async () => {
  let fnCalls = 0;
  const client = createClient(
    undefined,
    async () => {
      fnCalls++;
      return { data: { profile: makeProfile(), session: { id: 's', status: 'completed' } }, error: null };
    },
  );
  const res = await fetchResults({ sessionId: 's' }, client);
  assert.equal(res.profile.session_id, 's');
  assert.equal(fnCalls, 1);
});

test('dedupes concurrent calls', async () => {
  let calls = 0;
  const client = createClient(
    undefined,
    async () => {
      calls++;
      return { data: { profile: makeProfile(), session: { id: 's', status: 'completed' } }, error: null };
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
      return { data: { profile: makeProfile(), session: { id: 's', status: 'completed' } }, error: null };
    },
  );
  const res = await fetchResults({ sessionId: 's' }, client);
  assert.equal(res.profile.session_id, 's');
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
