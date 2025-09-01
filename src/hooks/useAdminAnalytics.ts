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
}

interface KPIData {
  completions: number;
  completionRate: number;
  medianDuration: number;
  speedersPercent: number;
  stallersPercent: number;
  fitMedian: number;
  gapMedian: number;
  closeCallsPercent: number;
  inconsistencyMean: number;
  sdIndexMean: number;
  lowConfidencePercent: number;
}

interface ChartData {
  confidenceDistribution: Array<{ confidence: string; count: number }>;
  overlayDistribution: Array<{ overlay: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  throughputTrend: Array<{ date: string; completions: number }>;
}

interface SessionData {
  totalSessions: number;
  avgDuration: number;
  completionRate: number;
  slowSections: Array<{ section: string; median_seconds: number }>;
}

interface RetestData {
  strengthCorrelation: number;
  typeStability: number;
  containment: number;
  medianStabilityScore: number;
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
  primaryType: "all"
};

const defaultKPIData: KPIData = {
  completions: 0,
  completionRate: 0,
  medianDuration: 0,
  speedersPercent: 0,
  stallersPercent: 0,
  fitMedian: 0,
  gapMedian: 0,
  closeCallsPercent: 0,
  inconsistencyMean: 0,
  sdIndexMean: 0,
  lowConfidencePercent: 0
};

const defaultChartData: ChartData = {
  confidenceDistribution: [],
  overlayDistribution: [],
  typeDistribution: [],
  throughputTrend: []
};

const defaultSessionData: SessionData = {
  totalSessions: 0,
  avgDuration: 0,
  completionRate: 0,
  slowSections: []
};

const defaultRetestData: RetestData = {
  strengthCorrelation: 0,
  typeStability: 0,
  containment: 0,
  medianStabilityScore: 0
};

export const useAdminAnalytics = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [kpiData, setKpiData] = useState<KPIData>(defaultKPIData);
  const [chartData, setChartData] = useState<ChartData>(defaultChartData);
  const [sessionData, setSessionData] = useState<SessionData>(defaultSessionData);
  const [retestData, setRetestData] = useState<RetestData>(defaultRetestData);
  const [loading, setLoading] = useState(false);
const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/v_latest_assessments_v11", { headers: { "Cache-Control": "no-store" }});
    fetch("/api/admin/v_kpi_overview_30d_v11", { headers: { "Cache-Control": "no-store" }});
  }, []);

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

  const fetchKPIData = async () => {
    try {
      // Force v1.1 calibrated fits only - no cache
      const { data: kpiOverview } = await supabase
        .from('v_kpi_overview_30d_v11')
        .select('*')
        .single();

      if (kpiOverview) {
        // Only use avg_fit_score which is based on score_fit_calibrated
        setKpiData({
          completions: kpiOverview.completed_count || 0,
          completionRate: 0, // Removed - don't fetch
          medianDuration: 25.5, // Static fallback
          speedersPercent: 0,
          stallersPercent: 0,
          fitMedian: kpiOverview.avg_fit_score || 0, // v1.1 calibrated only
          gapMedian: 0,
          closeCallsPercent: 0,
          inconsistencyMean: 0,
          sdIndexMean: 0,
          lowConfidencePercent: 0 // Removed - don't fetch
        });

        // Verification log
        console.info('Admin v1.1 data source OK', {
          completions: kpiOverview.completed_count,
          avgFitScore: kpiOverview.avg_fit_score
        });
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      // Fetch confidence distribution from v_conf_dist
      const { data: confDist } = await supabase
        .from('v_conf_dist')
        .select('*');

      // Fetch overlay distribution from v_kpi_overlay  
      const { data: overlayDist } = await supabase
        .from('v_kpi_overlay')
        .select('*');

      // Fetch type distribution from v_profiles_ext (use type_code not filtered)
      const { data: typeRaw } = await supabase
        .from('v_profiles_ext')
        .select('type_code')
        .not('type_code', 'is', null)
        .neq('type_code', 'UNK');

      // Process type distribution
      const typeCounts: Record<string, number> = {};
      if (typeRaw) {
        typeRaw.forEach((row: any) => {
          const type = row.type_code?.substring(0, 3); // Get 3-letter prefix
          if (type) {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
          }
        });
      }

      // Fetch throughput trend from v_kpi_throughput  
      const { data: throughputRaw } = await supabase
        .from('v_kpi_throughput')
        .select('*')
        .order('d', { ascending: false })
        .limit(14);

      setChartData({
        confidenceDistribution: confDist?.map((item: any) => ({
          confidence: item.confidence,
          count: item.n
        })) || [],
        overlayDistribution: overlayDist?.map((item: any) => ({
          overlay: item.overlay,  
          count: item.n
        })) || [],
        typeDistribution: Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        throughputTrend: throughputRaw?.map((item: any) => ({
          date: format(new Date(item.d), 'MMM dd'),
          completions: item.completions,
          sessions: item.completions // Alias for consistency
        })) || []
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData(defaultChartData);
    }
  };

  const fetchSessionData = async () => {
    try {
      const { data: sectionsData } = await supabase
        .from('v_section_time')
        .select('*')
        .order('median_seconds', { ascending: false });

      // Mock session analytics data
      setSessionData({
        totalSessions: 1234,
        avgDuration: 28.5,
        completionRate: 85.2,
        slowSections: sectionsData || []
      });
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const fetchRetestData = async () => {
    try {
      const { data: retestDeltas } = await supabase
        .from('v_retest_deltas')
        .select('*');

      if (retestDeltas && retestDeltas.length > 0) {
        const validDeltas = retestDeltas.filter((delta: any) => 
          delta.strength_delta !== null && delta.type_same !== null
        );

        if (validDeltas.length > 0) {
          const avgStrengthDelta = validDeltas.reduce((sum: number, delta: any) => 
            sum + (delta.strength_delta || 0), 0) / validDeltas.length;
          
          const typeStabilityRate = validDeltas.reduce((sum: number, delta: any) => 
            sum + (delta.type_same || 0), 0) / validDeltas.length * 100;

          setRetestData({
            strengthCorrelation: Math.max(0, 1 - (avgStrengthDelta / 10)), // Approximate correlation
            typeStability: typeStabilityRate,
            containment: 78.5, // Mock for now
            medianStabilityScore: 82.3 // Mock for now
          });
        }
      }
    } catch (error) {
      console.error('Error fetching retest data:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchKPIData(),
        fetchChartData(),
        fetchSessionData(),
        fetchRetestData()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Check for alerts with proper NaN guards
  useEffect(() => {
    const newAlerts: string[] = [];
    
    if (typeof kpiData.completionRate === 'number' && isFinite(kpiData.completionRate) && kpiData.completionRate < 60) {
      newAlerts.push(`Low completion rate: ${kpiData.completionRate.toFixed(1)}%`);
    }
    
    if (typeof kpiData.lowConfidencePercent === 'number' && isFinite(kpiData.lowConfidencePercent) && kpiData.lowConfidencePercent > 15) {
      newAlerts.push(`High low-confidence rate: ${kpiData.lowConfidencePercent.toFixed(1)}%`);
    }
    
    if (typeof kpiData.inconsistencyMean === 'number' && isFinite(kpiData.inconsistencyMean) && kpiData.inconsistencyMean > 1.5) {
      newAlerts.push(`High inconsistency: ${kpiData.inconsistencyMean.toFixed(2)}`);
    }
    
    if (typeof retestData.typeStability === 'number' && isFinite(retestData.typeStability) && retestData.typeStability < 65) {
      newAlerts.push(`Low type stability: ${retestData.typeStability.toFixed(1)}%`);
    }
    
    setAlerts(newAlerts);
  }, [kpiData, retestData]);

  // Initial data fetch and real-time subscriptions
  useEffect(() => {
    refreshData();

    // Set up real-time listeners
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        refreshData();
      })
      .subscribe();

    const responsesChannel = supabase
      .channel('responses-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assessment_responses' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [filters]);

  return {
    filters,
    setFilters,
    kpiData,
    chartData,
    sessionData,
    retestData,
    loading,
    alerts,
    refreshData
  };
};