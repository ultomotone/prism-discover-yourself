import test from 'node:test';
import assert from 'node:assert/strict';

type LiveRow = {
  created_at: string;
  session_id: string;
  primary_type: string | null;
  overlay_label: string | null;
  fit_score: number | null;
};

test('returns RPC data', async () => {
  const rows: LiveRow[] = [
    {
      session_id: 's1',
      created_at: '2024-01-01T00:00:00Z',
      primary_type: 'A',
      overlay_label: 'B',
      fit_score: 50,
    },
  ];

  (globalThis as any).window = {
    __APP_CONFIG__: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'key',
    },
  };

  const supabaseModule = await import('../src/lib/supabase/client');
  (supabaseModule.supabase as any).rpc = async () => ({
    data: rows,
    error: null,
  });

  const { fetchLiveAssessments } = await import('../src/lib/api/admin');
  const data = await fetchLiveAssessments();
  assert.deepEqual(data, rows);

  delete (globalThis as any).window;
});

test('throws on RPC error', async () => {
  (globalThis as any).window = {
    __APP_CONFIG__: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'key',
    },
  };

  const supabaseModule = await import('../src/lib/supabase/client');
  (supabaseModule.supabase as any).rpc = async () => ({
    data: null,
    error: { message: 'fail' },
  });

  const { fetchLiveAssessments } = await import('../src/lib/api/admin');
  await assert.rejects(() => fetchLiveAssessments());

  delete (globalThis as any).window;
});
