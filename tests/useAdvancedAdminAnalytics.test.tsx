import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';

import {
  useAdvancedAdminAnalytics,
} from '../src/hooks/useAdvancedAdminAnalytics';
import * as api from '../src/lib/api/admin';

const wrapper = ({ children }: any) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

test('refetchAll triggers each query', async () => {
  (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'u', SUPABASE_ANON_KEY: 'k' } };

  let summary = 0, quality = 0, dist = 0, trend = 0, latest = 0, trr = 0, mh = 0;
  (api.fetchSummaryKPIs as any) = async () => { summary++; return {} as any; };
  (api.fetchQualityMetrics as any) = async () => { quality++; return {} as any; };
  (api.fetchDistributions as any) = async () => { dist++; return { confidence: [], overlay: [], types: [] }; };
  (api.fetchThroughputTrend as any) = async () => { trend++; return []; };
  (api.fetchLatestAssessments as any) = async () => { latest++; return []; };
  (api.fetchTestRetestReliability as any) = async () => { trr++; return { r: null, pairs: 0, medianDaysApart: null }; };
  (api.fetchMethodHealthData as any) = async () => { mh++; return { fcCoverage: [], shareEntropy: [], dimensionalCoverage: [], sectionTimes: [] }; };

  const { result } = renderHook(() => useAdvancedAdminAnalytics(), { wrapper });
  await act(async () => {
    await result.current.refetchAll();
  });
  assert.equal(summary, 1);
  assert.equal(quality, 1);
  assert.equal(dist, 1);
  assert.equal(trend, 1);
  assert.equal(latest, 1);
  assert.equal(trr, 1);
  assert.equal(mh, 1);

  delete (globalThis as any).window;
});
