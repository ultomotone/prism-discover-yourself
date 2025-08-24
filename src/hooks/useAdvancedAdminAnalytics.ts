import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

// Fetcher for edge functions
const getView = async (viewName: string, filters?: Record<string, any>) => {
  const { data, error } = await supabase.functions.invoke('getView', {
    body: { view_name: viewName, limit: 1000, filters }
  });
  if (error) throw error;
  return data?.data || [];
};

export const useAdvancedAdminAnalytics = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(false);

  // Use SWR for data fetching with edge functions
  const { data: kpiMetrics } = useSWR(['view', 'v_kpi_overview_30d_v11'], () => getView('v_kpi_overview_30d_v11'), {
    refreshInterval: 15000,
    revalidateOnFocus: true
  });

  const { data: qualityMetrics } = useSWR(['view', 'v_kpi_quality'], () => getView('v_kpi_quality'), {
    refreshInterval: 15000
  });

  const { data: latestAssessments } = useSWR(['view', 'v_latest_assessments_v11'], () => getView('v_latest_assessments_v11'), {
    refreshInterval: 15000
  });

  const { data: confDist } = useSWR(['view', 'v_conf_dist'], () => getView('v_conf_dist'), {
    refreshInterval: 15000
  });

  const { data: overlayDist } = useSWR(['view', 'v_overlay_conf'], () => getView('v_overlay_conf'), {
    refreshInterval: 15000
  });

  const { data: throughputData } = useSWR(['view', 'v_kpi_throughput'], () => getView('v_kpi_throughput'), {
    refreshInterval: 15000
  });

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        mutate(['view', 'v_latest_assessments_v11']);
        mutate(['view', 'v_kpi_quality']);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_sessions' }, () => {
        mutate(['view', 'v_latest_assessments_v11']);
        mutate(['view', 'v_kpi_overview_30d_v11']);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_statistics' }, () => {
        mutate(['view', 'v_kpi_overview_30d_v11']);
        mutate(['view', 'v_kpi_throughput']);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Transform SWR data to existing format
  const kpiData: KPIData = {
    completions: kpiMetrics?.[0]?.completed_count || 0,
    completionRate: kpiMetrics?.[0]?.completion_rate_pct || 0,
    medianDuration: 0, // Would need additional endpoint
    speedersPercent: 0,
    stallersPercent: 0,
    duplicatesPercent: 0,
    validityPassRate: qualityMetrics?.[0]?.sd_ge_4_6 ? (100 - qualityMetrics[0].sd_ge_4_6) : 0
  };

  const qualityData: QualityData = {
    top1FitMedian: qualityMetrics?.[0]?.fit_median || 0,
    topGapMedian: qualityMetrics?.[0]?.gap_median || 0,
    closeCallsPercent: qualityMetrics?.[0]?.close_calls_share || 0,
    inconsistencyMean: qualityMetrics?.[0]?.inconsistency_mean || 0,
    sdIndexMean: qualityMetrics?.[0]?.sd_index_mean || 0,
    funcBalanceMedian: 0,
    confidenceMarginMedian: 0,
    validityPassRate: qualityMetrics?.[0]?.sd_ge_4_6 ? (100 - qualityMetrics[0].sd_ge_4_6) : 0
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
      // Mutate all SWR keys to force refresh
      await Promise.all([
        mutate(['view', 'v_kpi_overview_30d_v11']),
        mutate(['view', 'v_kpi_quality']),
        mutate(['view', 'v_latest_assessments_v11']),
        mutate(['view', 'v_conf_dist']),
        mutate(['view', 'v_overlay_conf']),
        mutate(['view', 'v_kpi_throughput'])
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (viewName: string) => {
    try {
      // Use the getView function for consistent data access
      const data = await getView(viewName);
      
      if (data && data.length > 0) {
        const csv = convertToCSV(data);
        downloadCSV(csv, `${viewName}_export.csv`);
      }
    } catch (error) {
      console.error(`Error exporting ${viewName}:`, error);
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