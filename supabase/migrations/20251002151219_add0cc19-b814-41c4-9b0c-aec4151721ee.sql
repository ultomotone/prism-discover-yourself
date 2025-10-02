-- Fix analytics by updating mv_kpi_sessions to track completions separately
-- The issue: sessions with old/placeholder start dates but recent completion dates
-- don't show up in the right time buckets

DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_sessions CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_sessions AS
WITH daily_started AS (
  SELECT
    started_at::date AS day,
    COUNT(*) AS sessions_started
  FROM public.assessment_sessions
  WHERE started_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY started_at::date
),
daily_completed AS (
  SELECT
    completed_at::date AS day,
    COUNT(*) AS sessions_completed
  FROM public.assessment_sessions
  WHERE completed_at >= CURRENT_DATE - INTERVAL '90 days'
    AND status = 'completed'
  GROUP BY completed_at::date
)
SELECT
  COALESCE(ds.day, dc.day) AS day,
  COALESCE(ds.sessions_started, 0) AS sessions_started,
  COALESCE(dc.sessions_completed, 0) AS sessions_completed,
  CASE 
    WHEN COALESCE(ds.sessions_started, 0) > 0 
    THEN ROUND((COALESCE(dc.sessions_completed, 0)::numeric / ds.sessions_started::numeric) * 100, 2)
    ELSE 0
  END AS completion_rate_pct
FROM daily_started ds
FULL OUTER JOIN daily_completed dc ON ds.day = dc.day
ORDER BY COALESCE(ds.day, dc.day) DESC;

CREATE UNIQUE INDEX idx_mv_kpi_sessions_day ON public.mv_kpi_sessions(day);

-- Refresh the view immediately to show correct data
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_sessions;