-- 1) Create new tables for reliability metrics
DROP TABLE IF EXISTS public.psychometrics_external CASCADE;

CREATE TABLE public.psychometrics_external (
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
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_psyext_scale_ver_dates
  ON public.psychometrics_external (scale_code, results_version, cohort_start, cohort_end);

ALTER TABLE public.psychometrics_external ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read psychometrics_external"
  ON public.psychometrics_external FOR SELECT
  USING (true);

CREATE POLICY "Service role full access psychometrics_external"
  ON public.psychometrics_external FOR ALL
  USING ((current_setting('request.jwt.claims'::text, true)::jsonb ->> 'role'::text) = 'service_role'::text)
  WITH CHECK ((current_setting('request.jwt.claims'::text, true)::jsonb ->> 'role'::text) = 'service_role'::text);

-- Retest pairs table
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

CREATE INDEX idx_retest_user_scale 
  ON public.psychometrics_retest_pairs(user_id, scale_code);

ALTER TABLE public.psychometrics_retest_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read retest pairs"
  ON public.psychometrics_retest_pairs FOR SELECT
  USING (true);

CREATE POLICY "Service role full access retest pairs"
  ON public.psychometrics_retest_pairs FOR ALL
  USING ((current_setting('request.jwt.claims'::text, true)::jsonb ->> 'role'::text) = 'service_role'::text)
  WITH CHECK ((current_setting('request.jwt.claims'::text, true)::jsonb ->> 'role'::text) = 'service_role'::text);

-- View for retest pairs (using profiles table for results_version)
CREATE OR REPLACE VIEW public.v_retest_pairs AS
WITH s AS (
  SELECT 
    s.id as session_id, 
    s.user_id, 
    COALESCE(p.results_version, 'v1.2.1') as results_version,
    s.completed_at
  FROM public.assessment_sessions s
  LEFT JOIN public.profiles p ON p.session_id = s.id
  WHERE s.status = 'completed' AND s.completed_at IS NOT NULL
),
pairs AS (
  SELECT
    a.user_id,
    a.session_id as first_session_id,
    b.session_id as second_session_id,
    a.results_version,
    EXTRACT(day FROM (b.completed_at - a.completed_at))::int as days_between
  FROM s a
  JOIN s b
    ON a.user_id = b.user_id
   AND b.completed_at > a.completed_at
   AND b.completed_at <= a.completed_at + interval '42 days'
)
SELECT * FROM pairs;

-- Recreate reliability materialized view
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_reliability CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_reliability AS
SELECT
  scale_code as scale_id,
  results_version,
  MAX(cohort_end) as last_updated,
  SUM(n_respondents) as n_total,
  AVG(cronbach_alpha) as cronbach_alpha,
  AVG(mcdonald_omega) as mcdonald_omega,
  AVG(sem) as sem_mean,
  NULL::numeric as split_half_corr
FROM public.psychometrics_external
GROUP BY scale_code, results_version;

CREATE UNIQUE INDEX idx_mv_kpi_reliability_unique
  ON public.mv_kpi_reliability(scale_id, results_version);

-- Create retest materialized view
CREATE MATERIALIZED VIEW public.mv_kpi_retest AS
SELECT
  scale_code,
  results_version,
  COUNT(*) FILTER (WHERE r_pearson IS NOT NULL) as n_pairs,
  AVG(r_pearson) as r_mean,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_between) as median_days_between
FROM public.psychometrics_retest_pairs
GROUP BY scale_code, results_version;

CREATE UNIQUE INDEX idx_mv_kpi_retest_unique
  ON public.mv_kpi_retest(scale_code, results_version);

-- Refresh the views
REFRESH MATERIALIZED VIEW public.mv_kpi_reliability;
REFRESH MATERIALIZED VIEW public.mv_kpi_retest;