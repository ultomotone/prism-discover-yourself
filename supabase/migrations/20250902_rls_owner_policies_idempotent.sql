ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "sessions_owner_select"
  ON public.assessment_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "sessions_owner_iud"
  ON public.assessment_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "responses_owner_all"
  ON public.assessment_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.assessment_sessions s
      WHERE s.id = assessment_responses.session_id
        AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assessment_sessions s
      WHERE s.id = assessment_responses.session_id
        AND s.user_id = auth.uid()
    )
  );

ALTER TABLE public.assessment_responses
  DROP CONSTRAINT IF EXISTS assessment_responses_session_id_fkey,
  ADD CONSTRAINT assessment_responses_session_id_fkey
    FOREIGN KEY (session_id)
    REFERENCES public.assessment_sessions(id)
    ON DELETE CASCADE;
