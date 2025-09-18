-- Add indexes and fix security issues for scoring tables

-- Add performance indexes (these can be IF NOT EXISTS)
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

-- Enable RLS on new scoring tables (safe to run multiple times)
ALTER TABLE public.scoring_results_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_state ENABLE ROW LEVEL SECURITY;

-- Grant access to views for authenticated and anonymous users
GRANT SELECT ON public.v_results_types TO authenticated, anon;
GRANT SELECT ON public.v_results_functions TO authenticated, anon;
GRANT SELECT ON public.v_results_state TO authenticated, anon;