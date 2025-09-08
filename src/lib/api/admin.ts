import { supabase } from '@/lib/supabase/client';

// ---- Live feed -------------------------------------------------------------

export type LiveRow = {
  created_at: string;
  session_id: string;
  primary_type: string | null;
  overlay_label: string | null;
  fit_score: number | null;
};

export async function fetchLiveAssessments(): Promise<LiveRow[]> {
  const { data, error } = await supabase.rpc('get_live_assessments');
  if (error) throw error;
  return (data ?? []) as LiveRow[];
}

// ---- Evidence KPIs ---------------------------------------------------------

export type EvidenceKpis = {
  id: number;
  updated_at: string | null;
  pairs_n: number | null;
  median_days_apart: number | null;
  type_stability_pct: number | null;
  r_overall: number | null;
  r_ti: number | null; r_te: number | null; r_fi: number | null; r_fe: number | null;
  r_ni: number | null; r_ne: number | null; r_si: number | null; r_se: number | null;
  mai_overall: number | null;
};

export async function fetchEvidenceKpis(): Promise<EvidenceKpis | null> {
  // Prefer RPC if you created `get_evidence_kpis()`
  const rpc = await supabase.rpc('get_evidence_kpis');
  if (!rpc.error) return rpc.data as EvidenceKpis | null;

  // Fallback: direct table read (id = 1 singleton)
  const { data, error } = await supabase
    .from('evidence_kpis')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data as EvidenceKpis | null;
}

// ---- Dashboard snapshot ----------------------------------------------------

export async function fetchDashboardSnapshot() {
  // Prefer view that always returns the latest snapshot
  const { data, error } = await supabase
    .from('dashboard_statistics_latest')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---- Manual refresh actions (buttons) --------------------------------------

export async function refreshDashboardStats() {
  // Try Edge Function wrapper first (if present)…
  const ef = await supabase.functions.invoke('refresh-dashboard', { body: {} });
  if (!ef.error) return ef.data ?? { ok: true };

  // …fallback to SQL RPC if you exposed it
  const rpc = await supabase.rpc('update_dashboard_statistics');
  if (rpc.error) throw rpc.error;
  return rpc.data;
}

export async function refreshEvidenceKpis() {
  // Call the SQL function you created: refresh_evidence_kpis()
  const { data, error } = await supabase.rpc('refresh_evidence_kpis');
  if (error) throw error;
  return data;
}
