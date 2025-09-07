import { supabase } from '@/lib/supabase/client';

export type RecentAssessment = {
  created_at: string;
  type_prefix: string;
  overlay: string | null;
  country_display: string;
  time_period: 'Today' | 'This week' | 'Earlier';
  fit_indicator: 'Strong' | 'Moderate' | 'Developing' | 'Processing';
};

export async function fetchRecentAssessmentsSafe() {
  const { data, error } = await supabase.rpc('get_recent_assessments_safe');
  if (error) throw error;
  return data as RecentAssessment[];
}
