-- ================================================================
-- PRISM Analytics Live Dashboard — Database Finalization
-- Fix: median time, construct coverage, reliability UX
-- ================================================================

-- A1) Fix mv_kpi_engagement: widen valid window (2-180 min) + robust median
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_engagement CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_engagement AS
WITH s AS (
  SELECT date_trunc('day', started_at)::date AS day, COUNT(*) AS sessions_started
  FROM public.assessment_sessions GROUP BY 1
),
c AS (
  SELECT date_trunc('day', started_at)::date AS day, COUNT(*) AS sessions_completed
  FROM public.assessment_sessions WHERE status='completed' GROUP BY 1
),
d AS (
  SELECT date_trunc('day', started_at)::date AS day,
         PERCENTILE_CONT(0.5) WITHIN GROUP (
           ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at))
         ) FILTER (WHERE status='completed'
                   AND completed_at>started_at
                   AND EXTRACT(EPOCH FROM (completed_at - started_at)) BETWEEN 120 AND 10800)
           AS median_completion_sec
  FROM public.assessment_sessions
  GROUP BY 1
)
SELECT COALESCE(s.day,c.day,d.day) AS day,
       COALESCE(s.sessions_started,0) AS sessions_started,
       COALESCE(c.sessions_completed,0) AS sessions_completed,
       CASE WHEN COALESCE(s.sessions_started,0)>0
            THEN ROUND(100.0*COALESCE(c.sessions_completed,0)::numeric/s.sessions_started::numeric,2)
            ELSE 0 END AS completion_rate_pct,
       CASE WHEN COALESCE(s.sessions_started,0)>0
            THEN GREATEST(0,100-ROUND(100.0*COALESCE(c.sessions_completed,0)::numeric/s.sessions_started::numeric,2))
            ELSE 0 END AS drop_off_rate_pct,
       d.median_completion_sec
FROM s FULL OUTER JOIN c USING(day)
FULL OUTER JOIN d ON d.day=COALESCE(s.day,c.day)
ORDER BY 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_engagement_day ON mv_kpi_engagement(day);
GRANT SELECT ON mv_kpi_engagement TO anon, authenticated, service_role;

-- A2) Fix mv_kpi_construct_coverage: use scoring_key if item_catalog is sparse
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_construct_coverage CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_construct_coverage AS
WITH bank AS (
  SELECT
    COALESCE(ic.question_id, sk.question_id) AS question_id,
    COALESCE(ic.scale_id, sk.tag) AS scale_id,
    COALESCE(ic.keyed, CASE WHEN sk.weight IS NOT NULL AND sk.weight<>0 THEN 1 ELSE 0 END) AS keyed
  FROM public.assessment_questions q
  LEFT JOIN public.item_catalog ic ON ic.question_id=q.id
  LEFT JOIN public.assessment_scoring_key sk ON sk.question_id=q.id
  WHERE q.type ILIKE 'likert%'
),
den AS (SELECT scale_id, COUNT(DISTINCT question_id) AS total_items FROM bank WHERE scale_id IS NOT NULL GROUP BY 1),
num AS (SELECT scale_id, COUNT(DISTINCT question_id) AS keyed_items FROM bank WHERE keyed>0 AND scale_id IS NOT NULL GROUP BY 1)
SELECT d.scale_id,
       d.scale_id AS scale_code,
       d.scale_id AS scale_name,
       COALESCE(n.keyed_items,0) AS keyed_items, 
       d.total_items,
       ROUND(100.0*COALESCE(n.keyed_items,0)::numeric/NULLIF(d.total_items,0),2) AS coverage_pct
FROM den d
LEFT JOIN num n USING(scale_id)
ORDER BY d.scale_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_construct_coverage_scale ON mv_kpi_construct_coverage(scale_id);
GRANT SELECT ON mv_kpi_construct_coverage TO anon, authenticated, service_role;

-- A3) Create v_scales_reliability_coverage view for integrity checking
CREATE OR REPLACE VIEW v_scales_reliability_coverage AS
SELECT 
  r.scale_code,
  r.results_version,
  r.alpha_mean,
  r.omega_mean,
  r.n_total,
  r.last_updated
FROM public.mv_kpi_reliability r
WHERE r.results_version='v1.2.1'
ORDER BY r.scale_code;

GRANT SELECT ON v_scales_reliability_coverage TO anon, authenticated, service_role;

-- A4) Ensure mv_refresh_log table exists
CREATE TABLE IF NOT EXISTS public.mv_refresh_log(
  view_name text primary key, 
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mv_refresh_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read mv_refresh_log" ON public.mv_refresh_log;
CREATE POLICY "Public read mv_refresh_log" ON public.mv_refresh_log FOR SELECT USING (true);

GRANT SELECT ON public.mv_refresh_log TO anon, authenticated;
GRANT ALL ON public.mv_refresh_log TO service_role;

-- A5) Create or replace heartbeat bump function
CREATE OR REPLACE FUNCTION public._bump_mv_heartbeat(p_view text)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.mv_refresh_log(view_name, refreshed_at)
  VALUES (p_view, now())
  ON CONFLICT(view_name) DO UPDATE SET refreshed_at=EXCLUDED.refreshed_at;
END$$;

GRANT EXECUTE ON FUNCTION public._bump_mv_heartbeat(text) TO service_role;

-- Initial refresh + heartbeat
REFRESH MATERIALIZED VIEW mv_kpi_engagement;
SELECT public._bump_mv_heartbeat('mv_kpi_engagement');

REFRESH MATERIALIZED VIEW mv_kpi_construct_coverage;
SELECT public._bump_mv_heartbeat('mv_kpi_construct_coverage');

-- Refresh reliability if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname='public' AND matviewname='mv_kpi_reliability') THEN
    REFRESH MATERIALIZED VIEW mv_kpi_reliability;
    PERFORM public._bump_mv_heartbeat('mv_kpi_reliability');
  END IF;
END$$;