-- Create the missing get_user_assessment_attempts RPC function
CREATE OR REPLACE FUNCTION public.get_user_assessment_attempts(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = 'public'
AS $$
  SELECT public.get_user_assessment_scores(p_user_id)::jsonb;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_assessment_attempts(uuid) TO anon, authenticated;

-- Force PostgREST to reload the schema so the RPC is available immediately
SELECT pg_notify('pgrst', 'reload schema');

-- Ensure row level security is enforced on critical tables
ALTER TABLE public.scoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
