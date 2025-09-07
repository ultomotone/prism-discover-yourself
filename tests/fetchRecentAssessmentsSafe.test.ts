import test from 'node:test';
import assert from 'node:assert/strict';

(globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' } };

const {
  fetchRecentAssessmentsSafe,
  FetchRecentAssessmentsSafeError,
} = await import('../src/lib/api/recent');

type RpcFn = () => Promise<{ data: unknown; error: any }>;

function createClient(rpcImpl?: RpcFn) {
  return {
    rpc: rpcImpl ?? (async () => ({ data: [], error: null })),
  } as any;
}

test('returns rows from RPC', async () => {
  let calls = 0;
  const client = createClient(async () => {
    calls++;
    return {
      data: [
        {
          created_at: '2024-01-01',
          type_prefix: 'ABC',
          overlay: null,
          country_display: 'Hidden for Privacy',
          time_period: 'Today',
          fit_indicator: 'Strong',
        },
      ],
      error: null,
    };
  });
  const rows = await fetchRecentAssessmentsSafe(client);
  assert.equal(rows[0].type_prefix, 'ABC');
  assert.equal(calls, 1);
});

test('maps error variants', async () => {
  const cases: Array<[number, FetchRecentAssessmentsSafeError['kind']]> = [
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [500, 'transient'],
  ];
  for (const [status, kind] of cases) {
    const client = createClient(async () => ({ data: null, error: { status } }));
    await assert.rejects(
      () => fetchRecentAssessmentsSafe(client),
      (e) => e instanceof FetchRecentAssessmentsSafeError && e.kind === kind,
    );
  }
});
