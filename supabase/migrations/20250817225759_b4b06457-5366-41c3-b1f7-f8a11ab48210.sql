-- Tighten RLS: remove public read access and restrict to owners

-- Sessions: replace public read with owner-only read for authenticated users
DROP POLICY IF EXISTS "Users can read assessment sessions" ON public.assessment_sessions;
CREATE POLICY "Only owner can read sessions"
ON public.assessment_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Responses: replace public read with owner-only read for authenticated users
DROP POLICY IF EXISTS "Users can read assessment responses" ON public.assessment_responses;
CREATE POLICY "Only owner can read responses"
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

-- Note: We are keeping INSERT open for anonymous usage so the current assessment flow continues to work without auth.
-- Once auth is added, we can further restrict INSERT/UPDATE policies to owners only.