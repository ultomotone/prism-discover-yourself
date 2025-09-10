import test from 'node:test';
import assert from 'node:assert/strict';

const filters = { from: '2024-01-01', to: '2024-02-01' } as any;

const sampleSummary = {
  topGapMedian: 1,
  confidenceMarginPct: 2,
  closeCallsPct: 3,
  completions: 4,
  completionRatePct: 5,
  medianDurationMin: 6,
  speedersPct: 7,
  stallersPct: 8,
  duplicatesPct: 9,
  validityPassPct: 10,
};

const sampleQuality = {
  top1FitMedian: 1,
  topGapMedian: 2,
  confidenceMarginPct: 3,
  closeCallsPct: 4,
  inconsistencyMean: 5,
  sdIndexMean: 6,
  validityPassRatePct: 7,
};

const sampleDistributions = {
  confidence: [{ bucket: 'A', count: 1 }],
  overlay: [{ overlay: '+', count: 2 }],
  types: [{ type: 'X', count: 3 }],
};

const sampleTrend = [{ date: '2024-01-01', count: 1 }];

const sampleLatest = [{
  sessionId: 's',
  userId: null,
  completedAt: '2024-01-01',
  device: null,
  type: null,
  confidence: null,
}];

const sampleTrr = { r: 0.5, pairs: 2, medianDaysApart: 3 };

test('admin api fetchers return data', async () => {
  (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'url', SUPABASE_ANON_KEY: 'key' } };
  const supabaseModule = await import('../src/lib/supabase/client');
  (supabaseModule.supabase as any).rpc = async (fn: string) => {
    switch (fn) {
      case 'admin_fetch_summary_kpis':
        return { data: sampleSummary, error: null };
      case 'admin_fetch_quality_metrics':
        return { data: sampleQuality, error: null };
      case 'admin_fetch_distributions':
        return { data: sampleDistributions, error: null };
      case 'admin_fetch_throughput_trend':
        return { data: sampleTrend, error: null };
      case 'admin_fetch_latest_assessments':
        return { data: sampleLatest, error: null };
      case 'admin_fetch_trr':
        return { data: sampleTrr, error: null };
      default:
        return { data: null, error: null };
    }
  };

  const {
    fetchSummaryKPIs,
    fetchQualityMetrics,
    fetchDistributions,
    fetchThroughputTrend,
    fetchLatestAssessments,
    fetchTestRetestReliability,
  } = await import('../src/lib/api/admin');

  assert.deepEqual(await fetchSummaryKPIs(filters), sampleSummary);
  assert.deepEqual(await fetchQualityMetrics(filters), sampleQuality);
  assert.deepEqual(await fetchDistributions(filters), sampleDistributions);
  assert.deepEqual(await fetchThroughputTrend(filters), sampleTrend);
  assert.deepEqual(await fetchLatestAssessments(filters), sampleLatest);
  assert.deepEqual(await fetchTestRetestReliability(filters), sampleTrr);

  delete (globalThis as any).window;
});

test('admin api fetchers throw on error', async () => {
  (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'url', SUPABASE_ANON_KEY: 'key' } };
  const supabaseModule = await import('../src/lib/supabase/client');
  (supabaseModule.supabase as any).rpc = async () => ({ data: null, error: { message: 'fail' } });

  const {
    fetchSummaryKPIs,
    fetchQualityMetrics,
    fetchDistributions,
    fetchThroughputTrend,
    fetchLatestAssessments,
    fetchTestRetestReliability,
  } = await import('../src/lib/api/admin');

  await assert.rejects(() => fetchSummaryKPIs(filters));
  await assert.rejects(() => fetchQualityMetrics(filters));
  await assert.rejects(() => fetchDistributions(filters));
  await assert.rejects(() => fetchThroughputTrend(filters));
  await assert.rejects(() => fetchLatestAssessments(filters));
  await assert.rejects(() => fetchTestRetestReliability(filters));

  delete (globalThis as any).window;
});
