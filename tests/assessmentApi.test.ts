import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecentAssessmentsSafe, defaultRetryConfig } from '../supabase/functions/assessment-api/lib.ts';

test('returns data without retry', async () => {
  const client = {
    rpc: async () => ({
      data: { items: [{ id: 'a1', started_at: '2024-01-01T00:00:00Z' }], next_cursor: null, has_more: false },
      error: null,
    }),
  };

  const res = await getRecentAssessmentsSafe(client);
  assert.equal(res.data[0].id, 'a1');
  assert.equal(res.has_more, false);
});

test('retries on transient error', async () => {
  let attempts = 0;
  const client = {
    rpc: async () => {
      attempts++;
      if (attempts < 2) {
        return { data: null, error: { message: 'fail', code: 500 } };
      }
      return { data: { items: [], next_cursor: null, has_more: false }, error: null };
    },
  };

  const res = await getRecentAssessmentsSafe(client, {}, { ...defaultRetryConfig, initialDelay: 0, maxDelay: 0 });
  assert.equal(attempts, 2);
  assert.equal(res.data.length, 0);
});

test('throws after max retries', async () => {
  let attempts = 0;
  const client = {
    rpc: async () => {
      attempts++;
      return { data: null, error: { message: 'boom', code: 500 } };
    },
  };

  await assert.rejects(
    () => getRecentAssessmentsSafe(client, {}, { ...defaultRetryConfig, maxRetries: 1, initialDelay: 0, maxDelay: 0 }),
  );
  assert.equal(attempts, 2);
});
