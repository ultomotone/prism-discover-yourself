-- Fix Pack: Analytics Infrastructure

-- 0) Add unique constraint
ALTER TABLE public.psychometrics_external
  DROP CONSTRAINT IF EXISTS psychometrics_external_unique;
ALTER TABLE public.psychometrics_external
  ADD CONSTRAINT psychometrics_external_unique 
  UNIQUE (scale_code, results_version, cohort_start, cohort_end);

-- 1.1 Retest pairs view
DROP VIEW IF EXISTS public.v_retest_pairs CASCADE;
CREATE VIEW public.v_retest_pairs AS
WITH s AS (
  SELECT s.id AS session_id, s.user_id, p.results_version, s.started_at, s.completed_at
  FROM public.assessment_sessions s
  JOIN public.profiles p ON p.session_id = s.id
  WHERE s.status = 'completed' AND s.completed_at IS NOT NULL
)
SELECT
  a.user_id, a.session_id AS first_session_id, b.session_id AS second_session_id,
  COALESCE(a.results_version, 'v1.2.1') AS results_version,
  EXTRACT(DAY FROM (b.completed_at - a.completed_at))::int AS days_between
FROM s a
JOIN s b ON a.user_id = b.user_id 
  AND b.completed_at > a.completed_at 
  AND b.completed_at <= a.completed_at + INTERVAL '180 days';

-- 1.2 Exec SQL
CREATE OR REPLACE FUNCTION public.exec_sql(q text) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE result json;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || q || ') as t' INTO result;
  RETURN result;
END$$;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- 2.1 Engagement MV
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_engagement CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_engagement AS
WITH started AS (
  SELECT date_trunc('day', started_at)::date AS day, COUNT(*) AS sessions_started
  FROM public.assessment_sessions WHERE started_at IS NOT NULL GROUP BY 1
),
completed AS (
  SELECT date_trunc('day', started_at)::date AS day, COUNT(*) AS sessions_completed
  FROM public.assessment_sessions WHERE status='completed' AND started_at IS NOT NULL GROUP BY 1
),
dur AS (
  SELECT date_trunc('day', started_at)::date AS day,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at)))
    FILTER (WHERE status='completed' AND completed_at>started_at 
      AND EXTRACT(EPOCH FROM (completed_at - started_at)) BETWEEN 300 AND 7200) AS median_completion_sec
  FROM public.assessment_sessions GROUP BY 1
)
SELECT
  COALESCE(s.day, c.day, d.day) AS day,
  COALESCE(s.sessions_started,0) AS sessions_started,
  COALESCE(c.sessions_completed,0) AS sessions_completed,
  CASE WHEN COALESCE(s.sessions_started,0)>0
    THEN ROUND(100.0 * COALESCE(c.sessions_completed,0)::numeric / s.sessions_started::numeric, 2)
    ELSE 0 END AS completion_rate_pct,
  CASE WHEN COALESCE(s.sessions_started,0)>0
    THEN GREATEST(0, 100 - ROUND(100.0 * COALESCE(c.sessions_completed,0)::numeric / s.sessions_started::numeric, 2))
    ELSE 0 END AS drop_off_rate_pct,
  d.median_completion_sec
FROM started s
FULL OUTER JOIN completed c USING(day)
FULL OUTER JOIN dur d ON d.day = COALESCE(s.day, c.day)
ORDER BY 1;
CREATE UNIQUE INDEX idx_mv_kpi_engagement_day ON public.mv_kpi_engagement(day);

-- 2.2 Construct coverage MV
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_construct_coverage CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_construct_coverage AS
WITH bank AS (
  SELECT ic.question_id, ic.scale_id, COALESCE(ic.keyed,0) AS keyed
  FROM public.item_catalog ic
  JOIN public.assessment_questions q ON q.id = ic.question_id
),
denom AS (
  SELECT scale_id, COUNT(DISTINCT question_id) AS total_items FROM bank GROUP BY 1
),
num AS (
  SELECT scale_id, COUNT(DISTINCT question_id) AS keyed_items FROM bank WHERE keyed > 0 GROUP BY 1
)
SELECT
  d.scale_id,
  COALESCE(sc.scale_name, d.scale_id) AS scale_code,
  sc.scale_name,
  COALESCE(n.keyed_items,0) AS keyed_items,
  d.total_items,
  ROUND(100.0 * COALESCE(n.keyed_items,0)::numeric / NULLIF(d.total_items,0), 2) AS coverage_pct
FROM denom d
LEFT JOIN num n ON n.scale_id = d.scale_id
LEFT JOIN public.scale_catalog sc ON sc.scale_id = d.scale_id
ORDER BY d.scale_id;
CREATE UNIQUE INDEX idx_mv_kpi_construct_coverage_scale ON public.mv_kpi_construct_coverage(scale_id);

-- 2.3 Reliability MV
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_reliability CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_reliability AS
SELECT
  scale_code, results_version,
  MAX(cohort_end) AS last_updated,
  SUM(n_respondents) AS n_total,
  AVG(cronbach_alpha) AS alpha_mean,
  AVG(mcdonald_omega) AS omega_mean,
  AVG(sem) AS sem_mean
FROM public.psychometrics_external
GROUP BY scale_code, results_version;
CREATE UNIQUE INDEX idx_mv_kpi_reliability ON public.mv_kpi_reliability(scale_code, results_version);

-- 2.4 Retest MV
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_retest CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_retest AS
SELECT
  scale_code, results_version,
  COUNT(*) FILTER (WHERE r_pearson IS NOT NULL) AS n_pairs,
  AVG(r_pearson) AS r_mean
FROM public.psychometrics_retest_pairs
WHERE days_between BETWEEN 14 AND 180
GROUP BY scale_code, results_version;
CREATE UNIQUE INDEX idx_mv_kpi_retest ON public.mv_kpi_retest(scale_code, results_version);

-- 2.5 Calibration MV
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_calibration CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_calibration AS
SELECT
  AVG(p.conf_calibrated)::numeric AS avg_confidence,
  AVG(p.top_gap)::numeric AS avg_top_gap,
  NULL::numeric AS ece
FROM public.profiles p;
CREATE UNIQUE INDEX idx_mv_kpi_calibration_true ON public.mv_kpi_calibration((true));

-- 2.6 Classification stability MV
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_classification_stability CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_classification_stability AS
WITH pairs AS (
  SELECT first_session_id, second_session_id
  FROM public.psychometrics_retest_pairs
  WHERE days_between BETWEEN 14 AND 180
),
types AS (
  SELECT s.id AS session_id, p.type_code
  FROM public.assessment_sessions s
  JOIN public.profiles p ON p.session_id = s.id
)
SELECT
  COUNT(*)::bigint AS n_pairs,
  AVG((t1.type_code = t2.type_code)::int)::numeric AS stability_rate
FROM pairs
LEFT JOIN types t1 ON t1.session_id = pairs.first_session_id
LEFT JOIN types t2 ON t2.session_id = pairs.second_session_id;
CREATE UNIQUE INDEX idx_mv_kpi_classification_stability_true ON public.mv_kpi_classification_stability((true));

-- 3) Refresh-all RPC
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_start timestamptz := now();
  v_errors jsonb := '[]'::jsonb;
BEGIN
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_engagement;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_engagement', 'error', SQLERRM); END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_reliability', 'error', SQLERRM); END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_construct_coverage;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_construct_coverage', 'error', SQLERRM); END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_calibration;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_calibration', 'error', SQLERRM); END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_classification_stability;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_classification_stability', 'error', SQLERRM); END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_retest;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_retest', 'error', SQLERRM); END;
  RETURN jsonb_build_object('success', true, 'duration_ms', EXTRACT(EPOCH FROM (now() - v_start)) * 1000, 'errors', v_errors, 'timestamp', now());
END$$;
REVOKE ALL ON FUNCTION public.refresh_all_materialized_views() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_all_materialized_views() TO service_role;

-- Initial refresh
REFRESH MATERIALIZED VIEW public.mv_kpi_engagement;
REFRESH MATERIALIZED VIEW public.mv_kpi_construct_coverage;
REFRESH MATERIALIZED VIEW public.mv_kpi_reliability;
REFRESH MATERIALIZED VIEW public.mv_kpi_retest;
REFRESH MATERIALIZED VIEW public.mv_kpi_calibration;
REFRESH MATERIALIZED VIEW public.mv_kpi_classification_stability;