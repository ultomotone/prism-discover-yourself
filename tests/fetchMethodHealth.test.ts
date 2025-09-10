import test from 'node:test';
import assert from 'node:assert/strict';

import type { MethodHealthData } from '../src/lib/api/admin';

test('returns method health data', async () => {
  const fc = [{ fc_count: 1, sessions: 2 }];
  const share = [{ entropy_range: '0-0.5', sessions: 3 }];
  const dim = [{ func: 'Te', min_d_items: 1, median_d_items: 2, low_coverage_sessions: 0 }];
  const section = [{ section: 'intro', median_sec: 10, drop_rate: 0.1 }];

  (globalThis as any).window = {
    __APP_CONFIG__: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'key',
    },
  };

  const supabaseModule = await import('../src/lib/supabase/client');
  (supabaseModule.supabase as any).from = (table: string) => ({
    select: async () => {
      switch (table) {
        case 'v_fc_coverage':
          return { data: fc, error: null };
        case 'v_share_entropy':
          return { data: share, error: null };
        case 'v_dim_coverage':
          return { data: dim, error: null };
        case 'v_section_times':
          return { data: section, error: null };
        default:
          return { data: null, error: null };
      }
    },
  });

  const { fetchMethodHealthData } = await import('../src/lib/api/admin');
  const result: MethodHealthData = await fetchMethodHealthData();
  assert.deepEqual(result, {
    fcCoverage: fc,
    shareEntropy: share,
    dimensionalCoverage: dim,
    sectionTimes: section,
  });

  delete (globalThis as any).window;
});

test('throws on query error', async () => {
  (globalThis as any).window = {
    __APP_CONFIG__: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'key',
    },
  };

  const supabaseModule = await import('../src/lib/supabase/client');
  (supabaseModule.supabase as any).from = () => ({
    select: async () => ({ data: null, error: { message: 'fail' } }),
  });

  const { fetchMethodHealthData } = await import('../src/lib/api/admin');
  await assert.rejects(() => fetchMethodHealthData());

  delete (globalThis as any).window;
});
