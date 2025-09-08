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

export async function fetchDashboardStats(supabase: any) {
  // optional warm
  await supabase.rpc('update_dashboard_statistics').catch(() => {});
  const { data, error } = await supabase
    .from('dashboard_statistics')
    .select('*')
    .order('stat_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function fetchEvidenceKpis(supabase: any) {
  const { data, error } = await supabase
    .from('evidence_kpis')
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
