-- Enable Realtime on assessment_sessions (profiles already enabled)
ALTER TABLE public.assessment_sessions REPLICA IDENTITY FULL;

-- Check if assessment_sessions is already in publication, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'assessment_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_sessions;
  END IF;
END $$;

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
-- Drop existing conflicting policies to avoid conflicts
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

-- RLS POLICIES FOR ASSESSMENT_RESPONSES (private response data)
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow reading assessment responses" ON public.assessment_responses;

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

-- RLS POLICIES FOR SCORING_RESULTS (computed, user-facing scores)
-- Users can only SELECT their own scoring results
CREATE POLICY "scores_select_owner_only"
  ON public.scoring_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

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

-- Create indexes for performance
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

DROP TRIGGER IF EXISTS update_scoring_results_updated_at ON public.scoring_results;
CREATE TRIGGER update_scoring_results_updated_at
  BEFORE UPDATE ON public.scoring_results
  FOR EACH ROW
  EXECUTE FUNCTION update_scoring_results_updated_at();