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

export type EvidenceKpis = {
  id: number;
  updated_at: string;
  pairs_n: number | null;
  median_days_apart: number | null;
  type_stability_pct: number | null;
  r_overall: number | null;
  r_ti: number | null; r_te: number | null; r_fi: number | null; r_fe: number | null;
  r_ni: number | null; r_ne: number | null; r_si: number | null; r_se: number | null;
  mai_overall: number | null;
};

export async function fetchEvidenceKpis() {
  const { data, error } = await supabase
    .from('evidence_kpis')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data as EvidenceKpis;
}

// Dashboard snapshot used by DashboardPreview
export async function fetchDashboardSnapshot(statDate?: string) {
  const q = supabase.from('dashboard_statistics').select('*');
  const { data, error } = statDate
    ? await q.eq('stat_date', statDate).maybeSingle()
    : await q.order('stat_date', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// Optional: trigger server-side refreshes from the UI buttons
export async function refreshDashboardStats() {
  // Edge Function wrapper that runs SELECT update_dashboard_statistics()
  const { data, error } = await supabase.functions.invoke('refresh-dashboard', {
    body: {},
  });
  if (error) throw error;
  return data;
}

export async function refreshEvidenceKpis() {
  // If you made an edge function; otherwise call SQL via RPC if you exposed one
  const { data, error } = await supabase.functions.invoke('refresh_evidence_kpis', {
    body: {},
  });
  if (error) throw error;
  return data;
}
