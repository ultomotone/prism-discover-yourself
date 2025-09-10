import test from 'node:test';
import assert from 'node:assert/strict';
import { render, screen } from '@testing-library/react';
import React from 'react';

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

const sampleDistributions = { confidence: [], overlay: [], types: [] };
const sampleTrend = [];
const sampleLatest = [];
const sampleTrr = { r: 0.5, pairs: 2, medianDaysApart: 3 };

(test as any).before(async () => {
  (globalThis as any).window = { __APP_CONFIG__: { SUPABASE_URL: 'u', SUPABASE_ANON_KEY: 'k' } };
});

test('admin page shows KPI numbers', async () => {
  const hookModule = await import('../src/hooks/useAdvancedAdminAnalytics');
  (hookModule.useAdvancedAdminAnalytics as any) = () => ({
    filters: {},
    setFilters: () => {},
    refetchAll: async () => {},
    summary: sampleSummary,
    quality: sampleQuality,
    distributions: sampleDistributions,
    throughput: sampleTrend,
    latest: sampleLatest,
    trr: sampleTrr,
    methodHealth: { fcCoverage: [], shareEntropy: [], dimensionalCoverage: [], sectionTimes: [] },
    isLoadingAny: false,
    isErrorAny: false,
    errors: [],
  });

  const apiModule = await import('../src/lib/api/admin');
  (apiModule.fetchEvidenceKpis as any) = async () => ({ r_overall: 0.5 });
  (apiModule.fetchDashboardSnapshot as any) = async () => ({ total_assessments: 1 });
  (apiModule.refreshDashboardStats as any) = async () => ({});
  (apiModule.refreshEvidenceKpis as any) = async () => ({});

  const Admin = (await import('../src/pages/Admin')).default;
  render(<Admin />);

  await screen.findByText('Completions');
  const completionValue = await screen.findByText('4');
  assert.ok(completionValue);
  const trrValue = await screen.findByText('0.500');
  assert.ok(trrValue);
});
