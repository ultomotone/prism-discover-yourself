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

// Helper to build stable SWR key with filters
const key = (name: string, f: Filters) => ['view', name, JSON.stringify(f)] as const;

// Fallback data fetcher that uses direct table queries instead of views
const getAdminData = async (dataType: string, filters?: Record<string, any>) => {
  console.log(`🔍 Admin: Fetching ${dataType} with filters:`, filters);
  
  try {
    switch (dataType) {
      case 'kpi_overview':
        // Get basic KPI data from profiles and sessions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: sessions, error: sessionsError } = await supabase
          .from('assessment_sessions')
          .select('id, status, created_at, completed_at')
          .gte('created_at', thirtyDaysAgo.toISOString());
          
        if (sessionsError) throw sessionsError;
        
        const completedSessions = sessions?.filter(s => s.status === 'completed') || [];
        
        return [{
          completed_count: completedSessions.length,
          started_count: sessions?.length || 0,
          completion_rate_pct: sessions?.length ? (completedSessions.length / sessions.length * 100) : 0,
          overlay_positive: 0,
          overlay_negative: 0,
          avg_fit_score: 0
        }];

      case 'quality':
        // Get basic quality metrics from profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('confidence, fit_band, top_gap, score_fit_calibrated')
          .not('type_code', 'is', null)
          .limit(1000);
          
        if (profilesError) throw profilesError;
        
        const validProfiles = profiles?.filter(p => p.score_fit_calibrated !== null) || [];
        
        return [{
          n: validProfiles.length,
          fit_median: validProfiles.length ? 
            validProfiles.sort((a, b) => (a.score_fit_calibrated || 0) - (b.score_fit_calibrated || 0))[Math.floor(validProfiles.length / 2)]?.score_fit_calibrated || 0 : 0,
          gap_median: validProfiles.length ?
            validProfiles.sort((a, b) => (a.top_gap || 0) - (b.top_gap || 0))[Math.floor(validProfiles.length / 2)]?.top_gap || 0 : 0,
          close_calls_share: 0,
          inconsistency_mean: 0,
          sd_index_mean: 0,
          conf_low_share: 0,
          conf_hi_mod_share: 0,
          sd_ge_4_6: 0,
          incons_ge_1_5: 0
        }];

      case 'latest_assessments':
        // Get recent assessments from profiles
        const { data: recentProfiles, error: recentError } = await supabase
          .from('profiles')
          .select('*')
          .not('type_code', 'is', null)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (recentError) throw recentError;
        
        return recentProfiles?.map(profile => ({
          session_id: profile.session_id,
          type_code: profile.type_code,
          overlay: profile.overlay,
          confidence: profile.confidence,
          fit_band: profile.fit_band,
          fit_value: profile.score_fit_calibrated,
          score_fit_calibrated: profile.score_fit_calibrated,
          score_fit_raw: profile.score_fit_raw,
          share_pct: 0,
          finished_at: profile.created_at,
          version: profile.results_version,
          country: 'Unknown',
          invalid_combo_flag: profile.invalid_combo_flag
        })) || [];

      case 'conf_dist':
        // Get confidence distribution from profiles
        const { data: confProfiles, error: confError } = await supabase
          .from('profiles')
          .select('confidence')
          .not('confidence', 'is', null);
          
        if (confError) throw confError;
        
        const confStats: Record<string, number> = {};
        confProfiles?.forEach(p => {
          const conf = p.confidence || 'Unknown';
          confStats[conf] = (confStats[conf] || 0) + 1;
        });
        
        return Object.entries(confStats).map(([confidence, n]) => ({ confidence, n }));

      case 'overlay_conf':
        // Get overlay distribution from profiles
        const { data: overlayProfiles, error: overlayError } = await supabase
          .from('profiles')
          .select('overlay, confidence')
          .not('type_code', 'is', null);
          
        if (overlayError) throw overlayError;
        
        const overlayStats: Record<string, Record<string, number>> = {};
        overlayProfiles?.forEach(p => {
          const overlay = p.overlay || 'None';
          const confidence = p.confidence || 'Unknown';
          if (!overlayStats[overlay]) overlayStats[overlay] = {};
          overlayStats[overlay][confidence] = (overlayStats[overlay][confidence] || 0) + 1;
        });
        
        const result: Array<{overlay: string, confidence: string, n: number}> = [];
        Object.entries(overlayStats).forEach(([overlay, confMap]) => {
          Object.entries(confMap).forEach(([confidence, count]) => {
            result.push({ overlay, confidence, n: count });
          });
        });
        
        return result;

      case 'kpi_throughput':
        // Get throughput data from dashboard statistics
        const { data: statsData, error: statsError } = await supabase
          .from('dashboard_statistics')
          .select('stat_date, daily_assessments')
          .order('stat_date', { ascending: false })
          .limit(30);
          
        if (statsError) throw statsError;
        
        return statsData?.map(stat => ({
          d: stat.stat_date,
          completions: stat.daily_assessments,
          median_minutes: 0
        })) || [];

      default:
        console.warn(`🔍 Admin: Unknown data type: ${dataType}`);
        return [];
    }
  } catch (error) {
    console.error(`🔍 Admin: Error fetching ${dataType}:`, error);
    throw error;
  }
};

export const useAdvancedAdminAnalytics = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(false);

  // Use direct database queries with fallback approach
  const { data: kpiMetrics, error: kpiError } = useSWR(
    key('kpi_overview', filters),
    () => getAdminData('kpi_overview', filters),
    { refreshInterval: 15000, revalidateOnFocus: true, keepPreviousData: true }
  );

  const { data: qualityMetrics, error: qualityError } = useSWR(
    key('quality', filters),
    () => getAdminData('quality', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const { data: latestAssessments, error: assessmentsError } = useSWR(
    key('latest_assessments', filters),
    () => getAdminData('latest_assessments', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const { data: confDist, error: confError } = useSWR(
    key('conf_dist', filters),
    () => getAdminData('conf_dist', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const { data: overlayDist, error: overlayError } = useSWR(
    key('overlay_conf', filters),
    () => getAdminData('overlay_conf', filters),
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const { data: throughputData, error: throughputError } = useSWR(
    key('kpi_throughput', filters),
    () => getAdminData('kpi_throughput', filters),
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
        mutate(key('kpi_overview', filters)),
        mutate(key('quality', filters)),
        mutate(key('latest_assessments', filters)),
        mutate(key('conf_dist', filters)),
        mutate(key('overlay_conf', filters)),
        mutate(key('kpi_throughput', filters))
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (viewName: string) => {
    try {
      console.log(`🔍 Admin: Exporting ${viewName}`);
      // Use the direct data fetcher for exports
      const data = await getAdminData(viewName.replace('v_', '').replace('_v11', ''));
      
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