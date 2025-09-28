-- Refresh schema cache by ensuring functions are properly registered
-- Check if functions exist and recreate them if needed

-- Force schema refresh for get_dashboard_results_by_email
DROP FUNCTION IF EXISTS public.get_dashboard_results_by_email(TEXT);
CREATE OR REPLACE FUNCTION public.get_dashboard_results_by_email(p_email TEXT)
RETURNS TABLE(
  session_id UUID,
  results_version TEXT,
  computed_at TIMESTAMPTZ,
  result_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return results from profiles table since scoring_results might not have data yet
  RETURN QUERY
  SELECT 
    p.session_id,
    COALESCE(p.results_version, 'v1.2.1') as results_version,
    p.computed_at,
    p.payload as result_data
  FROM public.profiles p
  JOIN public.assessment_sessions s ON s.id = p.session_id
  WHERE s.email = p_email
    AND s.user_id = auth.uid() -- Only return results for authenticated user
  ORDER BY p.computed_at DESC
  LIMIT 50;
END;
$$;

-- Force schema refresh for get_user_assessment_scores  
DROP FUNCTION IF EXISTS public.get_user_assessment_scores(UUID);
CREATE OR REPLACE FUNCTION public.get_user_assessment_scores(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB := '{"assessments": []}';
BEGIN
  -- Check if user is requesting their own data
  IF p_user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  -- Build assessments array from existing data
  result := jsonb_build_object('assessments', 
    COALESCE((SELECT jsonb_agg(
      jsonb_build_object(
        'session_id', s.id,
        'started_at', s.started_at,
        'completed_at', s.completed_at,
        'status', s.status,
        'type_code', p.type_code,
        'confidence', p.confidence,
        'overlay', p.overlay,
        'results_version', COALESCE(p.results_version, 'v1.2.1'),
        'computed_at', p.computed_at
      ) ORDER BY s.started_at DESC
    )
    FROM public.assessment_sessions s
    LEFT JOIN public.profiles p ON p.session_id = s.id  
    WHERE s.user_id = p_user_id
    LIMIT 50), '[]'::jsonb)
  );

  RETURN result;
END;
$$;

-- Ensure scoring_results table exists with proper structure
CREATE TABLE IF NOT EXISTS public.scoring_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  user_id UUID,
  result_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_version TEXT NOT NULL DEFAULT 'v1.2.1',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_scoring_results_user_id ON public.scoring_results(user_id);
CREATE INDEX IF NOT EXISTS idx_scoring_results_session_id ON public.scoring_results(session_id);
CREATE INDEX IF NOT EXISTS idx_scoring_results_computed_at ON public.scoring_results(computed_at DESC);