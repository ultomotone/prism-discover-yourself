import { SupabaseClient } from '@supabase/supabase-js';
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

export async function fetchEvidenceKpis(sb: SupabaseClient) {
  const { data, error } = await sb.rpc('get_evidence_kpis');
  if (error) throw error;
  return data;
}

export async function fetchLatestDashboardStats(sb: SupabaseClient) {
  const { data, error } = await sb
    .from('dashboard_statistics_latest')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}
