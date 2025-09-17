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
  const { data, error } = await supabase
    .rpc("get_dashboard_results_by_email", { p_email: email });
  
  if (error) {
    console.error("Error fetching dashboard results:", error);
    throw error;
  }
  
  return data as DashboardResult[] || [];
}