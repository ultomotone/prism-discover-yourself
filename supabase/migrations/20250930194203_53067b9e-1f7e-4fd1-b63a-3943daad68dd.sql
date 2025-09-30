-- Complete KPI setup migration
-- Drop the alerts function first to avoid dependency issues
DROP FUNCTION IF EXISTS public.kpi_alerts();

-- Create all materialized views
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_sessions AS
WITH daily_data AS (
  SELECT
    date_trunc('day', s.started_at) AS day,
    COUNT(*) FILTER (WHERE s.status = 'completed') AS sessions_completed,
    COUNT(*) AS sessions_started
  FROM public.assessment_sessions s
  GROUP BY date_trunc('day', s.started_at)
)
SELECT
  day,
  sessions_completed,
  sessions_started,
  CASE 
    WHEN sessions_started > 0 
    THEN ROUND((sessions_completed::numeric / sessions_started::numeric) * 100, 1)
    ELSE 0
  END AS completion_rate_pct
FROM daily_data;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_sessions_day ON public.mv_kpi_sessions(day);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_scoring AS
WITH daily_data AS (
  SELECT
    date_trunc('day', p.created_at) AS day,
    AVG(COALESCE(p.conf_calibrated, p.conf_raw)) AS avg_conf_calibrated,
    COUNT(*) FILTER (WHERE p.top_gap < 3) AS invalid_ct,
    COUNT(*) AS total_ct
  FROM public.profiles p
  GROUP BY date_trunc('day', p.created_at)
)
SELECT
  day,
  ROUND(avg_conf_calibrated::numeric, 2) AS avg_conf_calibrated,
  invalid_ct,
  total_ct
FROM daily_data;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_scoring_day ON public.mv_kpi_scoring(day);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_item_flags AS
WITH flag_counts AS (
  SELECT
    f.question_id,
    COUNT(*) AS flag_count
  FROM public.assessment_item_flags f
  GROUP BY f.question_id
),
session_counts AS (
  SELECT
    r.question_id,
    COUNT(DISTINCT r.session_id) AS session_count
  FROM public.assessment_responses r
  GROUP BY r.question_id
)
SELECT
  fc.question_id,
  fc.flag_count,
  sc.session_count,
  CASE 
    WHEN sc.session_count > 0 
    THEN ROUND((fc.flag_count::numeric / sc.session_count::numeric), 4)
    ELSE 0
  END AS flag_rate
FROM flag_counts fc
JOIN session_counts sc ON sc.question_id = fc.question_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_item_flags_qid ON public.mv_kpi_item_flags(question_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_feedback AS
SELECT
  date_trunc('day', f.submitted_at) AS day,
  ROUND(AVG(f.nps)::numeric, 1) AS avg_nps,
  COUNT(*) AS feedback_count
FROM public.assessment_feedback f
WHERE f.nps IS NOT NULL
GROUP BY date_trunc('day', f.submitted_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_feedback_day ON public.mv_kpi_feedback(day);

-- Grant access
GRANT SELECT ON public.mv_kpi_sessions TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_scoring TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_item_flags TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_feedback TO authenticated, anon;

-- Refresh the views
REFRESH MATERIALIZED VIEW public.mv_kpi_sessions;
REFRESH MATERIALIZED VIEW public.mv_kpi_scoring;
REFRESH MATERIALIZED VIEW public.mv_kpi_item_flags;
REFRESH MATERIALIZED VIEW public.mv_kpi_feedback;

-- Recreate the alerts function with correct column names
CREATE OR REPLACE FUNCTION public.kpi_alerts()
 RETURNS TABLE(msg text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH latest_scoring AS (
    SELECT *
    FROM mv_kpi_scoring
    WHERE day >= now() - interval '1 day'
    ORDER BY day DESC
    LIMIT 1
  ),
  latest_sessions AS (
    SELECT *
    FROM mv_kpi_sessions
    WHERE day >= now() - interval '1 day'
    ORDER BY day DESC
    LIMIT 1
  )
  SELECT
    CASE
      WHEN ls.avg_conf_calibrated < 0.6 THEN '⚠️ Confidence calibration < 0.60'
      WHEN lses.sessions_completed > 0 AND (ls.invalid_ct::float / lses.sessions_completed) > 0.25 
        THEN '⚠️ Close-calls > 25%'
      ELSE NULL
    END AS msg
  FROM latest_scoring ls
  CROSS JOIN latest_sessions lses
  WHERE 1=1
$function$;