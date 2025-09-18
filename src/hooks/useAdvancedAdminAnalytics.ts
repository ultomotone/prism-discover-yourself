import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { z } from "zod";

const DateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
  preset: z.string(),
});
type DateRange = z.infer<typeof DateRangeSchema>;

const FiltersSchema = z.object({
  dateRange: DateRangeSchema,
  overlay: z.string(),
  confidence: z.string(),
  primaryType: z.string(),
  device: z.string(),
});
type Filters = z.infer<typeof FiltersSchema>;

const KpiRowSchema = z.object({
  completions: z.number(),
  completion_rate_pct: z.number(),
  median_duration_min: z.number(),
  speeders_pct: z.number(),
  stallers_pct: z.number(),
  duplicates_pct: z.number(),
  validity_pass_rate_pct: z.number(),
  top1_fit_median: z.number(),
  top_gap_median: z.number(),
  close_calls_pct: z.number(),
  inconsistency_mean: z.number(),
  sd_index_mean: z.number(),
  confidence_margin_median: z.number(),
});
type KpiRow = z.infer<typeof KpiRowSchema>;

const ConfidenceDistSchema = z.array(
  z.object({ bucket: z.string(), n: z.number() })
);
type ConfidenceDist = z.infer<typeof ConfidenceDistSchema>;

const OverlayDistSchema = z.array(
  z.object({ overlay: z.string(), n: z.number() })
);
type OverlayDist = z.infer<typeof OverlayDistSchema>;

const TypeDistSchema = z.array(
  z.object({ primary_type: z.string(), n: z.number() })
);
type TypeDist = z.infer<typeof TypeDistSchema>;

const ThroughputSchema = z.array(
  z.object({ day: z.string(), completions: z.number() })
);
type Throughput = z.infer<typeof ThroughputSchema>;

const LatestAssessmentsSchema = z.array(
  z.object({
    session_id: z.string(),
    user_id: z.string(),
    top1_fit: z.number().nullable(),
    top_gap: z.number().nullable(),
    confidence_margin: z.number().nullable(),
    overlay_label: z.string().nullable(),
    completed_at_et: z.string(),
  })
);
type LatestAssessments = z.infer<typeof LatestAssessmentsSchema>;
type LatestAssessment = LatestAssessments[0];

const KPIDataSchema = z.object({
  completions: z.number(),
  completionRate: z.number(),
  medianDuration: z.number(),
  speedersPercent: z.number(),
  stallersPercent: z.number(),
  duplicatesPercent: z.number(),
  validityPassRate: z.number(),
});
type KPIData = z.infer<typeof KPIDataSchema>;

const QualityDataSchema = z.object({
  top1FitMedian: z.number(),
  topGapMedian: z.number(),
  closeCallsPercent: z.number(),
  inconsistencyMean: z.number(),
  sdIndexMean: z.number(),
  confidenceMarginMedian: z.number(),
  validityPassRate: z.number(),
});
type QualityData = z.infer<typeof QualityDataSchema>;

const ChartDataSchema = z.object({
  confidenceDistribution: z.array(
    z.object({ confidence: z.string(), count: z.number() })
  ),
  overlayDistribution: z.array(
    z.object({ overlay: z.string(), count: z.number() })
  ),
  typeDistribution: z.array(
    z.object({ type: z.string(), count: z.number() })
  ),
  throughputTrend: z.array(
    z.object({ date: z.string(), sessions: z.number() })
  ),
});
type ChartData = z.infer<typeof ChartDataSchema>;

const MethodHealthDataSchema = z.object({
  fcCoverage: z.array(
    z.object({ fc_count: z.number(), sessions: z.number() })
  ),
  shareEntropy: z.array(
    z.object({ entropy_range: z.string(), sessions: z.number() })
  ),
  dimensionalCoverage: z.array(
    z.object({
      func: z.string(),
      min_d_items: z.number(),
      median_d_items: z.number(),
      low_coverage_sessions: z.number(),
    })
  ),
  sectionTimes: z.array(
    z.object({ section: z.string(), median_sec: z.number(), drop_rate: z.number() })
  ),
});
type MethodHealthData = z.infer<typeof MethodHealthDataSchema>;

const defaultDateRange: DateRange = DateRangeSchema.parse({
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  to: new Date(),
  preset: "30d",
});

const defaultFilters: Filters = FiltersSchema.parse({
  dateRange: defaultDateRange,
  overlay: "all",
  confidence: "all",
  primaryType: "all",
  device: "all",
});

export const useAdvancedAdminAnalytics = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [kpiRow, setKpiRow] = useState<KpiRow | null>(null);
  const [confDist, setConfDist] = useState<ConfidenceDist>([]);
  const [overlayDist, setOverlayDist] = useState<OverlayDist>([]);
  const [typeDist, setTypeDist] = useState<TypeDist>([]);
  const [throughputData, setThroughputData] = useState<Throughput>([]);
  const [latestAssessments, setLatestAssessments] =
    useState<LatestAssessments>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Admin Analytics: Starting data fetch...');
      
      // Use new comprehensive admin summary function first
      const { data: summary, error: summaryError } = await supabase.rpc("admin_get_summary", { last_n_days: 30 });
      
      if (!summaryError && summary) {
        console.log('✅ Admin Analytics: Summary data loaded', summary);
        // Use new summary data to populate KPI row
        const kpiData = {
          completions: summary.total_completed || 0,
          completion_rate_pct: summary.completion_rate || 0,
          median_duration_min: summary.median_duration_min || 0,
          speeders_pct: summary.speeders_pct || 0,
          stallers_pct: summary.stallers_pct || 0,
          duplicates_pct: summary.duplicates_pct || 0,
          validity_pass_rate_pct: summary.validity_pass_rate || 0,
          top1_fit_median: 0, // Not in summary yet
          top_gap_median: summary.top_gap_median || 0,
          close_calls_pct: summary.close_calls_pct || 0,
          inconsistency_mean: 0, // Not in summary yet
          sd_index_mean: 0, // Not in summary yet
          confidence_margin_median: summary.confidence_margin_median || 0,
        };
        setKpiRow(kpiData);
      } else {
        console.warn("admin_get_summary failed, falling back to individual calls:", summaryError);
        
        // Fallback to old method if new function fails
        const { data: kpisRes, error: kpiErr } = await supabase.rpc("admin_get_kpis_last_30d");
        if (kpiErr) throw kpiErr;

        const kpiParsed = KpiRowSchema.safeParse(kpisRes?.[0]);
        setKpiRow(kpiParsed.success ? kpiParsed.data : null);
      }

      // Continue with distribution data calls in parallel
      const [confRes, overlayRes, trendRes, latestRes, typeRes] = await Promise.all([
        supabase.rpc("admin_get_confidence_dist_last_30d"),
        supabase.rpc("admin_get_overlay_dist_last_30d"), 
        supabase.rpc("admin_get_throughput_last_14d"),
        supabase.rpc("admin_get_latest_assessments"),
        supabase.rpc("admin_get_type_dist_last_30d")
      ]);

      if (confRes.error) throw confRes.error;
      if (overlayRes.error) throw overlayRes.error;
      if (trendRes.error) throw trendRes.error;
      if (latestRes.error) throw latestRes.error;
      if (typeRes.error) throw typeRes.error;

      const confParsed = ConfidenceDistSchema.safeParse(confRes.data ?? []);
      setConfDist(confParsed.success ? confParsed.data : []);

      const overlayParsed = OverlayDistSchema.safeParse(overlayRes.data ?? []);
      setOverlayDist(overlayParsed.success ? overlayParsed.data : []);

      const trendParsed = ThroughputSchema.safeParse(trendRes.data ?? []);
      setThroughputData(trendParsed.success ? trendParsed.data : []);

      const latestParsed = LatestAssessmentsSchema.safeParse(latestRes.data ?? []);
      setLatestAssessments(latestParsed.success ? latestParsed.data : []);

      const typeParsed = TypeDistSchema.safeParse(typeRes.data ?? []);
      setTypeDist(typeParsed.success ? typeParsed.data : []);
      
      console.log('✅ Admin Analytics: All data loaded successfully');
    } catch (e: any) {
      console.error('❌ Admin Analytics: Data fetch failed:', e);
      setKpiRow(null);
      setConfDist([]);
      setOverlayDist([]);
      setThroughputData([]);
      setLatestAssessments([]);
      setTypeDist([]);
      setError(e?.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const kpiData: KPIData = useMemo(() => ({
    completions: kpiRow?.completions ?? 0,
    completionRate: kpiRow?.completion_rate_pct ?? 0,
    medianDuration: kpiRow?.median_duration_min ?? 0,
    speedersPercent: kpiRow?.speeders_pct ?? 0,
    stallersPercent: kpiRow?.stallers_pct ?? 0,
    duplicatesPercent: kpiRow?.duplicates_pct ?? 0,
    validityPassRate: kpiRow?.validity_pass_rate_pct ?? 0,
  }), [kpiRow]);

  const qualityData: QualityData = useMemo(() => ({
    top1FitMedian: kpiRow?.top1_fit_median ?? 0,
    topGapMedian: kpiRow?.top_gap_median ?? 0,
    closeCallsPercent: kpiRow?.close_calls_pct ?? 0,
    inconsistencyMean: kpiRow?.inconsistency_mean ?? 0,
    sdIndexMean: kpiRow?.sd_index_mean ?? 0,
    confidenceMarginMedian: kpiRow?.confidence_margin_median ?? 0,
    validityPassRate: kpiRow?.validity_pass_rate_pct ?? 0,
  }), [kpiRow]);

  const chartData: ChartData = useMemo(() => ({
    confidenceDistribution: confDist.map((item) => ({
      confidence: item.bucket,
      count: item.n,
    })),
    overlayDistribution: overlayDist.map((item) => ({
      overlay: item.overlay,
      count: item.n,
    })),
    typeDistribution: typeDist.map((item) => ({
      type: item.primary_type,
      count: item.n,
    })),
    throughputTrend: throughputData.map((item) => ({
      date: item.day,
      sessions: item.completions,
    })),
  }), [confDist, overlayDist, typeDist, throughputData]);

  const methodHealthData: MethodHealthData = useMemo(() => ({
    fcCoverage: [],
    shareEntropy: [],
    dimensionalCoverage: [],
    sectionTimes: [],
  }), []);

  const refreshData = async () => {
    await fetchAll();
  };

  const exportToCSV = async (viewName: string) => {
    const { data, error } = await supabase.from(viewName).select("*");
    if (error || !data) return;
    const csv = convertToCSV(data);
    downloadCSV(csv, `${viewName}_export.csv`);
  };

  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0] || {});
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    filters,
    setFilters,
    kpiData,
    qualityData,
    chartData,
    methodHealthData,
    loading,
    refreshData,
    exportToCSV,
    latestAssessments,
    error,
  };
};

export type {
  DateRange,
  Filters,
  KPIData,
  QualityData,
  ChartData,
  MethodHealthData,
  LatestAssessment,
  LatestAssessments
};