-- Add indexes and fix security issues for scoring tables

-- Add performance indexes
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

-- Enable RLS on new scoring tables
ALTER TABLE public.scoring_results_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_state ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for scoring_results_types
CREATE POLICY "Service role can manage scoring_results_types" 
  ON public.scoring_results_types
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their scoring_results_types" 
  ON public.scoring_results_types
  FOR SELECT 
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions s
      WHERE s.id = scoring_results_types.session_id
      AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

-- Add RLS policies for scoring_results_functions
CREATE POLICY "Service role can manage scoring_results_functions" 
  ON public.scoring_results_functions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their scoring_results_functions" 
  ON public.scoring_results_functions
  FOR SELECT 
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions s
      WHERE s.id = scoring_results_functions.session_id
      AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

-- Add RLS policies for scoring_results_state
CREATE POLICY "Service role can manage scoring_results_state" 
  ON public.scoring_results_state
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their scoring_results_state" 
  ON public.scoring_results_state
  FOR SELECT 
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions s
      WHERE s.id = scoring_results_state.session_id
      AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

-- Grant access to views for authenticated and anonymous users
GRANT SELECT ON public.v_results_types TO authenticated, anon;
GRANT SELECT ON public.v_results_functions TO authenticated, anon;
GRANT SELECT ON public.v_results_state TO authenticated, anon;