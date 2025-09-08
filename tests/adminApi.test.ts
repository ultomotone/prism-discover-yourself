import test from 'node:test';
import assert from 'node:assert/strict';
import type { DashboardStatsRow, EvidenceKpisRow } from '../src/lib/api/admin';

test('fetchDashboardStats returns latest stats even if refresh fails', async () => {
  (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'url', SUPABASE_ANON_KEY: 'key' } };
  const { fetchDashboardStats } = await import('../src/lib/api/admin');
  const row: DashboardStatsRow = {
    id: '1',
    stat_date: '2024-01-01',
    daily_assessments: 5,
    total_assessments: 5,
    overlay_negative: 1,
    overlay_positive: 4,
    type_distribution: null,
    updated_at: '2024-01-01T00:00:00Z',
  };
  const client = {
    rpc: async () => { throw new Error('rpc fail'); },
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => ({
            maybeSingle: async () => ({ data: row, error: null }),
          }),
        }),
      }),
    }),
  } as any;
  const data = await fetchDashboardStats(client);
  assert.deepEqual(data, row);
  delete (globalThis as any).window;
});

test('fetchDashboardStats throws on query error', async () => {
  (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'url', SUPABASE_ANON_KEY: 'key' } };
  const { fetchDashboardStats } = await import('../src/lib/api/admin');
  const client = {
    rpc: async () => ({ data: null, error: null }),
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => ({
            maybeSingle: async () => ({ data: null, error: { message: 'fail' } }),
          }),
        }),
      }),
    }),
  } as any;
  await assert.rejects(() => fetchDashboardStats(client));
  delete (globalThis as any).window;
});

test('fetchEvidenceKpis returns data', async () => {
  (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'url', SUPABASE_ANON_KEY: 'key' } };
  const { fetchEvidenceKpis } = await import('../src/lib/api/admin');
  const row: EvidenceKpisRow = { count: 10 };
  const client = {
    from: () => ({
      select: () => ({
        single: async () => ({ data: row, error: null }),
      }),
    }),
  } as any;
  const data = await fetchEvidenceKpis(client);
  assert.deepEqual(data, row);
  delete (globalThis as any).window;
});

test('fetchEvidenceKpis throws on query error', async () => {
  (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'url', SUPABASE_ANON_KEY: 'key' } };
  const { fetchEvidenceKpis } = await import('../src/lib/api/admin');
  const client = {
    from: () => ({
      select: () => ({
        single: async () => ({ data: null, error: { message: 'boom' } }),
      }),
    }),
  } as any;
  await assert.rejects(() => fetchEvidenceKpis(client));
  delete (globalThis as any).window;
});
