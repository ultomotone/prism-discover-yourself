import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DateRange {
  from: Date;
  to: Date;
  preset: string;
}

interface Filters {
  dateRange: DateRange;
  overlay: string;
  confidence: string;
  primaryType: string;
  device: string;
}

interface KPIData {
  completions: number;
  completionRate: number;
  medianDuration: number;
  speedersPercent: number;
  stallersPercent: number;
  duplicatesPercent: number;
  validityPassRate: number;
}

interface QualityData {
  top1FitMedian: number;
  topGapMedian: number;
  closeCallsPercent: number;
  inconsistencyMean: number;
  sdIndexMean: number;
  confidenceMarginMedian: number;
  validityPassRate: number;
}

interface ChartData {
  confidenceDistribution: Array<{ confidence: string; count: number }>;
  overlayDistribution: Array<{ overlay: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  throughputTrend: Array<{ date: string; sessions: number }>;
}

interface MethodHealthData {
  fcCoverage: Array<{ fc_count: number; sessions: number }>;
  shareEntropy: Array<{ entropy_range: string; sessions: number }>;
  dimensionalCoverage: Array<{ func: string; min_d_items: number; median_d_items: number; low_coverage_sessions: number }>;
  sectionTimes: Array<{ section: string; median_sec: number; drop_rate: number }>;
}

const defaultDateRange: DateRange = {
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  to: new Date(),
  preset: "30d",
};

const defaultFilters: Filters = {
  dateRange: defaultDateRange,
  overlay: "all",
  confidence: "all",
  primaryType: "all",
  device: "all",
};

export const useAdvancedAdminAnalytics = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [kpiRow, setKpiRow] = useState<any | null>(null);
  const [confDist, setConfDist] = useState<any[]>([]);
  const [overlayDist, setOverlayDist] = useState<any[]>([]);
  const [typeDist, setTypeDist] = useState<any[]>([]);
  const [throughputData, setThroughputData] = useState<any[]>([]);
  const [latestAssessments, setLatestAssessments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        kpisRes,
        confRes,
        overlayRes,
        trendRes,
        latestRes,
        typeRes,
      ] = await Promise.all([
        supabase.from("admin_kpis_last_30d").select("*").maybeSingle(),
        supabase.from("admin_confidence_dist_last_30d").select("*"),
        supabase.from("admin_overlay_dist_last_30d").select("*"),
        supabase.from("admin_throughput_last_14d").select("*"),
        supabase.from("admin_latest_assessments").select("*"),
        supabase.from("admin_type_dist_last_30d").select("*"),
      ]);

      if (kpisRes.error) throw kpisRes.error;

      setKpiRow(kpisRes.data ?? null);
      setConfDist(confRes.error ? [] : confRes.data ?? []);
      setOverlayDist(overlayRes.error ? [] : overlayRes.data ?? []);
      setThroughputData(trendRes.error ? [] : trendRes.data ?? []);
      setLatestAssessments(latestRes.error ? [] : latestRes.data ?? []);
      setTypeDist(typeRes.error ? [] : typeRes.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const kpiData: KPIData = {
    completions: kpiRow?.completions ?? 0,
    completionRate: kpiRow?.completion_rate_pct ?? 0,
    medianDuration: kpiRow?.median_duration_min ?? 0,
    speedersPercent: kpiRow?.speeders_pct ?? 0,
    stallersPercent: kpiRow?.stallers_pct ?? 0,
    duplicatesPercent: kpiRow?.duplicates_pct ?? 0,
    validityPassRate: kpiRow?.validity_pass_rate_pct ?? 0,
  };

  const qualityData: QualityData = {
    top1FitMedian: kpiRow?.top1_fit_median ?? 0,
    topGapMedian: kpiRow?.top_gap_median ?? 0,
    closeCallsPercent: kpiRow?.close_calls_pct ?? 0,
    inconsistencyMean: kpiRow?.inconsistency_mean ?? 0,
    sdIndexMean: kpiRow?.sd_index_mean ?? 0,
    confidenceMarginMedian: kpiRow?.confidence_margin_median ?? 0,
    validityPassRate: kpiRow?.validity_pass_rate_pct ?? 0,
  };

  const chartData: ChartData = {
    confidenceDistribution: confDist.map((item: any) => ({
      confidence: item.bucket,
      count: item.n,
    })),
    overlayDistribution: overlayDist.map((item: any) => ({
      overlay: item.overlay,
      count: item.n,
    })),
    typeDistribution: typeDist.map((item: any) => ({
      type: item.primary_type,
      count: item.n,
    })),
    throughputTrend: throughputData.map((item: any) => ({
      date: item.day_label,
      sessions: item.completions,
    })),
  };

  const methodHealthData: MethodHealthData = {
    fcCoverage: [],
    shareEntropy: [],
    dimensionalCoverage: [],
    sectionTimes: [],
  };

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
