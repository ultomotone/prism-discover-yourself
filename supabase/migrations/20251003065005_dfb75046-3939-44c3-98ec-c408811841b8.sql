-- Phase 1: Fix mv_kpi_neuroticism with LIMIT 1 to prevent duplicates

DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_neuroticism CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_neuroticism AS
WITH base AS (
  SELECT 'v1.2.1'::text AS results_version
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
  COALESCE(i.n_sessions, 0) AS n_sessions,
  NULL::numeric AS mean_raw,
  NULL::numeric AS sd_raw,
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
LEFT JOIN internal i ON i.results_version = b.results_version
LEFT JOIN items it ON it.results_version = b.results_version
LEFT JOIN retest r ON r.results_version = b.results_version
LEFT JOIN avecr a ON a.results_version = b.results_version
LIMIT 1;

CREATE UNIQUE INDEX idx_mv_kpi_neuroticism ON public.mv_kpi_neuroticism(results_version);

REFRESH MATERIALIZED VIEW public.mv_kpi_neuroticism;

-- Ensure CFA tables exist
CREATE TABLE IF NOT EXISTS public.cfa_loadings(
  results_version text NOT NULL,
  scale_tag text NOT NULL,
  question_id bigint NOT NULL,
  lambda_std numeric,
  theta numeric,
  PRIMARY KEY(results_version, scale_tag, question_id)
);

CREATE TABLE IF NOT EXISTS public.cfa_fit(
  results_version text PRIMARY KEY,
  n int,
  cfi numeric,
  tli numeric,
  rmsea numeric,
  rmsea_lo numeric,
  rmsea_hi numeric,
  srmr numeric,
  computed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invariance_results(
  results_version text NOT NULL,
  level text NOT NULL,
  delta_cfi numeric,
  delta_rmsea numeric,
  pass boolean,
  PRIMARY KEY(results_version, level)
);

GRANT SELECT ON public.cfa_loadings TO anon, authenticated;
GRANT SELECT ON public.cfa_fit TO anon, authenticated;
GRANT SELECT ON public.invariance_results TO anon, authenticated;