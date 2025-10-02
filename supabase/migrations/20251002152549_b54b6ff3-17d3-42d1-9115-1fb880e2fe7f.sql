
-- Fix mv_kpi_engagement to properly calculate drop-off rate and completion metrics
-- The issue is we need to track by a single date reference, not split between started/completed

DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_engagement CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_engagement AS
WITH daily_metrics AS (
  SELECT 
    DATE(COALESCE(completed_at, started_at)) as day,
    COUNT(*) FILTER (WHERE status = 'in_progress' OR status = 'abandoned') as sessions_started_but_incomplete,
    COUNT(*) FILTER (WHERE status = 'completed') as sessions_completed,
    COUNT(*) FILTER (WHERE status = 'abandoned') as sessions_abandoned,
    -- Calculate median completion time excluding outliers (5-120 min range)
    PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at))
    ) FILTER (
      WHERE status = 'completed' 
        AND completed_at IS NOT NULL 
        AND started_at IS NOT NULL
        AND completed_at > started_at
        AND EXTRACT(EPOCH FROM (completed_at - started_at)) BETWEEN 300 AND 7200
    ) as median_completion_sec,
    STDDEV(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (
      WHERE status = 'completed'
        AND completed_at IS NOT NULL
        AND started_at IS NOT NULL  
        AND completed_at > started_at
        AND EXTRACT(EPOCH FROM (completed_at - started_at)) BETWEEN 300 AND 7200
    ) as completion_time_sd_sec
  FROM public.assessment_sessions
  WHERE COALESCE(completed_at, started_at) >= '2020-01-01'
  GROUP BY DATE(COALESCE(completed_at, started_at))
),
daily_started AS (
  SELECT 
    DATE(started_at) as day,
    COUNT(*) as sessions_started_count
  FROM public.assessment_sessions
  WHERE started_at >= '2020-01-01'
  GROUP BY DATE(started_at)
)
SELECT 
  COALESCE(dm.day, ds.day) as day,
  COALESCE(ds.sessions_started_count, 0) as sessions_started,
  COALESCE(dm.sessions_completed, 0) as sessions_completed,
  COALESCE(dm.sessions_abandoned, 0) as sessions_abandoned,
  -- Drop-off rate: (started - completed) / started * 100, capped at 100%
  CASE 
    WHEN COALESCE(ds.sessions_started_count, 0) > 0 
    THEN LEAST(100.0, GREATEST(0.0, 
      ((COALESCE(ds.sessions_started_count, 0) - COALESCE(dm.sessions_completed, 0))::numeric / 
       COALESCE(ds.sessions_started_count, 1)::numeric) * 100
    ))
    ELSE 0
  END as drop_off_rate,
  -- Completion rate: completed / started * 100, capped at 100%
  CASE 
    WHEN COALESCE(ds.sessions_started_count, 0) > 0 
    THEN LEAST(100.0, 
      (COALESCE(dm.sessions_completed, 0)::numeric / 
       COALESCE(ds.sessions_started_count, 1)::numeric) * 100
    )
    ELSE 0
  END as completion_rate_pct,
  dm.median_completion_sec as avg_completion_sec,
  dm.completion_time_sd_sec
FROM daily_metrics dm
FULL OUTER JOIN daily_started ds ON dm.day = ds.day
ORDER BY COALESCE(dm.day, ds.day) DESC;

CREATE UNIQUE INDEX idx_mv_kpi_engagement_day ON public.mv_kpi_engagement(day);

REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_engagement;

-- Now fix mv_kpi_sessions to use consistent started_at date grouping
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_sessions CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_sessions AS
WITH daily_data AS (
  SELECT 
    DATE(started_at) as day,
    COUNT(*) as sessions_started,
    COUNT(*) FILTER (WHERE status = 'completed') as sessions_completed
  FROM public.assessment_sessions
  WHERE started_at >= '2020-01-01'
  GROUP BY DATE(started_at)
)
SELECT 
  day,
  sessions_started,
  sessions_completed,
  CASE 
    WHEN sessions_started > 0 
    THEN LEAST(100.0, (sessions_completed::numeric / sessions_started::numeric) * 100)
    ELSE 0
  END as completion_rate_pct
FROM daily_data
ORDER BY day DESC;

CREATE UNIQUE INDEX idx_mv_kpi_sessions_day ON public.mv_kpi_sessions(day);

REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_sessions;
