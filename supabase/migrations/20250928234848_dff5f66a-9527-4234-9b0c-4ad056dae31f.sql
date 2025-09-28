-- Create missing functions and table that the frontend expects

-- Create scoring_results table to replace the old results tables
CREATE TABLE IF NOT EXISTS public.scoring_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  user_id UUID,
  result_data JSONB NOT NULL,
  results_version TEXT NOT NULL DEFAULT 'v1.2.1',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_scoring_results_user_id ON public.scoring_results(user_id);
CREATE INDEX IF NOT EXISTS idx_scoring_results_session_id ON public.scoring_results(session_id);
CREATE INDEX IF NOT EXISTS idx_scoring_results_computed_at ON public.scoring_results(computed_at DESC);

-- Enable RLS for scoring_results
ALTER TABLE public.scoring_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scoring_results
CREATE POLICY "Users can view their own scoring results" 
ON public.scoring_results FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scoring results" 
ON public.scoring_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scoring results" 
ON public.scoring_results FOR UPDATE 
USING (auth.uid() = user_id);

-- Add updated_at trigger for scoring_results
CREATE TRIGGER update_scoring_results_updated_at
  BEFORE UPDATE ON public.scoring_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create get_dashboard_results_by_email function
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
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    sr.session_id,
    sr.results_version,
    sr.computed_at,
    sr.result_data
  FROM public.scoring_results sr
  JOIN public.assessment_sessions s ON s.id = sr.session_id
  WHERE s.email = p_email
    AND s.user_id = auth.uid() -- Only return results for authenticated user
  ORDER BY sr.computed_at DESC
  LIMIT 50;
END;
$function$;

-- Create get_user_assessment_scores function  
CREATE OR REPLACE FUNCTION public.get_user_assessment_scores(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB := '{"assessments": []}';
  assessment_record RECORD;
BEGIN
  -- Check if user is requesting their own data
  IF p_user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  -- Build assessments array
  result := jsonb_build_object('assessments', 
    (SELECT jsonb_agg(
      jsonb_build_object(
        'session_id', s.id,
        'started_at', s.started_at,
        'completed_at', s.completed_at,
        'status', s.status,
        'type_code', p.type_code,
        'confidence', p.confidence,
        'overlay', p.overlay,
        'results_version', COALESCE(sr.results_version, p.results_version, 'v1.2.1'),
        'computed_at', COALESCE(sr.computed_at, p.computed_at)
      ) ORDER BY s.started_at DESC
    )
    FROM public.assessment_sessions s
    LEFT JOIN public.profiles p ON p.session_id = s.id  
    LEFT JOIN public.scoring_results sr ON sr.session_id = s.id
    WHERE s.user_id = p_user_id
    LIMIT 50)
  );

  RETURN result;
END;
$function$;