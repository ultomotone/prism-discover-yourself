import type { SupabaseClient } from '@supabase/supabase-js'

export interface LiveAssessment {
  session_id: string
  created_at: string
  primary_type: string
  overlay_label: string
  fit_score: number | string
}

/**
 * Fetch the most recent assessment results.
 * Throws if the underlying RPC call fails.
 */
export async function fetchLiveAssessments(
  supabase: SupabaseClient
): Promise<LiveAssessment[]> {
  const { data, error } = await supabase.rpc('get_live_assessments')
  if (error) throw error
  return (data ?? []) as LiveAssessment[]
}
