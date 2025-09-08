import { supabase } from '@/lib/supabase/client';

export type LiveRow = {
  created_at: string;
  session_id: string;
  primary_type: string | null;
  overlay_label: string | null;
  fit_score: number | null;
};

export async function fetchLiveAssessments(): Promise<LiveRow[]> {
  const { data, error } = await supabase.rpc<LiveRow>('get_live_assessments');
  if (error) throw error;
  return (data ?? []) as LiveRow[];
}
