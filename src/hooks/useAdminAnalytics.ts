import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface DateRange {
  from: string;
  to: string;
}

export interface Filters {
  dateRange: DateRange;
  types: string[];
  overlay: string[];
  confidence: string[];
}

export interface KPIData {
  totalAssessments: number;
  completionRate: number;
  highModerateConfidence: number;
  avgInconsistency: number;
  avgFitGap: number;
  overlayMix: { overlay: string; count: number }[];
  assessmentsPerDay: number;
}

export interface ChartData {
  completionsOverTime: { date: string; count: number; overlay?: string }[];
  typeDistribution: { type: string; count: number }[];
  functionHeatmap: { function: string; avgStrength: number }[];
  dimensionalityDistribution: { function: string; dimension: string; count: number }[];
  blocksMix: { block: string; avgValue: number }[];
  validityHistogram: { bucket: number; count: number }[];
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  startedAt: string;
  completedAt?: string;
  duration: number;
  typeCode?: string;
  overlay?: string;
  confidence?: string;
  inconsistency?: number;
  sdIndex?: number;
}

export interface RetestData {
  userId: string;
  sessionId1: string;
  sessionId2: string;
  daysBetween: number;
  strengthDelta: number;
  dimChanges: number;
  typeChanged: boolean;
}

const defaultDateRange: DateRange = {
  from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  to: format(new Date(), 'yyyy-MM-dd')
};

const defaultFilters: Filters = {
  dateRange: defaultDateRange,
  types: [],
  overlay: [],
  confidence: []
};

export const useAdminAnalytics = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [retestData, setRetestData] = useState<RetestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  const fetchKPIData = async () => {
    const { from, to } = filters.dateRange;
    
    try {
      // Total assessments
      const { count: totalAssessments } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', from)
        .lte('created_at', to);

      // Completion rate - calculate manually instead of using RPC
      const { count: startedSessions } = await supabase
        .from('v_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', from)
        .lte('started_at', to);

      const completionRate = totalAssessments && startedSessions ? 
        (totalAssessments / startedSessions) : 0;

      // Confidence mix
      const { data: confidenceData } = await supabase
        .from('v_profiles_ext')
        .select('confidence')
        .gte('created_at', from)
        .lte('created_at', to);

      const highModerate = confidenceData?.filter(d => 
        d.confidence === 'High' || d.confidence === 'Moderate'
      ).length || 0;
      const total = confidenceData?.length || 1;

      // Validity metrics
      const { data: validityData } = await supabase
        .from('v_profiles_ext')
        .select('inconsistency, fit_gap')
        .gte('created_at', from)
        .lte('created_at', to);

      const avgInconsistency = validityData?.reduce((sum, d) => sum + (d.inconsistency || 0), 0) / (validityData?.length || 1);
      const avgFitGap = validityData?.reduce((sum, d) => sum + (d.fit_gap || 0), 0) / (validityData?.length || 1);

      // Overlay mix
      const { data: overlayData } = await supabase
        .from('profiles')
        .select('overlay')
        .gte('created_at', from)
        .lte('created_at', to);

      const overlayMix = overlayData?.reduce((acc: any[], d) => {
        const existing = acc.find(item => item.overlay === d.overlay);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ overlay: d.overlay || 'Unknown', count: 1 });
        }
        return acc;
      }, []) || [];

      // Assessments per day
      const daysDiff = Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)));
      const assessmentsPerDay = (totalAssessments || 0) / daysDiff;

      setKpiData({
        totalAssessments: totalAssessments || 0,
        completionRate: completionRate,
        highModerateConfidence: (highModerate / total) * 100,
        avgInconsistency: avgInconsistency || 0,
        avgFitGap: avgFitGap || 0,
        overlayMix,
        assessmentsPerDay
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  const fetchChartData = async () => {
    const { from, to } = filters.dateRange;

    try {
      // Completions over time
      const { data: completionsData } = await supabase
        .from('profiles')
        .select('created_at, overlay')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at');

      const completionsOverTime = completionsData?.reduce((acc: any[], d) => {
        const date = format(new Date(d.created_at), 'yyyy-MM-dd');
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []) || [];

      // Type distribution
      const { data: typeData } = await supabase
        .from('v_profiles_ext')
        .select('type_top')
        .gte('created_at', from)
        .lte('created_at', to);

      const typeDistribution = typeData?.reduce((acc: any[], d) => {
        const existing = acc.find(item => item.type === d.type_top);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ type: d.type_top || 'Unknown', count: 1 });
        }
        return acc;
      }, []) || [];

      // Function heatmap (example for Te, Ti, Fe, Fi, Ne, Ni, Se, Si)
      const functions = ['Te', 'Ti', 'Fe', 'Fi', 'Ne', 'Ni', 'Se', 'Si'];
      const functionHeatmap = [];

      for (const func of functions) {
        const { data: funcData } = await supabase
          .from('profiles')
          .select(`strengths->${func}`)
          .gte('created_at', from)
          .lte('created_at', to);

        const avgStrength = funcData?.reduce((sum, d) => {
          const fieldName = `strengths->${func}`;
          const value = parseFloat(d[fieldName as keyof typeof d] as string || '0');
          return sum + (isNaN(value) ? 0 : value);
        }, 0) / (funcData?.length || 1);

        functionHeatmap.push({ function: func, avgStrength: avgStrength || 0 });
      }

      setChartData({
        completionsOverTime,
        typeDistribution,
        functionHeatmap,
        dimensionalityDistribution: [], // Placeholder
        blocksMix: [], // Placeholder
        validityHistogram: [] // Placeholder
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const fetchSessionData = async () => {
    const { from, to } = filters.dateRange;

    try {
      const { data } = await supabase
        .from('v_sessions')
        .select(`
          session_id,
          user_id,
          started_at,
          duration_sec,
          completed
        `)
        .gte('started_at', from)
        .lte('started_at', to)
        .order('started_at', { ascending: false });

      const sessionsWithProfiles = await Promise.all(
        (data || []).map(async (session) => {
          if (session.completed) {
            const { data: profile } = await supabase
              .from('v_profiles_ext')
              .select('type_code, overlay, confidence, inconsistency, sd_index')
              .eq('session_id', session.session_id)
              .single();

            return {
              sessionId: session.session_id,
              userId: session.user_id,
              startedAt: session.started_at,
              duration: session.duration_sec || 0,
              typeCode: profile?.type_code,
              overlay: profile?.overlay,
              confidence: profile?.confidence,
              inconsistency: profile?.inconsistency,
              sdIndex: profile?.sd_index
            };
          }

          return {
            sessionId: session.session_id,
            userId: session.user_id,
            startedAt: session.started_at,
            duration: session.duration_sec || 0
          };
        })
      );

      setSessionData(sessionsWithProfiles);
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const fetchRetestData = async () => {
    try {
      const { data } = await supabase
        .from('v_retest_deltas')
        .select('*')
        .order('t2', { ascending: false });

      const retests: RetestData[] = (data || []).map(d => ({
        userId: d.user_id,
        sessionId1: d.session_id_1,
        sessionId2: d.session_id_2,
        daysBetween: d.days_between,
        strengthDelta: d.strength_delta,
        dimChanges: d.dim_change_ct,
        typeChanged: d.type_changed
      }));

      setRetestData(retests);
    } catch (error) {
      console.error('Error fetching retest data:', error);
    }
  };

  const checkAlerts = () => {
    const newAlerts: string[] = [];

    if (kpiData) {
      if (kpiData.avgInconsistency > 1.2) {
        newAlerts.push('High inconsistency detected (>1.2)');
      }
      if (kpiData.highModerateConfidence < 85) {
        newAlerts.push('Low confidence rate (<85%)');
      }
      if (kpiData.completionRate < 0.7) {
        newAlerts.push('Low completion rate (<70%)');
      }
    }

    if (retestData.length > 0) {
      const typeFlipRate = retestData.filter(r => r.typeChanged).length / retestData.length;
      if (typeFlipRate > 0.25) {
        newAlerts.push('High type-flip rate in retests (>25%)');
      }
    }

    setAlerts(newAlerts);
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchKPIData(),
      fetchChartData(),
      fetchSessionData(),
      fetchRetestData()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [filters]);

  useEffect(() => {
    checkAlerts();
  }, [kpiData, retestData]);

  // Real-time updates
  useEffect(() => {
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    const responsesChannel = supabase
      .channel('responses-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assessment_responses'
        },
        () => {
          fetchKPIData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, []);

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