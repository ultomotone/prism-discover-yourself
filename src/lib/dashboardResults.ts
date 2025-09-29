// Dashboard results data fetching
import { supabase } from "@/integrations/supabase/client";

export interface DashboardResult {
  session_id: string;
  type_code: string;
  conf_band: string;
  score_fit_calibrated: number;
  results_url: string;
  submitted_at: string;
}

export async function fetchDashboardResults(email: string): Promise<DashboardResult[]> {
  // First try the RPC function
  const { data: rpcData, error: rpcError } = await supabase
    .rpc("get_dashboard_results_by_email", { p_email: email });
  
  if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
    return rpcData as DashboardResult[];
  }
  
  // Fallback: get completed sessions and create basic results even without scoring data
  const { data: sessions, error: sessionsError } = await supabase
    .from('assessment_sessions')
    .select('id, email, completed_at, status')
    .eq('email', email)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });
    
  if (sessionsError || !sessions) {
    console.error("Error fetching sessions:", sessionsError);
    return [];
  }
  
  const results: DashboardResult[] = [];
  
  // For each completed session, try to get scoring results or create placeholder
  for (const session of sessions) {
    const sessionId = typeof session.id === 'string' ? session.id : '';
    const completedAt = typeof session.completed_at === 'string' ? session.completed_at : new Date().toISOString();
    
    const { data: scoringData, error: scoringError } = await supabase
      .from('scoring_results')
      .select('type_code, confidence, computed_at, scoring_version')
      .eq('session_id', session.id)
      .single();
      
    if (scoringData && scoringData.type_code) {
      // Has scoring results
      const confidence = typeof scoringData.confidence === 'number' ? scoringData.confidence : 0;
      const typeCode = typeof scoringData.type_code === 'string' ? scoringData.type_code : '';
      
      results.push({
        session_id: sessionId,
        type_code: typeCode,
        conf_band: confidence > 10 ? 'high' : confidence > 5 ? 'medium' : 'low',
        score_fit_calibrated: 0,
        results_url: `/results/${sessionId}`,
        submitted_at: completedAt
      });
    } else {
      // No scoring results yet, but show as available for scoring
      results.push({
        session_id: sessionId,
        type_code: 'Pending', // Indicate results need to be computed
        conf_band: 'pending',
        score_fit_calibrated: 0,
        results_url: `/results/${sessionId}`,
        submitted_at: completedAt
      });
    }
  }
  
  return results;
}