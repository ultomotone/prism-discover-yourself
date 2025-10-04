-- Fix NULL scale_tag entries and duplicate cohort data in mv_kpi_internal
-- Multiple cohorts per scale cause duplicate rows, NULL scale_tags cause React key warnings

-- Drop existing views and indexes
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_release_gates CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_internal CASCADE;
DROP INDEX IF EXISTS public.idx_mv_kpi_internal;
DROP INDEX IF EXISTS public.idx_mv_kpi_release_gates;

-- Recreate mv_kpi_internal with NULL filter and latest cohort aggregation
CREATE MATERIALIZED VIEW public.mv_kpi_internal AS
WITH coverage AS (
  SELECT scale_tag, COUNT(DISTINCT question_id) AS n_items
  FROM v_scale_items_by_tag 
  WHERE scale_tag IS NOT NULL  -- Exclude NULL scale tags
  GROUP BY 1
),
itemq AS (
  SELECT scale_code AS scale_tag,
         PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY r_it) AS r_it_median,
         AVG(CASE WHEN r_it < .20 THEN 1 ELSE 0 END)*100 AS pct_items_low
  FROM public.psychometrics_item_stats
  WHERE results_version='v1.2.1'
  GROUP BY 1
),
latest_reliability AS (
  SELECT DISTINCT ON (scale_code)
    scale_code AS scale_tag,
    split_half_sb,
    omega_total,
    alpha
  FROM public.psychometrics_external
  WHERE results_version='v1.2.1'
  ORDER BY scale_code, cohort_end DESC
)
SELECT
  c.scale_tag, 
  c.n_items,
  lr.split_half_sb, 
  lr.omega_total, 
  lr.alpha,
  iq.r_it_median, 
  iq.pct_items_low
FROM coverage c
LEFT JOIN latest_reliability lr ON lr.scale_tag = c.scale_tag
LEFT JOIN itemq iq ON iq.scale_tag = c.scale_tag;

-- Recreate mv_kpi_release_gates (depends on mv_kpi_internal)
CREATE MATERIALIZED VIEW public.mv_kpi_release_gates AS
WITH base AS (
  SELECT 
    i.scale_tag,
    i.n_items,
    i.split_half_sb,
    i.omega_total,
    i.alpha,
    i.r_it_median,
    i.pct_items_low,
    e.convergent_r,
    e.max_non_target_r,
    s.retest_r,
    s.n_pairs AS retest_n_pairs,
    a.ave,
    a.cr
  FROM public.mv_kpi_internal i
  LEFT JOIN public.mv_kpi_external e ON e.scale_tag = i.scale_tag
  LEFT JOIN public.mv_kpi_stability s ON s.scale_tag = i.scale_tag
  LEFT JOIN public.mv_kpi_ave_cr a ON a.scale_tag = i.scale_tag AND a.results_version = 'v1.2.1'
)
SELECT
  scale_tag,
  n_items,
  split_half_sb,
  omega_total,
  alpha,
  r_it_median,
  pct_items_low,
  convergent_r,
  max_non_target_r,
  retest_r,
  retest_n_pairs,
  ave,
  cr,
  (COALESCE(omega_total, 0) >= 0.75 OR COALESCE(split_half_sb, 0) >= 0.70) AS pass_reliability,
  (COALESCE(r_it_median, 0) >= 0.30 AND COALESCE(pct_items_low, 100) <= 10) AS pass_item_quality,
  (COALESCE(convergent_r, 0) >= 0.60 OR COALESCE(ave, 0) >= 0.50) AS pass_validity,
  (COALESCE(retest_r, 0) >= 0.70 OR retest_r IS NULL) AS pass_stability,
  (
    (COALESCE(omega_total, 0) >= 0.75 OR COALESCE(split_half_sb, 0) >= 0.70)
    AND (COALESCE(r_it_median, 0) >= 0.30 AND COALESCE(pct_items_low, 100) <= 10)
    AND (COALESCE(convergent_r, 0) >= 0.60 OR COALESCE(ave, 0) >= 0.50)
    AND (COALESCE(retest_r, 0) >= 0.70 OR retest_r IS NULL)
  ) AS release_ready
FROM base;

-- Create indexes after views are populated
CREATE UNIQUE INDEX idx_mv_kpi_internal ON public.mv_kpi_internal(scale_tag);
CREATE UNIQUE INDEX idx_mv_kpi_release_gates ON public.mv_kpi_release_gates(scale_tag);

-- Update refresh log
INSERT INTO public.mv_refresh_log(view_name, refreshed_at)
VALUES 
  ('mv_kpi_internal', now()),
  ('mv_kpi_release_gates', now())
ON CONFLICT(view_name) DO UPDATE SET refreshed_at = EXCLUDED.refreshed_at;