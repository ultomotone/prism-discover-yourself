import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchLiveAssessments, type LiveAssessment } from '../src/lib/api/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

test('returns RPC data', async () => {
  const rows: LiveAssessment[] = [
    {
      session_id: 's1',
      created_at: '2024-01-01T00:00:00Z',
      primary_type: 'A',
      overlay_label: 'B',
      fit_score: 50,
    },
  ]
  const client = {
    rpc: async () => ({ data: rows, error: null }),
  } as unknown as SupabaseClient

  const data = await fetchLiveAssessments(client)
  assert.deepEqual(data, rows)
})

test('throws on RPC error', async () => {
  const client = {
    rpc: async () => ({ data: null, error: { message: 'fail' } }),
  } as unknown as SupabaseClient

  await assert.rejects(() => fetchLiveAssessments(client))
})
