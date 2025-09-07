-- Fix v_sessions view and replace recent assessments view policy with secure function + GRANTs

-- 1) Fix v_sessions (stop selecting r.user_id)
DROP VIEW IF EXISTS public.v_sessions;

CREATE VIEW public.v_sessions AS
WITH base AS (
  SELECT
    r.session_id,
    MIN(r.created_at) AS started_at,
    MAX(r.created_at) AS last_event_at
  FROM public.assessment_responses r
  GROUP BY r.session_id
)
SELECT
  COALESCE(s.user_id, p.user_id) AS user_id,
  b.session_id,
  b.started_at,
  b.last_event_at,
  EXTRACT(epoch FROM (b.last_event_at - b.started_at))::int AS duration_sec,
  EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.session_id = b.session_id) AS completed
FROM base b
LEFT JOIN public.assessment_sessions s ON s.id = b.session_id
LEFT JOIN public.profiles p           ON p.session_id = b.session_id;

-- 2) Replace invalid view policy with secure function & GRANTs
-- Drop and recreate function with narrowed return columns and SECURITY DEFINER
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
    CASE 
      WHEN p.top_types IS NOT NULL AND jsonb_array_length(p.top_types) > 0 
      THEN COALESCE((p.top_types->0->>'fit_abs')::numeric, 0)
      ELSE 0
    END AS fit_score,
    p.session_id
  FROM public.profiles p
  WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY p.created_at DESC
  LIMIT 50;
END;
$func$;

-- Recreate the view to wrap the function
DROP VIEW IF EXISTS public.v_recent_assessments_safe;
CREATE VIEW public.v_recent_assessments_safe AS
SELECT * FROM public.get_recent_assessments_safe();

-- Correct permissions
GRANT EXECUTE ON FUNCTION public.get_recent_assessments_safe() TO anon, authenticated;
GRANT SELECT  ON public.v_recent_assessments_safe TO anon, authenticated;