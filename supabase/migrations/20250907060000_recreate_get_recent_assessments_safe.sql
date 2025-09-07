-- up
DROP FUNCTION IF EXISTS public.get_recent_assessments_safe();

CREATE FUNCTION public.get_recent_assessments_safe()
RETURNS TABLE (
  created_at timestamptz,
  type_display text,
  country_display text,
  fit_score numeric,
  session_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $func$
BEGIN
  RETURN QUERY
  SELECT 
    p.created_at,
    CONCAT(LEFT(p.type_code, 3), COALESCE(p.overlay, '')) AS type_display,
    COALESCE(
      (SELECT ar.answer_value
       FROM assessment_responses ar
       JOIN scoring_config sc ON sc.key = 'dashboard_country_qid'
       WHERE ar.session_id = p.session_id
         AND ar.question_id = (sc.value->>'id')::int
       LIMIT 1),
      'Unknown'
    ) AS country_display,
    CASE
      WHEN p.top_types IS NOT NULL AND jsonb_array_length(p.top_types) > 0
        THEN COALESCE((p.top_types->0->>'fit_abs')::numeric, 0)
      ELSE 0
    END AS fit_score,
    p.session_id
  FROM profiles p
  WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY p.created_at DESC
  LIMIT 50;
END;
$func$;

-- harden the search_path for SECURITY DEFINER
ALTER FUNCTION public.get_recent_assessments_safe() SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.get_recent_assessments_safe() TO anon, authenticated;

-- down
DROP FUNCTION IF EXISTS public.get_recent_assessments_safe();
