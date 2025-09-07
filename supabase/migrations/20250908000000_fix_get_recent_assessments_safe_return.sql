-- Fix get_recent_assessments_safe return type and recreate dependent view
DROP VIEW IF EXISTS public.v_recent_assessments_safe;

CREATE FUNCTION public.get_recent_assessments_safe_v2()
RETURNS TABLE (
  created_at timestamptz,
  type_display text,
  country_display text,
  confidence text,
  fit_band text,
  version text,
  session_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $func$
BEGIN
  RETURN QUERY
  SELECT
    p.created_at,
    CONCAT(LEFT(p.type_code, 3), COALESCE(p.overlay, '')) AS type_display,
    COALESCE(
      (SELECT ar.answer_value
         FROM public.assessment_responses ar
         JOIN public.scoring_config sc ON sc.key = 'dashboard_country_qid'
        WHERE ar.session_id = p.session_id
          AND ar.question_id = (sc.value->>'id')::int
        LIMIT 1),
      'Unknown'
    ) AS country_display,
    p.confidence,
    p.fit_band,
    p.results_version AS version,
    p.session_id
  FROM public.profiles p
  WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY p.created_at DESC
  LIMIT 50;
END;
$func$;

-- Drop old function once no dependencies remain
DROP FUNCTION IF EXISTS public.get_recent_assessments_safe();

-- Rename v2 to canonical name
ALTER FUNCTION public.get_recent_assessments_safe_v2()
RENAME TO get_recent_assessments_safe;

-- Recreate view using the new function
CREATE VIEW public.v_recent_assessments_safe AS
SELECT * FROM public.get_recent_assessments_safe();

-- Reapply grants
REVOKE ALL ON FUNCTION public.get_recent_assessments_safe() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recent_assessments_safe() TO anon, authenticated;
GRANT SELECT ON public.v_recent_assessments_safe TO anon, authenticated;
