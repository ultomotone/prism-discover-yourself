import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export type LiveRow = {
  created_at: string;
  session_id: string;
  primary_type: string | null;
  overlay_label: string | null;
  fit_score: number | null;
};

export type DashboardStatsRow = Database['public']['Tables']['dashboard_statistics']['Row'];
export type EvidenceKpisRow = Record<string, unknown>;

export async function fetchLiveAssessments(): Promise<LiveRow[]> {
  const { data, error } = await supabase.rpc<LiveRow>('get_live_assessments');
  if (error) throw error;
  return (data ?? []) as LiveRow[];
}

export async function fetchDashboardStats(
  client: SupabaseClient,
): Promise<DashboardStatsRow | null> {
  await client.rpc('update_dashboard_statistics').catch(() => undefined);
  const { data, error } = await client
    .from('dashboard_statistics')
    .select('*')
    .order('stat_date', { ascending: false })
    .limit(1)
    .maybeSingle<DashboardStatsRow>();
  if (error) throw error;
  return data ?? null;
}

export async function fetchEvidenceKpis(
  client: SupabaseClient,
): Promise<EvidenceKpisRow> {
  const { data, error } = await client
    .from('evidence_kpis')
    .select('*')
    .single<EvidenceKpisRow>();
  if (error) throw error;
  return data;
}
