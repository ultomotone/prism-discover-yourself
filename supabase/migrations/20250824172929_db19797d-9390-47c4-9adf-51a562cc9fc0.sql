-- Create a safe function to get all profiles for dashboard with proper RLS bypass
CREATE OR REPLACE FUNCTION public.get_dashboard_profile_stats()
RETURNS TABLE(
  type_code text,
  overlay text,
  created_at timestamp with time zone,
  confidence text,
  fit_band text,
  country text,
  results_version text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.type_code,
    p.overlay,
    p.created_at,
    p.confidence,
    p.fit_band,
    COALESCE(
      (SELECT ar.answer_value 
       FROM assessment_responses ar 
       JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
       WHERE ar.session_id = p.session_id 
       AND ar.question_id = (sc.value->>'id')::integer
       LIMIT 1), 
      'Unknown'
    ) as country,
    COALESCE(p.results_version, p.version, 'unknown') as results_version
  FROM profiles p
  WHERE p.type_code IS NOT NULL
  ORDER BY p.created_at DESC;
END;
$$;