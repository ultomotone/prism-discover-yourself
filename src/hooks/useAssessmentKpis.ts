import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export interface KpiFilters {
  startDate?: Date;
  endDate?: Date;
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

export const useAssessmentKpis = (filters: KpiFilters = {}) => {
  const { startDate = subDays(new Date(), 7), endDate = new Date() } = filters;

  return useQuery({
    queryKey: ["assessment-kpis", format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async () => {
      // Call consolidated RPC for all KPIs
      const { data, error } = await supabase.rpc("get_assessment_kpis", {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      });

      if (error) throw error;
      if (!data) throw new Error("No data returned from KPI function");

      const response = data as KpiRpcResponse;
      const sessions = (response.sessions || []) as unknown as SessionMetricsKpi[];
      const feedback = (response.feedback || []) as unknown as FeedbackMetricsKpi[];
      const scoring = (response.scoring || []) as unknown as ScoringMetricsKpi[];
      const itemFlags = (response.itemFlags || []) as unknown as ItemFlagMetricsKpi[];
      const alerts = (response.alerts || []) as string[];
      
      // New comprehensive metrics
      const engagement = (response.engagement || []) as unknown as EngagementMetrics[];
      const reliability = (response.reliability || []) as unknown as ReliabilityMetrics[];
      const userExperience = (response.userExperience || []) as unknown as UserExperienceMetrics[];
      const constructCoverage = response.constructCoverage as any;
      const fairness = response.fairness as any;
      const calibration = response.calibration as any;
      const classificationStability = response.classificationStability as any;
      const business = response.business as any;

      // Calculate aggregate metrics for header
      const totalStarted = sessions.reduce((sum, d) => sum + (d.sessions_started || 0), 0);
      const totalCompleted = sessions.reduce((sum, d) => sum + (d.sessions_completed || 0), 0);
      const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

      const avgTopGap = scoring.length > 0
        ? scoring.reduce((sum, d) => sum + (d.avg_top_gap || 0), 0) / scoring.length
        : 0;
      
      const avgConfidence = scoring.length > 0
        ? scoring.reduce((sum, d) => sum + (d.avg_conf_cal || 0), 0) / scoring.length
        : 0;

      const avgNPS = feedback.length > 0
        ? feedback.reduce((sum, d) => sum + (d.avg_nps || 0), 0) / feedback.length
        : 0;
      
      const avgClarity = feedback.length > 0
        ? feedback.reduce((sum, d) => sum + (d.avg_clarity || 0), 0) / feedback.length
        : 0;
        
      // New metric aggregations
      const avgDropOffRate = engagement.length > 0
        ? (engagement.reduce((sum, d) => sum + (d.drop_off_rate || 0), 0) / engagement.length) * 100
        : 0;
        
      const avgEngagementRating = userExperience.length > 0
        ? userExperience.reduce((sum, d) => sum + (d.engagement_rating || 0), 0) / userExperience.length
        : 0;

      return {
        sessions,
        feedback,
        scoring,
        itemFlags,
        alerts,
        engagement,
        reliability,
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
          avgTopGap,
          avgConfidence,
          avgNPS,
          avgClarity,
          avgDropOffRate,
          avgEngagementRating,
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
};
