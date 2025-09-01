import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { subDays, format } from "date-fns";
import useSWR, { mutate } from 'swr';

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
  funcBalanceMedian: number;
  confidenceMarginMedian: number; // P1-P2
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
  from: subDays(new Date(), 30),
  to: new Date(),
  preset: "30d"
};

const defaultFilters: Filters = {
  dateRange: defaultDateRange,
  overlay: "all",
  confidence: "all",
  primaryType: "all",
  device: "all"
};

// Helper to build stable SWR key with filters
const key = (name: string, f: Filters) => ['view', name, JSON.stringify(f)] as const;

// Data fetcher that uses getView edge function (service role bypass)
const getAdminData = async (viewName: string, filters?: Record<string, any>) => {
  console.log(`🔍 Admin: Fetching ${viewName} via getView with filters:`, filters);
  
  try {
    const { data, error } = await supabase.functions.invoke('getView', {
      body: { view_name: viewName, limit: 1000, filters }
    });

    if (error) {
      console.error(`🔍 Admin: getView error for ${viewName}:`, error);
      throw error;
    }

    if (!data?.data) {
      console.warn(`🔍 Admin: No data returned for ${viewName}`);
      return [];
    }

    console.log(`🔍 Admin: Successfully fetched ${data.data.length} records for ${viewName}`);
    return data.data;
  } catch (error) {
    console.error(`🔍 Admin: Error fetching ${viewName}:`, error);
    throw error;
  }
};

export const useAdvancedAdminAnalytics = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(false);

  // Use getView edge function with proper view names
  const { data: kpiMetrics, error: kpiError } = useSWR(
    key('v_kpi_overview_30d_v11', filters),
    () => getAdminData('v_kpi_overview_30d_v11', filters),
    { refreshInterval: 15000, revalidateOnFocus: true, keepPreviousData: true }
  );

  const { data: qualityMetrics, error: qualityError } = useSWR(
    key('v_kpi_quality', filters),
    () => getAdminData('v_kpi_quality', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const { data: latestAssessments, error: assessmentsError } = useSWR(
    key('v_latest_assessments_v11', filters),
    () => getAdminData('v_latest_assessments_v11', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const { data: confDist, error: confError } = useSWR(
    key('v_conf_dist', filters),
    () => getAdminData('v_conf_dist', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const { data: overlayDist, error: overlayError } = useSWR(
    key('v_overlay_conf', filters),
    () => getAdminData('v_overlay_conf', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const { data: throughputData, error: throughputError } = useSWR(
    key('v_kpi_throughput', filters),
    () => getAdminData('v_kpi_throughput', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  // Log any errors for debugging
  useEffect(() => {
    if (kpiError) console.error('🔍 Admin KPI error:', kpiError);
    if (qualityError) console.error('🔍 Admin Quality error:', qualityError);
    if (assessmentsError) console.error('🔍 Admin Assessments error:', assessmentsError);
    if (confError) console.error('🔍 Admin Conf error:', confError);
    if (overlayError) console.error('🔍 Admin Overlay error:', overlayError);
    if (throughputError) console.error('🔍 Admin Throughput error:', throughputError);
  }, [kpiError, qualityError, assessmentsError, confError, overlayError, throughputError]);

  // Realtime subscriptions with updated cache keys
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assessment_responses' }, () => {
        mutate(key('latest_assessments', filters));
        mutate(key('kpi_overview', filters));
        mutate(key('quality', filters));
        mutate(key('kpi_throughput', filters));
        mutate(key('conf_dist', filters));
        mutate(key('overlay_conf', filters));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'assessment_responses' }, () => {
        mutate(key('kpi_overview', filters));
        mutate(key('quality', filters));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assessment_sessions' }, () => {
        mutate(key('latest_assessments', filters));
        mutate(key('kpi_overview', filters));
        mutate(key('kpi_throughput', filters));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        mutate(key('latest_assessments', filters));
        mutate(key('quality', filters));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'dashboard_statistics' }, () => {
        mutate(key('kpi_overview', filters));
        mutate(key('kpi_throughput', filters));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  // Transform SWR data to existing format with safe property access
  const kpiData: KPIData = {
    completions: (kpiMetrics && Array.isArray(kpiMetrics) && kpiMetrics[0] && 'completed_count' in kpiMetrics[0]) ? kpiMetrics[0].completed_count : 0,
    completionRate: (kpiMetrics && Array.isArray(kpiMetrics) && kpiMetrics[0] && 'completion_rate_pct' in kpiMetrics[0]) ? kpiMetrics[0].completion_rate_pct : 0,
    medianDuration: 0, // Would need additional endpoint
    speedersPercent: 0,
    stallersPercent: 0,
    duplicatesPercent: 0,
    validityPassRate: (qualityMetrics && Array.isArray(qualityMetrics) && qualityMetrics[0] && 'sd_ge_4_6' in qualityMetrics[0]) ? (100 - qualityMetrics[0].sd_ge_4_6) : 0
  };

  const qualityData: QualityData = {
    top1FitMedian: (qualityMetrics && Array.isArray(qualityMetrics) && qualityMetrics[0] && 'fit_median' in qualityMetrics[0]) ? qualityMetrics[0].fit_median : 0,
    topGapMedian: (qualityMetrics && Array.isArray(qualityMetrics) && qualityMetrics[0] && 'gap_median' in qualityMetrics[0]) ? qualityMetrics[0].gap_median : 0,
    closeCallsPercent: (qualityMetrics && Array.isArray(qualityMetrics) && qualityMetrics[0] && 'close_calls_share' in qualityMetrics[0]) ? qualityMetrics[0].close_calls_share : 0,
    inconsistencyMean: (qualityMetrics && Array.isArray(qualityMetrics) && qualityMetrics[0] && 'inconsistency_mean' in qualityMetrics[0]) ? qualityMetrics[0].inconsistency_mean : 0,
    sdIndexMean: (qualityMetrics && Array.isArray(qualityMetrics) && qualityMetrics[0] && 'sd_index_mean' in qualityMetrics[0]) ? qualityMetrics[0].sd_index_mean : 0,
    funcBalanceMedian: 0,
    confidenceMarginMedian: 0,
    validityPassRate: (qualityMetrics && Array.isArray(qualityMetrics) && qualityMetrics[0] && 'sd_ge_4_6' in qualityMetrics[0]) ? (100 - qualityMetrics[0].sd_ge_4_6) : 0
  };

  const chartData: ChartData = {
    confidenceDistribution: (confDist || []).map((item: any) => ({ 
      confidence: item.confidence || 'Unknown', 
      count: item.n || 0 
    })),
    overlayDistribution: (overlayDist || []).map((item: any) => ({ 
      overlay: item.overlay || 'Unknown', 
      count: item.n || 0 
    })),
    typeDistribution: [],
    throughputTrend: (throughputData || []).map((item: any) => ({
      date: format(new Date(item.d || new Date()), 'MM/dd'),
      sessions: item.completions || 0
    }))
  };

  const methodHealthData: MethodHealthData = {
    fcCoverage: [],
    shareEntropy: [],
    dimensionalCoverage: [],
    sectionTimes: []
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // Mutate all SWR keys to force refresh with current filters
      await Promise.all([
        mutate(key('v_kpi_overview_30d_v11', filters)),
        mutate(key('v_kpi_quality', filters)),
        mutate(key('v_latest_assessments_v11', filters)),
        mutate(key('v_conf_dist', filters)),
        mutate(key('v_overlay_conf', filters)),
        mutate(key('v_kpi_throughput', filters))
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (viewName: string) => {
    try {
      console.log(`🔍 Admin: Exporting ${viewName}`);
      // Use the getView edge function for exports
      const data = await getAdminData(viewName);
      
      if (data && data.length > 0) {
        const csv = convertToCSV(data);
        downloadCSV(csv, `${viewName}_export.csv`);
      } else {
        console.warn(`🔍 Admin: No data to export for ${viewName}`);
      }
    } catch (error) {
      console.error(`🔍 Admin: Error exporting ${viewName}:`, error);
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0]);
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
    latestAssessments: latestAssessments || []
  };
};