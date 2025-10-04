-- Remove STATE scales from reliability display
-- STATE scales are single-item contextual measures, not trait scales
-- They don't have internal consistency and shouldn't appear in reliability metrics

-- 1. Update mv_kpi_reliability to exclude STATE scales
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_reliability CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_reliability AS
SELECT
  scale_code, 
  results_version,
  MAX(cohort_end) AS last_updated,
  SUM(n_respondents) AS n_total,
  AVG(cronbach_alpha) AS alpha_mean,
  AVG(mcdonald_omega) AS omega_mean,
  AVG(sem) AS sem_mean
FROM public.psychometrics_external
WHERE scale_code NOT LIKE 'STATE_%'
GROUP BY scale_code, results_version;

CREATE UNIQUE INDEX idx_mv_kpi_reliability 
  ON public.mv_kpi_reliability(scale_code, results_version);

-- 2. Update mv_kpi_retest to exclude STATE scales
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_retest CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_retest AS
SELECT
  scale_code, 
  results_version,
  COUNT(*) FILTER (WHERE r_pearson IS NOT NULL) AS n_pairs,
  AVG(r_pearson) AS r_mean
FROM public.psychometrics_retest_pairs
WHERE days_between BETWEEN 14 AND 180
  AND scale_code NOT LIKE 'STATE_%'
GROUP BY scale_code, results_version;

CREATE UNIQUE INDEX idx_mv_kpi_retest 
  ON public.mv_kpi_retest(scale_code, results_version);

-- 3. Clean historical STATE data from psychometrics_external
DELETE FROM public.psychometrics_external 
WHERE scale_code LIKE 'STATE_%';

-- 4. Refresh both views
REFRESH MATERIALIZED VIEW public.mv_kpi_reliability;
REFRESH MATERIALIZED VIEW public.mv_kpi_retest;

-- 5. Bump heartbeat
INSERT INTO public.mv_refresh_log(view_name, refreshed_at)
VALUES 
  ('mv_kpi_reliability', now()),
  ('mv_kpi_retest', now())
ON CONFLICT(view_name) DO UPDATE SET refreshed_at = EXCLUDED.refreshed_at;