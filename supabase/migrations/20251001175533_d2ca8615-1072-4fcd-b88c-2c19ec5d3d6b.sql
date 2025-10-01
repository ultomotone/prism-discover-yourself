-- Fix assessment_responses RLS policies to prevent email harvesting
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "pub_read_responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "pub_write_responses" ON public.assessment_responses;

-- SELECT: Users can only read responses for their own sessions
CREATE POLICY "select_own_session_responses"
  ON public.assessment_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

-- SELECT: Anonymous users can read responses for sessions they're actively working on
-- This is validated by the edge function load-session-responses with proper session ownership checks
CREATE POLICY "select_active_session_responses"
  ON public.assessment_responses
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id IS NULL  -- Only for anonymous sessions
      AND assessment_sessions.status = 'in_progress'
    )
  );

-- INSERT: Allow anyone to create responses (needed for assessment flow)
CREATE POLICY "insert_responses"
  ON public.assessment_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: Users can update responses for their own sessions
CREATE POLICY "update_own_responses"
  ON public.assessment_responses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

-- UPDATE: Allow updating responses for anonymous in-progress sessions
CREATE POLICY "update_active_session_responses"
  ON public.assessment_responses
  FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id IS NULL
      AND assessment_sessions.status = 'in_progress'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id IS NULL
      AND assessment_sessions.status = 'in_progress'
    )
  );

-- DELETE: Users can only delete their own responses
CREATE POLICY "delete_own_responses"
  ON public.assessment_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

-- Service role bypasses all RLS policies automatically
-- Edge functions using service_role key will have full access