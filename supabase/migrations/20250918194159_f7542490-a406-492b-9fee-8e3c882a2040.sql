-- Add performance indexes for scoring tables
CREATE INDEX IF NOT EXISTS idx_scoring_results_types_session_version 
  ON public.scoring_results_types (session_id, results_version);
  
CREATE INDEX IF NOT EXISTS idx_scoring_results_functions_session_version 
  ON public.scoring_results_functions (session_id, results_version);
  
CREATE INDEX IF NOT EXISTS idx_scoring_results_state_session_version 
  ON public.scoring_results_state (session_id, results_version);

CREATE INDEX IF NOT EXISTS idx_scoring_results_types_share_desc 
  ON public.scoring_results_types (session_id, results_version, share DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_created_at 
  ON public.assessment_sessions (created_at);