import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

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

export const useAdvancedAdminAnalytics = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [kpiData, setKpiData] = useState<KPIData>({
    completions: 0,
    completionRate: 0,
    medianDuration: 0,
    speedersPercent: 0,
    stallersPercent: 0,
    duplicatesPercent: 0,
    validityPassRate: 0
  });
  const [qualityData, setQualityData] = useState<QualityData>({
    top1FitMedian: 0,
    topGapMedian: 0,
    closeCallsPercent: 0,
    inconsistencyMean: 0,
    sdIndexMean: 0,
    funcBalanceMedian: 0
  });
  const [chartData, setChartData] = useState<ChartData>({
    confidenceDistribution: [],
    overlayDistribution: [],
    typeDistribution: [],
    throughputTrend: []
  });
  const [methodHealthData, setMethodHealthData] = useState<MethodHealthData>({
    fcCoverage: [],
    shareEntropy: [],
    dimensionalCoverage: [],
    sectionTimes: []
  });
  const [loading, setLoading] = useState(false);

  // Build where clause for filtering
  const buildWhereClause = () => {
    const conditions: string[] = [];
    
    if (filters.dateRange) {
      conditions.push(`created_at >= '${filters.dateRange.from.toISOString()}'`);
      conditions.push(`created_at <= '${filters.dateRange.to.toISOString()}'`);
    }
    
    if (filters.overlay !== "all") {
      conditions.push(`overlay = '${filters.overlay}'`);
    }
    
    if (filters.confidence !== "all") {
      conditions.push(`confidence = '${filters.confidence}'`);
    }
    
    if (filters.primaryType !== "all") {
      conditions.push(`type3 = '${filters.primaryType}'`);
    }
    
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  };

  const fetchKPIData = async () => {
    try {
      // Get basic session counts
      let query = supabase.from('v_sessions').select('*', { count: 'exact', head: true });
      
      // Apply filters
      if (filters.dateRange) {
        query = query.gte('created_at', filters.dateRange.from.toISOString())
                    .lte('created_at', filters.dateRange.to.toISOString());
      }
      if (filters.overlay !== "all") {
        query = query.eq('overlay', filters.overlay);
      }
      if (filters.confidence !== "all") {
        query = query.eq('confidence', filters.confidence);
      }
      if (filters.primaryType !== "all") {
        query = query.eq('type3', filters.primaryType);
      }

      const { count: completions } = await query;

      // Get sessions plus data for completion rate and duration
      let sessionsQuery = supabase.from('v_sessions_plus').select('duration_sec, completed_at');
      
      if (filters.dateRange) {
        sessionsQuery = sessionsQuery.gte('created_at', filters.dateRange.from.toISOString())
                                   .lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data: sessionsData } = await sessionsQuery;

      // Calculate metrics
      const totalSessions = sessionsData?.length || 0;
      const completedSessions = sessionsData?.filter(s => s.completed_at).length || 0;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // Duration calculations
      const validDurations = sessionsData?.filter(s => s.duration_sec && s.duration_sec > 0) || [];
      const durationsMinutes = validDurations.map(s => s.duration_sec / 60);
      
      const medianDuration = durationsMinutes.length > 0 ? 
        durationsMinutes.sort((a, b) => a - b)[Math.floor(durationsMinutes.length / 2)] || 0 : 0;
      
      const speedersPercent = durationsMinutes.length > 0 ?
        (durationsMinutes.filter(d => d < 12).length / durationsMinutes.length) * 100 : 0;
      
      const stallersPercent = durationsMinutes.length > 0 ?
        (durationsMinutes.filter(d => d > 60).length / durationsMinutes.length) * 100 : 0;

      // Get duplicates count
      const { data: duplicatesData } = await supabase.from('v_duplicates').select('*');
      const duplicateUsers = duplicatesData?.length || 0;

      // Get validity pass rate
      const { data: validityData } = await supabase.from('v_validity').select('pass_validity');
      const validityPasses = validityData?.filter(v => v.pass_validity).length || 0;
      const totalValidityChecks = validityData?.length || 0;
      const validityPassRate = totalValidityChecks > 0 ? (validityPasses / totalValidityChecks) * 100 : 0;

      setKpiData({
        completions: completions || 0,
        completionRate,
        medianDuration,
        speedersPercent,
        stallersPercent,
        duplicatesPercent: completions ? (duplicateUsers / completions) * 100 : 0,
        validityPassRate
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  const fetchQualityData = async () => {
    try {
      const { data: qualityStats } = await supabase
        .from('v_quality')
        .select('top1_fit, top_gap, inconsistency, sd_index, func_balance');

      if (qualityStats && qualityStats.length > 0) {
        // Calculate statistics client-side
        const top1Fits = qualityStats.map(q => q.top1_fit).filter(f => f !== null);
        const topGaps = qualityStats.map(q => q.top_gap).filter(g => g !== null);
        const inconsistencies = qualityStats.map(q => q.inconsistency).filter(i => i !== null);
        const sdIndices = qualityStats.map(q => q.sd_index).filter(s => s !== null);
        const funcBalances = qualityStats.map(q => q.func_balance).filter(f => f !== null);

        const median = (arr: number[]) => {
          const sorted = arr.sort((a, b) => a - b);
          return sorted[Math.floor(sorted.length / 2)] || 0;
        };

        const average = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        const closeCallsCount = topGaps.filter(gap => gap < 3).length;
        const closeCallsPercent = topGaps.length > 0 ? (closeCallsCount / topGaps.length) * 100 : 0;

        setQualityData({
          top1FitMedian: median(top1Fits),
          topGapMedian: median(topGaps),
          closeCallsPercent,
          inconsistencyMean: average(inconsistencies),
          sdIndexMean: average(sdIndices),
          funcBalanceMedian: median(funcBalances)
        });
      }
    } catch (error) {
      console.error('Error fetching quality data:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      // Confidence distribution
      const { data: confData } = await supabase
        .from('v_conf_dist')
        .select('confidence, n');

      // Overlay distribution
      const { data: overlayData } = await supabase
        .from('v_overlay_conf')
        .select('overlay, n');

      // Type distribution from sessions
      const { data: sessionsForTypes } = await supabase
        .from('v_sessions')
        .select('type3');

      // Throughput trend
      const { data: throughputData } = await supabase
        .from('v_throughput')
        .select('d, sessions')
        .gte('d', subDays(new Date(), 14).toISOString().split('T')[0])
        .order('d', { ascending: true });

      // Process overlay distribution
      const overlayMap = new Map();
      overlayData?.forEach(item => {
        const current = overlayMap.get(item.overlay) || 0;
        overlayMap.set(item.overlay, current + item.n);
      });
      const overlayDistribution = Array.from(overlayMap.entries()).map(([overlay, count]) => ({ overlay, count }));

      // Process type distribution
      const typeMap = new Map();
      sessionsForTypes?.forEach(session => {
        if (session.type3) {
          const current = typeMap.get(session.type3) || 0;
          typeMap.set(session.type3, current + 1);
        }
      });
      const typeDistribution = Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      setChartData({
        confidenceDistribution: (confData || []).map(item => ({ 
          confidence: item.confidence || 'Unknown', 
          count: item.n || 0 
        })),
        overlayDistribution,
        typeDistribution,
        throughputTrend: (throughputData || []).map(item => ({
          date: format(new Date(item.d), 'MM/dd'),
          sessions: item.sessions || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const fetchMethodHealthData = async () => {
    try {
      // FC Coverage histogram
      const { data: fcRawData } = await supabase
        .from('v_fc_coverage')
        .select('fc_count');

      // Share entropy histogram
      const { data: entropyRawData } = await supabase
        .from('v_share_entropy')
        .select('share_entropy');

      // Dimensional coverage
      const { data: dimRawData } = await supabase
        .from('v_dim_coverage')
        .select('func, d_items');

      // Section times
      const { data: sectionData } = await supabase
        .from('v_section_times')
        .select('section, median_sec, drop_rate')
        .order('median_sec', { ascending: false });

      // Process FC coverage
      const fcMap = new Map();
      fcRawData?.forEach(item => {
        const count = fcMap.get(item.fc_count) || 0;
        fcMap.set(item.fc_count, count + 1);
      });
      const fcCoverage = Array.from(fcMap.entries()).map(([fc_count, sessions]) => ({ fc_count, sessions }));

      // Process share entropy
      const entropyRanges = { low: 0, medium: 0, high: 0 };
      entropyRawData?.forEach(item => {
        if (item.share_entropy !== null) {
          if (item.share_entropy < 1.5) entropyRanges.low++;
          else if (item.share_entropy < 2.0) entropyRanges.medium++;
          else entropyRanges.high++;
        }
      });
      const shareEntropy = [
        { entropy_range: 'Low (< 1.5)', sessions: entropyRanges.low },
        { entropy_range: 'Medium (1.5-2.0)', sessions: entropyRanges.medium },
        { entropy_range: 'High (> 2.0)', sessions: entropyRanges.high }
      ];

      // Process dimensional coverage
      const funcMap = new Map();
      dimRawData?.forEach(item => {
        if (!funcMap.has(item.func)) {
          funcMap.set(item.func, []);
        }
        funcMap.get(item.func).push(item.d_items);
      });

      const dimensionalCoverage = Array.from(funcMap.entries()).map(([func, d_items_array]) => {
        const sorted = d_items_array.sort((a, b) => a - b);
        return {
          func,
          min_d_items: Math.min(...d_items_array),
          median_d_items: sorted[Math.floor(sorted.length / 2)] || 0,
          low_coverage_sessions: d_items_array.filter(d => d < 4).length
        };
      });

      setMethodHealthData({
        fcCoverage,
        shareEntropy,
        dimensionalCoverage,
        sectionTimes: sectionData || []
      });
    } catch (error) {
      console.error('Error fetching method health data:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchKPIData(),
        fetchQualityData(),
        fetchChartData(),
        fetchMethodHealthData()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (viewName: string) => {
    try {
      let data;
      
      // Use type-safe queries for specific views
      switch (viewName) {
        case 'v_sessions':
          data = (await supabase.from('v_sessions').select('*')).data;
          break;
        case 'v_sessions_plus':
          data = (await supabase.from('v_sessions_plus').select('*')).data;
          break;
        case 'v_quality':
          data = (await supabase.from('v_quality').select('*')).data;
          break;
        case 'v_fit_ranks':
          data = (await supabase.from('v_fit_ranks').select('*')).data;
          break;
        case 'v_conf_dist':
          data = (await supabase.from('v_conf_dist').select('*')).data;
          break;
        case 'v_overlay_conf':
          data = (await supabase.from('v_overlay_conf').select('*')).data;
          break;
        case 'v_throughput':
          data = (await supabase.from('v_throughput').select('*')).data;
          break;
        case 'v_duplicates':
          data = (await supabase.from('v_duplicates').select('*')).data;
          break;
        case 'v_validity':
          data = (await supabase.from('v_validity').select('*')).data;
          break;
        case 'v_fc_coverage':
          data = (await supabase.from('v_fc_coverage').select('*')).data;
          break;
        case 'v_share_entropy':
          data = (await supabase.from('v_share_entropy').select('*')).data;
          break;
        case 'v_dim_coverage':
          data = (await supabase.from('v_dim_coverage').select('*')).data;
          break;
        case 'v_section_times':
          data = (await supabase.from('v_section_times').select('*')).data;
          break;
        default:
          throw new Error(`Unknown view: ${viewName}`);
      }
      
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

  // Update date range when preset changes
  useEffect(() => {
    let from: Date;
    const to = new Date();
    
    switch (filters.dateRange.preset) {
      case "7d":
        from = subDays(to, 7);
        break;
      case "30d":
        from = subDays(to, 30);
        break;
      case "90d":
        from = subDays(to, 90);
        break;
      case "1y":
        from = subDays(to, 365);
        break;
      default:
        from = subDays(to, 30);
    }
    
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, from, to }
    }));
  }, [filters.dateRange.preset]);

  // Refresh data when filters change
  useEffect(() => {
    refreshData();
  }, [filters]);

  // Realtime: refresh on new completions and stats updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'assessment_sessions' }, (payload: any) => {
        // If a session just completed, refresh
        const newStatus = (payload?.new as any)?.status;
        if (newStatus === 'completed') refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_statistics' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    filters,
    setFilters,
    kpiData,
    qualityData,
    chartData,
    methodHealthData,
    loading,
    refreshData,
    exportToCSV
  };
};