import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import { JSDOM } from 'jsdom';

const wrapper = ({ children }: any) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

test('refetchAll triggers each query', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  (globalThis as any).navigator = dom.window.navigator;
  (window as any).__APP_CONFIG__ = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'key',
  };
  const supabaseModule = await import('../src/lib/supabase/client');
  const counts = {
    summary: 0,
    quality: 0,
    dist: 0,
    trend: 0,
    latest: 0,
    trr: 0,
    mh: 0,
  };
  (supabaseModule.supabase as any).rpc = async (fn: string) => {
    switch (fn) {
      case 'admin_fetch_summary_kpis':
        counts.summary++;
        return { data: {}, error: null };
      case 'admin_fetch_quality_metrics':
        counts.quality++;
        return { data: {}, error: null };
      case 'admin_fetch_distributions':
        counts.dist++;
        return { data: { confidence: [], overlay: [], types: [] }, error: null };
      case 'admin_fetch_throughput_trend':
        counts.trend++;
        return { data: [], error: null };
      case 'admin_fetch_latest_assessments':
        counts.latest++;
        return { data: [], error: null };
      case 'admin_fetch_trr':
        counts.trr++;
        return { data: { r: null, pairs: 0, medianDaysApart: null }, error: null };
      default:
        return { data: null, error: null };
    }
  };
  (supabaseModule.supabase as any).from = () => ({
    select: async () => {
      counts.mh++;
      return { data: [], error: null };
    },
  });

  const { useAdvancedAdminAnalytics } = await import('../src/hooks/useAdvancedAdminAnalytics');
  const { result } = renderHook(() => useAdvancedAdminAnalytics(), { wrapper });
  counts.summary = counts.quality = counts.dist = counts.trend = counts.latest = counts.trr = counts.mh = 0;
  await act(async () => {
    await result.current.refetchAll();
  });
  assert.equal(counts.summary, 1);
  assert.equal(counts.quality, 1);
  assert.equal(counts.dist, 1);
  assert.equal(counts.trend, 1);
  assert.equal(counts.latest, 1);
  assert.equal(counts.trr, 1);
  assert.equal(counts.mh, 4);

  delete (globalThis as any).window;
  delete (globalThis as any).document;
  delete (globalThis as any).navigator;
});
