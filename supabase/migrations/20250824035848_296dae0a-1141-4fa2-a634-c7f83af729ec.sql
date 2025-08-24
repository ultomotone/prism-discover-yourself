DO $$
BEGIN
  CREATE POLICY "Allow update for session owner or anonymous"
  ON public.assessment_responses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions s
      WHERE s.id = assessment_responses.session_id
        AND (
          (s.user_id IS NOT NULL AND s.user_id = auth.uid())
          OR (s.user_id IS NULL)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions s
      WHERE s.id = assessment_responses.session_id
        AND (
          (s.user_id IS NOT NULL AND s.user_id = auth.uid())
          OR (s.user_id IS NULL)
        )
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;