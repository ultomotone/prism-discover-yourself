import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchSummaryKPIs,
  fetchQualityMetrics,
  fetchDistributions,
  fetchThroughputTrend,
  fetchLatestAssessments,
  fetchTestRetestReliability,
  fetchMethodHealthData,
  type SummaryKpis,
  type QualityMetrics,
  type Distributions,
  type ThroughputTrend,
  type LatestAssessments,
  type TestRetestReliability,
  type MethodHealthData,
  type AdminFilters,
} from '@/lib/api/admin';

const defaultFilters: AdminFilters = {
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  to: new Date().toISOString(),
  overlay: 'all',
  confidence: 'all',
  type: 'all',
  device: 'all',
};

export const useAdvancedAdminAnalytics = () => {
  const [filters, setFilters] = useState<AdminFilters>(defaultFilters);

  const summaryQuery = useQuery({
    queryKey: ['admin', 'summary', filters],
    queryFn: () => fetchSummaryKPIs(filters),
  });
  const qualityQuery = useQuery({
    queryKey: ['admin', 'quality', filters],
    queryFn: () => fetchQualityMetrics(filters),
  });
  const distQuery = useQuery({
    queryKey: ['admin', 'dist', filters],
    queryFn: () => fetchDistributions(filters),
  });
  const trendQuery = useQuery({
    queryKey: ['admin', 'trend', filters],
    queryFn: () => fetchThroughputTrend(filters),
  });
  const latestQuery = useQuery({
    queryKey: ['admin', 'latest', filters],
    queryFn: () => fetchLatestAssessments(filters),
  });
  const trrQuery = useQuery({
    queryKey: ['admin', 'trr', filters],
    queryFn: () => fetchTestRetestReliability(filters),
  });
  const methodHealthQuery = useQuery({
    queryKey: ['admin', 'method-health'],
    queryFn: fetchMethodHealthData,
  });

  const refetchAll = () =>
    Promise.all([
      summaryQuery.refetch(),
      qualityQuery.refetch(),
      distQuery.refetch(),
      trendQuery.refetch(),
      latestQuery.refetch(),
      trrQuery.refetch(),
      methodHealthQuery.refetch(),
    ]);

  const isLoadingAny =
    summaryQuery.isLoading ||
    qualityQuery.isLoading ||
    distQuery.isLoading ||
    trendQuery.isLoading ||
    latestQuery.isLoading ||
    trrQuery.isLoading ||
    methodHealthQuery.isLoading;

  const isErrorAny =
    summaryQuery.isError ||
    qualityQuery.isError ||
    distQuery.isError ||
    trendQuery.isError ||
    latestQuery.isError ||
    trrQuery.isError ||
    methodHealthQuery.isError;

  const errors = [
    summaryQuery.error,
    qualityQuery.error,
    distQuery.error,
    trendQuery.error,
    latestQuery.error,
    trrQuery.error,
    methodHealthQuery.error,
  ].filter(Boolean);

  return {
    filters,
    setFilters,
    refetchAll,
    summary:
      summaryQuery.data ?? {
        topGapMedian: 0,
        confidenceMarginPct: 0,
        closeCallsPct: 0,
        completions: 0,
        completionRatePct: 0,
        medianDurationMin: 0,
        speedersPct: 0,
        stallersPct: 0,
        duplicatesPct: 0,
        validityPassPct: 0,
      },
    quality:
      qualityQuery.data ?? {
        top1FitMedian: 0,
        topGapMedian: 0,
        confidenceMarginPct: 0,
        closeCallsPct: 0,
        inconsistencyMean: 0,
        sdIndexMean: 0,
        validityPassRatePct: 0,
      },
    distributions:
      distQuery.data ?? {
        confidence: [],
        overlay: [],
        types: [],
      },
    throughput: trendQuery.data ?? [],
    latest: latestQuery.data ?? [],
    trr: trrQuery.data ?? { r: null, pairs: 0, medianDaysApart: null },
    methodHealth:
      methodHealthQuery.data ?? {
        fcCoverage: [],
        shareEntropy: [],
        dimensionalCoverage: [],
        sectionTimes: [],
      },
    isLoadingAny,
    isErrorAny,
    errors,
  };
};

export type {
  SummaryKpis,
  QualityMetrics,
  Distributions,
  ThroughputTrend,
  LatestAssessments,
  TestRetestReliability,
  MethodHealthData,
  AdminFilters,
};
