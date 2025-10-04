-- Fix mv_kpi_neuroticism to compute mean_raw and sd_raw from actual data
-- Root cause: Previous migration hardcoded NULL values instead of aggregating from v_scale_scores

DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_neuroticism CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_neuroticism AS
WITH base AS (
  SELECT 'v1.2.1'::text AS results_version, 'N'::text AS scale_tag
),
-- Add distribution stats from v_scale_scores
distribution AS (
  SELECT 
    scale_tag,
    AVG(mean_raw_1_5) AS mean_raw,
    STDDEV(mean_raw_1_5) AS sd_raw,
    COUNT(*) AS n_sessions_dist
  FROM public.v_scale_scores
  WHERE scale_tag = 'N' AND completeness >= 0.90
  GROUP BY scale_tag
),
internal AS (
  SELECT 
    pe.results_version,
    pe.scale_code,
    pe.n_respondents AS n_sessions,
    pe.cronbach_alpha,
    pe.mcdonald_omega,
    pe.split_half_sb AS split_half,
    pe.split_half_n
  FROM public.psychometrics_external pe
  WHERE pe.scale_code = 'N' AND pe.results_version = 'v1.2.1'
  ORDER BY pe.cohort_end DESC
  LIMIT 1
),
items AS (
  SELECT 
    results_version,
    scale_code,
    AVG(r_it) AS mean_r_it,
    MIN(r_it) AS min_r_it,
    COUNT(*) AS n_items
  FROM public.psychometrics_item_stats
  WHERE scale_code = 'N' AND results_version = 'v1.2.1'
  GROUP BY results_version, scale_code
),
retest AS (
  SELECT 
    results_version,
    scale_code,
    r_pearson AS r_retest,
    days_between AS retest_days,
    n_items AS retest_n
  FROM public.psychometrics_retest_pairs
  WHERE scale_code = 'N' 
    AND results_version = 'v1.2.1'
    AND days_between BETWEEN 14 AND 180
  ORDER BY days_between
  LIMIT 1
),
avecr AS (
  SELECT 
    results_version,
    scale_tag,
    ave,
    cr,
    pct_load_ge_40,
    pct_load_ge_60,
    pct_crossloading_gt_30
  FROM public.mv_kpi_ave_cr
  WHERE scale_tag = 'N' AND results_version = 'v1.2.1'
  LIMIT 1
)
SELECT
  b.results_version,
  COALESCE(i.n_sessions, d.n_sessions_dist, 0) AS n_sessions,
  d.mean_raw,
  d.sd_raw,
  i.cronbach_alpha,
  i.mcdonald_omega,
  i.split_half,
  i.split_half_n,
  it.mean_r_it,
  it.min_r_it,
  it.n_items,
  r.r_retest,
  r.retest_days,
  r.retest_n,
  a.ave,
  a.cr,
  a.pct_load_ge_40,
  a.pct_load_ge_60,
  a.pct_crossloading_gt_30,
  CASE 
    WHEN a.ave IS NOT NULL AND a.ave > 0.50 THEN true 
    ELSE NULL 
  END AS fornell_larcker_pass
FROM base b
LEFT JOIN distribution d ON d.scale_tag = b.scale_tag
LEFT JOIN internal i ON i.results_version = b.results_version
LEFT JOIN items it ON it.results_version = b.results_version AND it.scale_code = b.scale_tag
LEFT JOIN retest r ON r.results_version = b.results_version AND r.scale_code = b.scale_tag
LEFT JOIN avecr a ON a.results_version = b.results_version AND a.scale_tag = b.scale_tag
LIMIT 1;

CREATE UNIQUE INDEX idx_mv_kpi_neuroticism ON public.mv_kpi_neuroticism(results_version);

REFRESH MATERIALIZED VIEW public.mv_kpi_neuroticism;

-- Grant permissions
GRANT SELECT ON public.mv_kpi_neuroticism TO anon, authenticated, service_role;