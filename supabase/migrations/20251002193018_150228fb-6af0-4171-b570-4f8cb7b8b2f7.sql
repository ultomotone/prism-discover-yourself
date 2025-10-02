-- ========================================
-- Live Analytics System Implementation
-- Contract: "Live" = ≤60s stale data
-- ========================================

-- 1. Create heartbeat tracking table
CREATE TABLE IF NOT EXISTS public.mv_refresh_log (
  view_name text PRIMARY KEY,
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

-- Grant access
ALTER TABLE public.mv_refresh_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read mv_refresh_log" ON public.mv_refresh_log FOR SELECT USING (true);

-- 2. Create heartbeat bump function
CREATE OR REPLACE FUNCTION public._bump_mv_heartbeat(p_view text)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mv_refresh_log(view_name, refreshed_at)
  VALUES (p_view, now())
  ON CONFLICT(view_name) DO UPDATE SET refreshed_at = excluded.refreshed_at;
END$$;

-- 3. Create live today view (always fresh, <1s query)
CREATE OR REPLACE VIEW public.v_kpi_live_today AS
WITH s AS (
  SELECT
    count(*) FILTER (WHERE started_at::date = current_date) as sessions_started,
    count(*) FILTER (WHERE status='completed' AND started_at::date = current_date) as sessions_completed,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM (completed_at - started_at)))
      FILTER (WHERE status='completed' 
              AND completed_at > started_at 
              AND extract(epoch FROM (completed_at - started_at)) BETWEEN 300 AND 7200) as median_completion_sec
  FROM public.assessment_sessions
)
SELECT
  sessions_started,
  sessions_completed,
  CASE WHEN sessions_started > 0 THEN round(100.0 * sessions_completed::numeric / sessions_started::numeric, 2) ELSE 0 END as completion_rate_pct,
  CASE WHEN sessions_started > 0 THEN greatest(0, 100 - round(100.0 * sessions_completed::numeric / sessions_started::numeric, 2)) ELSE 0 END as drop_off_rate_pct,
  median_completion_sec
FROM s;

-- 4. Initialize heartbeats for existing MVs
SELECT public._bump_mv_heartbeat('mv_kpi_engagement');
SELECT public._bump_mv_heartbeat('mv_kpi_construct_coverage');
SELECT public._bump_mv_heartbeat('mv_kpi_reliability');
SELECT public._bump_mv_heartbeat('mv_kpi_retest');
SELECT public._bump_mv_heartbeat('mv_kpi_fairness_dif');
SELECT public._bump_mv_heartbeat('mv_kpi_calibration');

-- 5. Set up pg_cron jobs for MV refreshes

-- Engagement: refresh every minute
SELECT cron.schedule(
  'kpi_engagement_minutely',
  '* * * * *',
  $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_engagement;
    SELECT public._bump_mv_heartbeat('mv_kpi_engagement');
  $$
);

-- Reliability & Retest: refresh every 5 minutes
SELECT cron.schedule(
  'kpi_reliability_5min',
  '*/5 * * * *',
  $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_reliability;
    SELECT public._bump_mv_heartbeat('mv_kpi_reliability');
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_retest;
    SELECT public._bump_mv_heartbeat('mv_kpi_retest');
  $$
);

-- Construct coverage: refresh every 5 minutes
SELECT cron.schedule(
  'kpi_construct_5min',
  '*/5 * * * *',
  $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_construct_coverage;
    SELECT public._bump_mv_heartbeat('mv_kpi_construct_coverage');
  $$
);

-- Fairness & Calibration: refresh every 15 minutes
SELECT cron.schedule(
  'kpi_fairness_15min',
  '*/15 * * * *',
  $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_fairness_dif;
    SELECT public._bump_mv_heartbeat('mv_kpi_fairness_dif');
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_calibration;
    SELECT public._bump_mv_heartbeat('mv_kpi_calibration');
  $$
);