import { useQuery } from "@tanstack/react-query";
import { invokeEdge } from "@/lib/edge-functions";

export interface KpiFilters {
  startDate?: Date;
  endDate?: Date;
  period?: "all" | "7" | "30" | "60" | "90" | "365";
  resultsVersion?: string;
}

export interface ItemFlagMetricsKpi {
  question_id: number;
  section: string | null;
  flags: number;
  answered: number;
  flag_rate: number | null;
}

export interface ItemFlagDetail {
  question_id: number;
  session_id: string;
  note: string;
  flag_type: string;
  created_at: string;
}

export interface EngagementMetrics {
  day: string;
  sessions_started: number;
  sessions_completed: number;
  completion_rate_pct: number;
  drop_off_rate_pct: number;
  median_completion_sec: number | null;
}

export interface SessionMetricsKpi extends EngagementMetrics {}

export interface CoverageMetrics {
  scale_id: string;
  scale_code: string;
  scale_name: string;
  keyed_items: number;
  total_items: number;
  coverage_pct: number;
}

export interface ReliabilityMetrics {
  scale_code: string;
  results_version: string;
  last_updated: string;
  n_total: number;
  alpha_mean: number | null;
  omega_mean: number | null;
  sem_mean: number | null;
}

export interface RetestMetrics {
  scale_code: string;
  results_version: string;
  n_pairs: number;
  r_mean: number | null;
}

export interface SplitHalfMetrics {
  scale_code: string;
  split_half_sb: number | null;
  split_half_n: number;
}

export interface ItemDiscriminationMetrics {
  scale_code: string;
  question_id: number;
  r_it: number | null;
  n_used: number;
}

export interface CFAFitMetrics {
  model_name: string;
  cfi: number | null;
  tli: number | null;
  rmsea: number | null;
  srmr: number | null;
  n: number;
}

export interface MeasurementInvarianceMetrics {
  delta_cfi: number | null;
  model_comparison: string | null;
  n: number;
}

export interface LiveToday {
  sessions_started: number;
  sessions_completed: number;
  completion_rate_pct: number;
  drop_off_rate_pct: number;
  median_completion_sec: number | null;
}

export interface MVAge {
  view_name: string;
  refreshed_at: string;
}

interface KpiRpcResponse {
  engagement?: EngagementMetrics[];
  live?: LiveToday;
  mv_ages?: MVAge[];
  coverage?: CoverageMetrics[];
  reliability?: ReliabilityMetrics[];
  retest?: RetestMetrics[];
  fairness?: {
    flagged_items: number;
    total_items: number;
    dif_flag_rate_pct: number | null;
  };
  calibration?: {
    results_version: string;
    ece: number | null;
    brier: number | null;
    bins: any;
  };
  classificationStability?: {
    n_pairs: number;
    stability_rate: number | null;
  };
  splitHalf?: SplitHalfMetrics[];
  itemDiscrimination?: ItemDiscriminationMetrics[];
  cfaFit?: CFAFitMetrics[];
  measurementInvariance?: MeasurementInvarianceMetrics;
  itemFlags?: ItemFlagMetricsKpi[];
  itemFlagDetails?: ItemFlagDetail[];
  business?: {
    total_completions: number;
    unique_users: number;
  };
}

export const useAssessmentKpis = (filters: KpiFilters = {}) => {
  const { 
    period = "all", 
    resultsVersion = "v1.2.1" 
  } = filters;

  const query = useQuery({
    queryKey: ["assessment-kpis", period, resultsVersion],
    queryFn: async () => {
      // Call analytics-get edge function with period filter
      const response = await invokeEdge(
        `analytics-get?period=${period}&ver=${resultsVersion}`
      );

      if (!response.ok) {
        throw new Error(`Analytics fetch failed: ${response.statusText}`);
      }

      const result: KpiRpcResponse = await response.json();
      
      // Calculate live status based on MV age
      const now = new Date();
      const engagementAge = result.mv_ages?.find(m => m.view_name === 'mv_kpi_engagement');
      const engagementStale = engagementAge 
        ? (now.getTime() - new Date(engagementAge.refreshed_at).getTime()) / 1000 > 90
        : true;
      
      // Map response to structured data
      const mappedData = {
        engagement: result.engagement || [],
        live: result.live || { sessions_started: 0, sessions_completed: 0, completion_rate_pct: 0, drop_off_rate_pct: 0, median_completion_sec: null },
        mv_ages: result.mv_ages || [],
        isLive: !engagementStale,
        coverage: result.coverage || [],
        reliability: result.reliability || [],
        retest: result.retest || [],
        fairness: result.fairness || { flagged_items: 0, total_items: 0, dif_flag_rate_pct: null },
        calibration: result.calibration || { results_version: resultsVersion, ece: null, brier: null, bins: null },
        classificationStability: result.classificationStability || { n_pairs: 0, stability_rate: null },
        splitHalf: result.splitHalf || [],
        itemDiscrimination: result.itemDiscrimination || [],
        cfaFit: result.cfaFit || [],
        measurementInvariance: result.measurementInvariance || { delta_cfi: null, model_comparison: null, n: 0 },
        itemFlags: result.itemFlags || [],
        itemFlagDetails: result.itemFlagDetails || [],
        business: result.business || { total_completions: 0, unique_users: 0 }
      };

      // Calculate summary metrics (PERIOD TOTALS, not averages)
      const engagement = mappedData.engagement || [];
      const totalSessionsStarted = engagement.reduce((sum, day) => sum + (day.sessions_started || 0), 0);
      const totalSessionsCompleted = engagement.reduce((sum, day) => sum + (day.sessions_completed || 0), 0);
      
      // Period completion rate = 100 * Σcompleted / Σstarted
      const periodCompletionRate = totalSessionsStarted > 0 
        ? (100 * totalSessionsCompleted) / totalSessionsStarted 
        : 0;
      
      // Period drop-off rate = 100 - completion rate
      const periodDropOffRate = Math.max(0, 100 - periodCompletionRate);
      
      // Median completion time: median of all daily medians (excluding nulls)
      const validMedians = engagement
        .map(d => d.median_completion_sec)
        .filter((m): m is number => m !== null && m !== undefined);
      const medianCompletionTime = validMedians.length > 0
        ? validMedians.sort((a, b) => a - b)[Math.floor(validMedians.length / 2)] / 60
        : null;
      
      // Construct coverage average
      const coverageMetrics = mappedData.coverage || [];
      const constructCoverageAvg = coverageMetrics.length > 0
        ? coverageMetrics.reduce((sum, scale) => sum + (scale.coverage_pct || 0), 0) / coverageMetrics.length
        : 0;
      
      // Classification stability from retest data
      const retestMetrics = mappedData.retest || [];
      const classificationStabilityRate = retestMetrics.length > 0
        ? retestMetrics.reduce((sum, scale) => sum + ((scale.r_mean || 0) * 100), 0) / retestMetrics.length
        : 0;

      return {
        ...mappedData,
        summary: {
          totalSessionsStarted,
          totalSessionsCompleted,
          periodCompletionRate,
          periodDropOffRate,
          medianCompletionTime,
          constructCoverageAvg,
          classificationStabilityRate
        }
      };
    },
    staleTime: 1000 * 60, // 1 minute (MVs refresh periodically)
  });

  return {
    ...query,
    refetch: query.refetch,
  };
};
