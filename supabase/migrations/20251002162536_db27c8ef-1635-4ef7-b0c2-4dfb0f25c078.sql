-- PRISM Analytics Migration (Final - Fixed Refresh)

-- 1) Reliability results store
CREATE TABLE IF NOT EXISTS public.psychometrics_external (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_code text NOT NULL,
  results_version text NOT NULL,
  cohort_start date NOT NULL,
  cohort_end date NOT NULL,
  n_respondents int NOT NULL,
  cronbach_alpha numeric(6,4),
  mcdonald_omega numeric(6,4),
  sem numeric(8,4),
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT chk_alpha_range CHECK (cronbach_alpha IS NULL OR (cronbach_alpha>=0 AND cronbach_alpha<=1)),
  CONSTRAINT chk_omega_range CHECK (mcdonald_omega IS NULL OR (mcdonald_omega>=0 AND mcdonald_omega<=1))
);

CREATE INDEX IF NOT EXISTS idx_psyext_scale_ver_dates
  ON public.psychometrics_external (scale_code, results_version, cohort_start, cohort_end);

ALTER TABLE public.psychometrics_external ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read psychometrics_external" ON public.psychometrics_external;
CREATE POLICY "Public read psychometrics_external"
  ON public.psychometrics_external FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access psychometrics_external" ON public.psychometrics_external;
CREATE POLICY "Service role full access psychometrics_external"
  ON public.psychometrics_external FOR ALL
  USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text)
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

-- 2) Test-retest pairs store
CREATE TABLE IF NOT EXISTS public.psychometrics_retest_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scale_code text NOT NULL,
  first_session_id uuid NOT NULL,
  second_session_id uuid NOT NULL,
  days_between int NOT NULL,
  r_pearson numeric(6,4),
  n_items int,
  results_version text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retest_user_scale 
  ON public.psychometrics_retest_pairs(user_id, scale_code);

ALTER TABLE public.psychometrics_retest_pairs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read retest pairs" ON public.psychometrics_retest_pairs;
CREATE POLICY "Public read retest pairs"
  ON public.psychometrics_retest_pairs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access retest pairs" ON public.psychometrics_retest_pairs;
CREATE POLICY "Service role full access retest pairs"
  ON public.psychometrics_retest_pairs FOR ALL
  USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text)
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

-- 3) Retest candidate pairs view
CREATE OR REPLACE VIEW public.v_retest_pairs AS
WITH s AS (
  SELECT 
    s.id AS session_id, 
    s.user_id, 
    s.completed_at,
    COALESCE(p.results_version, 'v1.2.1') AS results_version
  FROM public.assessment_sessions s
  LEFT JOIN public.profiles p ON p.session_id = s.id
  WHERE s.status = 'completed' AND s.completed_at IS NOT NULL
)
SELECT
  a.user_id,
  a.session_id AS first_session_id,
  b.session_id AS second_session_id,
  a.results_version,
  EXTRACT(day FROM (b.completed_at - a.completed_at))::int AS days_between
FROM s a
JOIN s b
  ON a.user_id = b.user_id
 AND b.completed_at > a.completed_at
 AND b.completed_at <= a.completed_at + interval '42 days';

-- 4) Fixed engagement metrics
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_engagement CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_engagement AS
WITH started AS (
  SELECT DATE(started_at) AS day, COUNT(*) AS sessions_started
  FROM public.assessment_sessions
  WHERE started_at >= '2020-01-01'
  GROUP BY DATE(started_at)
),
completed AS (
  SELECT DATE(started_at) AS day, COUNT(*) AS sessions_completed
  FROM public.assessment_sessions
  WHERE status='completed' AND started_at >= '2020-01-01'
  GROUP BY DATE(started_at)
),
dur AS (
  SELECT
    DATE(started_at) AS day,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at))
    ) FILTER (
      WHERE status='completed'
        AND completed_at>started_at
        AND EXTRACT(EPOCH FROM (completed_at - started_at)) BETWEEN 300 AND 7200
    ) AS median_completion_sec,
    STDDEV(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (
      WHERE status='completed'
        AND completed_at>started_at
        AND EXTRACT(EPOCH FROM (completed_at - started_at)) BETWEEN 300 AND 7200
    ) AS completion_time_sd_sec
  FROM public.assessment_sessions
  WHERE started_at >= '2020-01-01'
  GROUP BY DATE(started_at)
)
SELECT
  COALESCE(s.day, c.day, d.day) AS day,
  COALESCE(s.sessions_started,0) AS sessions_started,
  COALESCE(c.sessions_completed,0) AS sessions_completed,
  CASE WHEN COALESCE(s.sessions_started,0)>0
       THEN (COALESCE(c.sessions_completed,0)::numeric / s.sessions_started::numeric)
       ELSE 0 END AS drop_off_rate,
  d.median_completion_sec AS avg_completion_sec,
  d.completion_time_sd_sec
FROM started s
FULL OUTER JOIN completed c ON c.day = s.day
FULL OUTER JOIN dur d ON d.day = COALESCE(s.day,c.day)
ORDER BY day DESC;

CREATE UNIQUE INDEX idx_mv_kpi_engagement_day 
  ON public.mv_kpi_engagement(day);

-- 5) Reliability rollups
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_reliability CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_reliability AS
SELECT
  scale_code AS scale_id,
  AVG(cronbach_alpha) AS cronbach_alpha,
  AVG(mcdonald_omega) AS split_half_corr,
  AVG(mcdonald_omega) AS mcdonald_omega
FROM public.psychometrics_external
GROUP BY scale_code;

CREATE UNIQUE INDEX idx_mv_kpi_reliability 
  ON public.mv_kpi_reliability(scale_id);

-- 6) Retest summaries
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_retest CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_retest AS
SELECT
  scale_code,
  results_version,
  COUNT(*) FILTER (WHERE r_pearson IS NOT NULL) AS n_pairs,
  AVG(r_pearson) AS r_mean,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_between) AS median_days_between
FROM public.psychometrics_retest_pairs
GROUP BY scale_code, results_version;

CREATE UNIQUE INDEX idx_mv_kpi_retest 
  ON public.mv_kpi_retest(scale_code, results_version);

-- 7) Fixed construct coverage
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_construct_coverage CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_construct_coverage AS
WITH scale_items AS (
  SELECT 
    COALESCE(sk.tag, sk.scale_type::text) AS scale_code,
    COUNT(DISTINCT sk.question_id) AS keyed_items
  FROM public.assessment_scoring_key sk
  WHERE sk.scale_type != 'META'
  GROUP BY COALESCE(sk.tag, sk.scale_type::text)
),
all_items AS (
  SELECT COUNT(DISTINCT id) AS total_items
  FROM public.assessment_questions
  WHERE section = 'core' AND type ILIKE 'likert%'
)
SELECT
  si.scale_code,
  si.keyed_items,
  ai.total_items,
  ROUND((si.keyed_items::numeric / NULLIF(ai.total_items,0)) * 100, 2) AS construct_coverage_index
FROM scale_items si
CROSS JOIN all_items ai;

CREATE UNIQUE INDEX idx_mv_kpi_construct_coverage_scale
  ON public.mv_kpi_construct_coverage(scale_code);

-- 8) SQL executor for Edge Functions
CREATE OR REPLACE FUNCTION public.exec_sql(q text)
RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || q || ') as t' INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.exec_sql(text) FROM public;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- 9) Refresh materialized views (engagement needs CONCURRENTLY, others normal)
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_engagement;
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_construct_coverage;