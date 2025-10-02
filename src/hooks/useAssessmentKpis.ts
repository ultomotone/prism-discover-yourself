import { useQuery } from "@tanstack/react-query";
import { invokeEdge } from "@/lib/edge-functions";
import { subDays, format } from "date-fns";

export interface KpiFilters {
  startDate?: Date;
  endDate?: Date;
  period?: "all" | "7" | "30" | "60" | "90" | "365";
  resultsVersion?: string;
}

interface KpiRpcResponse {
  sessions: unknown[];
  itemFlags: unknown[];
  feedback: unknown[];
  scoring: unknown[];
  alerts: string[];
  
  // New comprehensive KPIs
  engagement: unknown[];
  itemFlow: unknown[];
  itemClarity: unknown[];
  responseProcess: unknown[];
  reliability: unknown[];
  retest: unknown[];
  cfa: unknown[];
  constructCoverage: unknown;
  fairness: unknown;
  calibration: unknown;
  classificationStability: unknown;
  confidenceSpread: unknown;
  userExperience: unknown[];
  business: unknown;
  followup: unknown;
  behavioralImpact: unknown;
  trajectoryAlignment: unknown;
}

export interface SessionMetricsKpi {
  day: string;
  sessions_started: number;
  sessions_completed: number;
  avg_completion_minutes: number | null;
}

export interface ItemFlagMetricsKpi {
  question_id: number;
  section: string | null;
  flags: number;
  answered: number;
  flag_rate: number | null;
}

export interface FeedbackMetricsKpi {
  day: string;
  avg_clarity: number | null;
  avg_accuracy: number | null;
  avg_engagement: number | null;
  avg_focus: number | null;
  avg_nps: number | null;
  feedback_count: number;
  pct_actionable: number | null;
  pct_reported_unclear: number | null;
}

export interface ScoringMetricsKpi {
  day: string;
  avg_top_gap: number | null;
  avg_conf_cal: number | null;
  invalid_ct: number;
  total_profiles: number;
}

export interface EngagementMetrics {
  day: string;
  sessions_started: number;
  sessions_completed: number;
  drop_off_rate: number | null;
  avg_completion_sec: number | null;
  completion_time_sd_sec: number | null;
}

export interface ReliabilityMetrics {
  scale_id: string;
  cronbach_alpha: number | null;
  split_half_corr: number | null;
  mcdonald_omega: number | null;
}

export interface UserExperienceMetrics {
  day: string;
  engagement_rating: number | null;
  actionable_insights_pct: number | null;
  accuracy_perception: number | null;
}

export interface RetestMetrics {
  scale_code: string;
  results_version: string;
  n_pairs: number;
  r_mean: number | null;
  median_days_between: number | null;
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

      const data = await response.json();
      
      // Map new structure to expected format
      const engagement = (data.engagement || []) as unknown as EngagementMetrics[];
      const reliability = (data.reliability || []) as unknown as ReliabilityMetrics[];
      const retest = (data.retest || []) as unknown as RetestMetrics[];
      const constructCoverage = data.coverage?.[0] || {};

      const response_mapped = {
        sessions: [],
        itemFlags: [],
        feedback: [],
        scoring: [],
        alerts: [],
        engagement,
        itemFlow: [],
        itemClarity: [],
        responseProcess: [],
        reliability,
        retest,
        cfa: [],
        constructCoverage,
        fairness: data.fairness || {},
        calibration: data.calibration || {},
        classificationStability: data.classificationStability || {},
        confidenceSpread: {},
        userExperience: [],
        business: data.business || {},
        followup: {},
        behavioralImpact: {},
        trajectoryAlignment: {},
      } as KpiRpcResponse;
      const sessions = (response_mapped.sessions || []) as unknown as SessionMetricsKpi[];
      const feedback = (response_mapped.feedback || []) as unknown as FeedbackMetricsKpi[];
      const scoring = (response_mapped.scoring || []) as unknown as ScoringMetricsKpi[];
      const itemFlags = (response_mapped.itemFlags || []) as unknown as ItemFlagMetricsKpi[];
      const alerts = (response_mapped.alerts || []) as string[];
      
      const userExperience = (response_mapped.userExperience || []) as unknown as UserExperienceMetrics[];
      const fairness = response_mapped.fairness as any;
      const calibration = response_mapped.calibration as any;
      const classificationStability = response_mapped.classificationStability as any;
      const business = response_mapped.business as any;

      // Calculate aggregate metrics from engagement data
      const totalStarted = engagement.reduce((sum, d) => sum + (d.sessions_started || 0), 0);
      const totalCompleted = engagement.reduce((sum, d) => sum + (d.sessions_completed || 0), 0);
      const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;
      
      const avgDropOffRate = engagement.length > 0
        ? (engagement.reduce((sum, d) => sum + ((d.drop_off_rate || 0) * 100), 0) / engagement.length)
        : 0;
      
      const medianCompletionTime = engagement.length > 0 && engagement.some(d => d.avg_completion_sec)
        ? engagement
            .filter(d => d.avg_completion_sec)
            .sort((a, b) => (a.avg_completion_sec || 0) - (b.avg_completion_sec || 0))
            [Math.floor(engagement.filter(d => d.avg_completion_sec).length / 2)]
            ?.avg_completion_sec || 0
        : 0;

      return {
        sessions,
        feedback,
        scoring,
        itemFlags,
        alerts,
        engagement,
        reliability,
        retest,
        userExperience,
        constructCoverage,
        fairness,
        calibration,
        classificationStability,
        business,
        summary: {
          totalStarted,
          totalCompleted,
          completionRate,
          avgTopGap: 0,
          avgConfidence: 0,
          avgNPS: 0,
          avgClarity: 0,
          avgDropOffRate,
          avgEngagementRating: 0,
          medianCompletionTime,
          constructCoverageIndex: constructCoverage?.construct_coverage_index || 0,
          difFlagRate: (fairness?.dif_flag_rate || 0) * 100,
          calibrationError: calibration?.ece || 0,
          classificationStabilityRate: (classificationStability?.classification_stability || 0) * 100,
          freeToPaidRate: (business?.free_to_paid_rate || 0) * 100,
        },
      };
    },
    staleTime: 1000 * 60, // 1 minute (MVs refresh every 10 min)
  });

  return {
    ...query,
    refetch: query.refetch,
  };
};
