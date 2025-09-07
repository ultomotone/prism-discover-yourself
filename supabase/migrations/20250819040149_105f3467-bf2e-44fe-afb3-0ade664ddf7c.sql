-- Update the secure function to include actual country and fit score data
DROP FUNCTION IF EXISTS public.get_recent_assessments_safe();
CREATE FUNCTION public.get_recent_assessments_safe()
RETURNS TABLE (
  created_at timestamp with time zone,
  type_display text,
  country_display text,
  fit_score numeric,
  session_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.created_at,
    CONCAT(LEFT(p.type_code, 3), COALESCE(p.overlay, '')) as type_display,
    COALESCE(
      (SELECT ar.answer_value 
       FROM assessment_responses ar 
       JOIN scoring_config sc ON sc.key = 'dashboard_country_qid'
       WHERE ar.session_id = p.session_id 
       AND ar.question_id = (sc.value->>'id')::integer
       LIMIT 1), 
      'Unknown'
    ) as country_display,
    -- Get fit score from top_types if available
    CASE 
      WHEN p.top_types IS NOT NULL AND jsonb_array_length(p.top_types) > 0 
      THEN COALESCE((p.top_types->0->>'fit_abs')::numeric, 0)
      ELSE 0
    END as fit_score,
    p.session_id
  FROM profiles p
  WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'  -- Only very recent assessments
  ORDER BY p.created_at DESC
  LIMIT 50;  -- Increased limit
END;
$$;
