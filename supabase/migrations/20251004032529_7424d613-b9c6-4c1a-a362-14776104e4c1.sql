-- Create RPC function to get user sessions with survey status
CREATE OR REPLACE FUNCTION get_user_sessions_with_survey_status(p_user_id uuid)
RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sessions jsonb;
BEGIN
  -- Check if the user is requesting their own sessions
  IF p_user_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'error', 'Access denied - can only view your own sessions',
      'code', 'ACCESS_DENIED'
    );
  END IF;

  -- Fetch sessions with associated profiles, scoring results, AND survey status
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'status', s.status,
      'started_at', s.started_at,
      'completed_at', s.completed_at,
      'completed_questions', s.completed_questions,
      'total_questions', s.total_questions,
      'profile', CASE 
        WHEN p.session_id IS NOT NULL THEN 
          jsonb_build_object(
            'type_code', COALESCE(sr.type_code, p.type_code),
            'confidence', COALESCE(sr.confidence, p.confidence),
            'fit_band', p.fit_band,
            'overlay', p.overlay,
            'computed_at', COALESCE(sr.computed_at, p.computed_at)
          )
        WHEN sr.session_id IS NOT NULL THEN
          jsonb_build_object(
            'type_code', sr.type_code,
            'confidence', sr.confidence,
            'fit_band', 'High',
            'overlay', null,
            'computed_at', sr.computed_at
          )
        ELSE null
      END,
      'survey_completed', COALESCE(pss.completed_at IS NOT NULL, false),
      'survey_session_id', pss.id
    ) ORDER BY s.started_at DESC
  ) INTO v_sessions
  FROM public.assessment_sessions s
  LEFT JOIN public.profiles p ON p.session_id = s.id
  LEFT JOIN public.scoring_results sr ON sr.session_id = s.id
  LEFT JOIN public.post_survey_sessions pss ON pss.assessment_session_id = s.id
  WHERE s.user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'sessions', COALESCE(v_sessions, '[]'::jsonb)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'code', 'INTERNAL_ERROR'
    );
END;
$$;

-- Add RLS policy for post_survey_sessions so users can see their own survey status
CREATE POLICY "Users view own session survey status"
ON post_survey_sessions FOR SELECT
USING (
  user_id = auth.uid() OR
  assessment_session_id IN (
    SELECT id FROM assessment_sessions WHERE user_id = auth.uid()
  )
);