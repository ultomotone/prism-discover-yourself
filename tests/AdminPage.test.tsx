import test from 'node:test';
import assert from 'node:assert/strict';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JSDOM } from 'jsdom';
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
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  (globalThis as any).navigator = dom.window.navigator;
  (window as any).__APP_CONFIG__ = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'key',
  };
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
      case 'get_evidence_kpis':
        return { data: { r_overall: 0.5 }, error: null };
      case 'refresh_evidence_kpis':
        return { data: {}, error: null };
      case 'update_dashboard_statistics':
        return { data: {}, error: null };
      default:
        return { data: null, error: null };
    }
  };
  (supabaseModule.supabase as any).from = (table: string) => {
    if (table === 'dashboard_statistics_latest') {
      return {
        select: () => ({
          maybeSingle: async () => ({ data: { total_assessments: 1 }, error: null }),
        }),
      };
    }
    return { select: async () => ({ data: [], error: null }) };
  };
});

test.skip('admin page shows KPI numbers', async () => {
  const filtersModule = await import('../src/components/admin/AdminFilters');
  (filtersModule.AdminFilters as any) = () => <div />;
  const controlsModule = await import('../src/components/admin/AdminControls');
  (controlsModule.default as any) = () => <div />;
  const qualityModule = await import('../src/components/admin/QualityPanel');
  (qualityModule.QualityPanel as any) = () => <div />;
  const chartsModule = await import('../src/components/admin/ChartsSection');
  (chartsModule.ChartsSection as any) = () => <div />;
  const mhModule = await import('../src/components/admin/MethodHealthSection');
  (mhModule.MethodHealthSection as any) = () => <div />;
  const latestModule = await import('../src/components/admin/LatestAssessmentsTable');
  (latestModule.LatestAssessmentsTable as any) = () => <div />;

  const Admin = (await import('../src/pages/Admin')).default;
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <Admin />
    </QueryClientProvider>,
  );

  await screen.findByText('Completions');
  const completionValue = await screen.findByText('4');
  assert.ok(completionValue);
  const trrValue = await screen.findByText('0.500');
  assert.ok(trrValue);
});
