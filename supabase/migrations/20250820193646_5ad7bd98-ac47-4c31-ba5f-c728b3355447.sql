-- CRITICAL SECURITY FIX: Add RLS policy for anonymous dashboard access
-- This is the root cause of empty activity maps and uniform fits

-- Add policy to allow anonymous/public users to read profiles for dashboard analytics
CREATE POLICY "Allow anonymous dashboard access to profiles" 
ON public.profiles 
FOR SELECT 
TO public
USING (true);

-- Grant public access to the v_latest_assessments_v11 view
GRANT SELECT ON public.v_latest_assessments_v11 TO public;

-- Grant public access to related views used by dashboard
GRANT SELECT ON public.v_activity_country_30d TO public;
GRANT SELECT ON public.v_dashboard_stats TO public;

-- Add SECURITY DEFINER function to safely get country data for dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_country_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE(country_name TEXT, session_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(
      (SELECT ar.answer_value 
       FROM assessment_responses ar 
       JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
       WHERE ar.session_id = p.session_id 
       AND ar.question_id = (sc.value->>'id')::integer
       LIMIT 1), 
      'Unknown'
    ) as country_name,
    COUNT(*)::BIGINT as session_count
  FROM profiles p
  WHERE p.results_version = 'v1.1'
    AND p.created_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY country_name
  HAVING country_name != 'Unknown' AND country_name IS NOT NULL
  ORDER BY session_count DESC;
END;
$$;

-- Grant execute permission to public for dashboard function
GRANT EXECUTE ON FUNCTION public.get_dashboard_country_stats(INTEGER) TO public;