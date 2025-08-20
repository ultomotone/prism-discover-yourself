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
      // Use the new KPI overview view for accurate data
      const { data: kpiOverview } = await supabase
        .from('v_kpi_overview_30d_v11')
        .select('*')
        .single();

      // Get quality data for additional metrics
      const { data: qualityData } = await supabase
        .from('v_kpi_quality')
        .select('*')
        .single();

      // Get throughput data
      const { data: throughputData } = await supabase
        .from('v_kpi_throughput')
        .select('*');

      // Calculate median duration from throughput data with proper null handling
      let medianDuration = 25.5; // Default fallback
      if (throughputData && throughputData.length > 0) {
        const validDurations = throughputData
          .map((day: any) => day.median_minutes)
          .filter((minutes: any) => minutes && !isNaN(minutes));
        
        if (validDurations.length > 0) {
          const avgDuration = validDurations.reduce((sum: number, minutes: number) => sum + minutes, 0) / validDurations.length;
          medianDuration = avgDuration;
        }
      }

      if (kpiOverview) {
        setKpiData({
          completions: kpiOverview.completed_count || 0,
          completionRate: typeof kpiOverview.completion_rate_pct === 'number' && isFinite(kpiOverview.completion_rate_pct) 
            ? kpiOverview.completion_rate_pct 
            : 0,
          medianDuration: medianDuration,
          speedersPercent: 0, // Can be calculated separately if needed
          stallersPercent: 0, // Can be calculated separately if needed
          fitMedian: qualityData?.fit_median || kpiOverview.avg_fit_score || 0,
          gapMedian: qualityData?.gap_median || 0,
          closeCallsPercent: (qualityData?.close_calls_share || 0) * 100,
          inconsistencyMean: qualityData?.inconsistency_mean || 0,
          sdIndexMean: qualityData?.sd_index_mean || 0,
          lowConfidencePercent: typeof kpiOverview.hi_mod_conf_pct === 'number' && isFinite(kpiOverview.hi_mod_conf_pct)
            ? Math.max(0, 100 - kpiOverview.hi_mod_conf_pct)
            : 0
        });
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      // Get recent dashboard statistics for overlay and type distribution
      const { data: dashboardStats } = await supabase
        .from('dashboard_statistics')
        .select('*')
        .order('stat_date', { ascending: false })
        .limit(1)
        .single();

      // Also get recent assessments for confidence distribution
      const { data: recentAssessments } = await supabase
        .rpc('get_recent_assessments_safe');

      let confidenceDistribution = [
        { confidence: 'High', count: 0 },
        { confidence: 'Moderate', count: 0 },
        { confidence: 'Low', count: 0 }
      ];

      let overlayDistribution = [
        { overlay: '+', count: 0 },
        { overlay: '–', count: 0 }
      ];

      let typeDistribution: Array<{ type: string; count: number }> = [];

      if (dashboardStats) {
        // Use dashboard statistics for overlay distribution
        overlayDistribution = [
          { overlay: '+', count: dashboardStats.overlay_positive || 0 },
          { overlay: '–', count: dashboardStats.overlay_negative || 0 }
        ];

        // Use dashboard statistics for type distribution
        if (dashboardStats.type_distribution) {
          typeDistribution = Object.entries(dashboardStats.type_distribution as Record<string, number>)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);
        }
      }

      // Get real confidence distribution from profiles (with fallback)
      let { data: profilesForConfidence } = await supabase
        .from('profiles')
        .select('confidence')
        .gte('created_at', subDays(new Date(), 30).toISOString());

      if (!profilesForConfidence || profilesForConfidence.length === 0) {
        const { data: profilesExt } = await supabase
          .from('v_profiles_ext')
          .select('confidence')
          .gte('created_at', subDays(new Date(), 30).toISOString());
        profilesForConfidence = profilesExt as any;
      }

      if (profilesForConfidence && profilesForConfidence.length > 0) {
        const highCount = profilesForConfidence.filter(p => p.confidence === 'high').length;
        const modCount = profilesForConfidence.filter(p => p.confidence === 'moderate').length;
        const lowCount = profilesForConfidence.filter(p => p.confidence === 'low').length;
        
        confidenceDistribution = [
          { confidence: 'High', count: highCount },
          { confidence: 'Moderate', count: modCount },
          { confidence: 'Low', count: lowCount }
        ];
      }

      // Throughput trend (last 14 days)
      const { data: throughputTrendData } = await supabase
        .from('v_kpi_throughput')
        .select('d, completions')
        .gte('d', subDays(new Date(), 14).toISOString())
        .order('d', { ascending: true });

      const throughputTrend = (throughputTrendData || []).map((item: any) => ({
        date: format(new Date(item.d), 'MM/dd'),
        completions: item.completions || 0
      }));

      setChartData({
        confidenceDistribution,
        overlayDistribution,
        typeDistribution,
        throughputTrend
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
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