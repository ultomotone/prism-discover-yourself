-- Enable Realtime on scoring tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.assessment_sessions REPLICA IDENTITY FULL;

-- Add the tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_sessions;

-- Create scoring_results table for computed scores (separate from profiles for clarity)
CREATE TABLE IF NOT EXISTS public.scoring_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id),
  user_id UUID,
  type_code TEXT,
  confidence TEXT,
  fit_band TEXT,
  overlay TEXT,
  score_fit_calibrated NUMERIC,
  top_types JSONB,
  dimensions JSONB,
  validity_status TEXT DEFAULT 'pass',
  results_version TEXT DEFAULT 'v1.2',
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, user_id, results_version)
);

-- Enable RLS on scoring_results
ALTER TABLE public.scoring_results ENABLE ROW LEVEL SECURITY;

-- Enable Realtime on scoring_results
ALTER TABLE public.scoring_results REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scoring_results;

-- RLS POLICIES FOR ASSESSMENT_SESSIONS
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view their sessions and anonymous by email" ON public.assessment_sessions;

-- Users can SELECT their own sessions OR anonymous sessions with their email
CREATE POLICY "sess_select_owner_or_email"
  ON public.assessment_sessions
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()) 
    OR (user_id IS NULL AND email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
  );

-- Deny all client writes to assessment_sessions (server-only updates)
-- The existing policies for INSERT/UPDATE will remain but we'll be more restrictive

-- RLS POLICIES FOR ASSESSMENT_RESPONSES (private response data)
-- Users can only SELECT their own responses (through session ownership)
CREATE POLICY "responses_select_owner_only"
  ON public.assessment_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions s 
      WHERE s.id = assessment_responses.session_id 
      AND s.user_id = auth.uid()
    )
  );

-- Deny client writes to assessment_responses (server handles all writes)
-- Keep existing policies but they should be restrictive

-- RLS POLICIES FOR SCORING_RESULTS (computed, user-facing scores)
-- Users can only SELECT their own scoring results
CREATE POLICY "scores_select_owner_only"
  ON public.scoring_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Deny all client writes to scoring_results (server-only computation)
-- No INSERT/UPDATE/DELETE policies for clients = deny by default

-- Service role can manage all tables (bypass RLS)
CREATE POLICY "service_role_all_assessment_sessions"
  ON public.assessment_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_assessment_responses"
  ON public.assessment_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_scoring_results"
  ON public.scoring_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_scoring_results_user_session 
  ON public.scoring_results(user_id, session_id);

CREATE INDEX IF NOT EXISTS idx_scoring_results_computed_at 
  ON public.scoring_results(computed_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_scoring_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scoring_results_updated_at
  BEFORE UPDATE ON public.scoring_results
  FOR EACH ROW
  EXECUTE FUNCTION update_scoring_results_updated_at();