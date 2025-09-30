import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export interface KpiFilters {
  startDate?: Date;
  endDate?: Date;
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

export const useAssessmentKpis = (filters: KpiFilters = {}) => {
  const { startDate = subDays(new Date(), 7), endDate = new Date() } = filters;

  return useQuery({
    queryKey: ["assessment-kpis", format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async () => {
      // Fetch session metrics
      const { data: sessionData, error: sessionError } = await supabase
        .from("mv_kpi_sessions")
        .select("*")
        .gte("day", format(startDate, "yyyy-MM-dd"))
        .lte("day", format(endDate, "yyyy-MM-dd"))
        .order("day", { ascending: true });

      if (sessionError) throw sessionError;

      // Fetch feedback metrics
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("mv_kpi_feedback")
        .select("*")
        .gte("day", format(startDate, "yyyy-MM-dd"))
        .lte("day", format(endDate, "yyyy-MM-dd"))
        .order("day", { ascending: true });

      if (feedbackError) throw feedbackError;

      // Fetch scoring metrics
      const { data: scoringData, error: scoringError } = await supabase
        .from("mv_kpi_scoring")
        .select("*")
        .gte("day", format(startDate, "yyyy-MM-dd"))
        .lte("day", format(endDate, "yyyy-MM-dd"))
        .order("day", { ascending: true });

      if (scoringError) throw scoringError;

      // Fetch item flag metrics (top 20 flagged items)
      const { data: itemData, error: itemError } = await supabase
        .from("mv_kpi_item_flags")
        .select("*")
        .order("flag_rate", { ascending: false, nullsFirst: false })
        .limit(20);

      if (itemError) throw itemError;

      // Calculate aggregate metrics for header
      const sessions = (sessionData || []) as unknown as SessionMetricsKpi[];
      const feedback = (feedbackData || []) as unknown as FeedbackMetricsKpi[];
      const scoring = (scoringData || []) as unknown as ScoringMetricsKpi[];
      const itemFlags = (itemData || []) as unknown as ItemFlagMetricsKpi[];

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

      return {
        sessions,
        feedback,
        scoring,
        itemFlags,
        summary: {
          totalStarted,
          totalCompleted,
          completionRate,
          avgTopGap,
          avgConfidence,
          avgNPS,
          avgClarity,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
