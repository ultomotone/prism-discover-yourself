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
      
      // First try the new comprehensive admin-get-metrics Edge Function
      try {
        const { data: metricsData, error: metricsError } = await supabase.functions.invoke('admin-get-metrics', {
          body: { lookbackDays: 30 }
        });
        
        if (!metricsError && metricsData?.ok) {
          console.log('✅ Admin Analytics: Edge Function metrics loaded', metricsData);
          
          // Convert Edge Function response to KPI row format
          const kpiData = {
            completions: metricsData.totals?.total_completed || 0,
            completion_rate_pct: metricsData.totals?.completion_rate || 0,
            median_duration_min: metricsData.durations?.median_duration_min || 0,
            speeders_pct: metricsData.durations?.speeders_pct || 0,
            stallers_pct: metricsData.durations?.stallers_pct || 0,
            duplicates_pct: metricsData.duplicates?.duplicates_pct || 0,
            validity_pass_rate_pct: metricsData.validity?.validity_pass_rate || 0,
            top1_fit_median: metricsData.fit?.top1_fit_median || 0,
            top_gap_median: metricsData.fit?.top_gap_median || 0,
            close_calls_pct: metricsData.fit?.close_calls_pct || 0,
            inconsistency_mean: 0, // Not available in new function yet
            sd_index_mean: 0, // Not available in new function yet
            confidence_margin_median: metricsData.fit?.confidence_margin_median || 0,
          };
          setKpiRow(kpiData);
          
          // Convert distributions from Edge Function
          if (metricsData.distributions?.overlay) {
            const overlayData = metricsData.distributions.overlay.map((item: any) => ({
              overlay: item.overlay,
              n: item.count
            }));
            setOverlayDist(overlayData);
          }
          
          if (metricsData.distributions?.types) {
            const typeData = metricsData.distributions.types.map((item: any) => ({
              primary_type: item.type_code,
              n: item.count
            }));
            setTypeDist(typeData);
          }
          
          // Convert daily trend
          if (metricsData.trends?.daily) {
            const trendData = metricsData.trends.daily.map((item: any) => ({
              day: item.day,
              completions: item.count
            }));
            setThroughputData(trendData);
          }
          
          // Convert confidence histogram to distribution
          if (metricsData.distributions?.confidence_bins) {
            const confData = metricsData.distributions.confidence_bins.map((count: number, index: number) => ({
              bucket: `${index * 10}-${(index + 1) * 10}%`,
              n: count
            })).filter((item: any) => item.n > 0);
            setConfDist(confData);
          }
          
          console.log('✅ Admin Analytics: Edge Function data processed successfully');
          
        } else {
          throw new Error(metricsError?.message || 'Edge Function failed');
        }
      } catch (edgeFunctionError) {
        console.warn("admin-get-metrics Edge Function failed, falling back to RPC calls:", edgeFunctionError);
        
        // Fallback to existing RPC functions
        const { data: summary, error: summaryError } = await supabase.rpc("admin_get_summary", { last_n_days: 30 });
        
        if (!summaryError && summary) {
          console.log('✅ Admin Analytics: RPC summary data loaded', summary);
          const kpiData = {
            completions: summary.total_completed || 0,
            completion_rate_pct: summary.completion_rate || 0,
            median_duration_min: summary.median_duration_min || 0,
            speeders_pct: summary.speeders_pct || 0,
            stallers_pct: summary.stallers_pct || 0,
            duplicates_pct: summary.duplicates_pct || 0,
            validity_pass_rate_pct: summary.validity_pass_rate || 0,
            top1_fit_median: 0,
            top_gap_median: summary.top_gap_median || 0,
            close_calls_pct: summary.close_calls_pct || 0,
            inconsistency_mean: 0,
            sd_index_mean: 0,
            confidence_margin_median: summary.confidence_margin_median || 0,
          };
          setKpiRow(kpiData);
        } else {
          throw summaryError || new Error('Both Edge Function and RPC failed');
        }
      }

      // Always fetch latest assessments as it's not in Edge Function yet
      const { data: latestRes, error: latestError } = await supabase.rpc("admin_get_latest_assessments");
      if (!latestError) {
        const latestParsed = LatestAssessmentsSchema.safeParse(latestRes ?? []);
        if (latestParsed.success) setLatestAssessments(latestParsed.data);
      }

      // Continue with additional distribution data calls only if needed (RPC fallback)
      const needsDistributions = confDist.length === 0 || overlayDist.length === 0 || typeDist.length === 0 || throughputData.length === 0;
      if (needsDistributions) {
        const [confRes, overlayRes, trendRes, typeRes] = await Promise.all([
          supabase.rpc("admin_get_confidence_dist_last_30d"),
          supabase.rpc("admin_get_overlay_dist_last_30d"), 
          supabase.rpc("admin_get_throughput_last_14d"),
          supabase.rpc("admin_get_type_dist_last_30d")
        ]);

        if (!confRes.error && confDist.length === 0) {
          const confParsed = ConfidenceDistSchema.safeParse(confRes.data ?? []);
          if (confParsed.success) setConfDist(confParsed.data);
        }

        if (!overlayRes.error && overlayDist.length === 0) {
          const overlayParsed = OverlayDistSchema.safeParse(overlayRes.data ?? []);
          if (overlayParsed.success) setOverlayDist(overlayParsed.data);
        }

        if (!trendRes.error && throughputData.length === 0) {
          const trendParsed = ThroughputSchema.safeParse(trendRes.data ?? []);
          if (trendParsed.success) setThroughputData(trendParsed.data);
        }

        if (!typeRes.error && typeDist.length === 0) {
          const typeParsed = TypeDistSchema.safeParse(typeRes.data ?? []);
          if (typeParsed.success) setTypeDist(typeParsed.data);
        }
      }
      
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