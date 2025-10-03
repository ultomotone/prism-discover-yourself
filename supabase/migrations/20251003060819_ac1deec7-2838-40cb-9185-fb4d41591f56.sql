-- IR-07C: Enable Neuroticism & Create Missing Psychometric MVs
-- Fixes: v_scale_items_by_tag to include optional items (N scale)
-- Creates: mv_kpi_scale_corr, mv_kpi_external, mv_kpi_neuroticism, mv_kpi_scale_norms, mv_kpi_release_gates
-- Updates: refresh_psych_kpis() to include all new MVs

-- ============================================================
-- STEP 1: Fix v_scale_items_by_tag (remove required filter)
-- ============================================================
CREATE OR REPLACE VIEW public.v_scale_items_by_tag AS
SELECT
  sk.tag AS scale_tag,
  sk.question_id,
  COALESCE(sk.weight, 0) AS weight
FROM public.assessment_scoring_key sk
JOIN public.assessment_questions q ON q.id = sk.question_id
-- Only exclude deprecated items, NOT optional ones
WHERE COALESCE(q.clarity_status, 'ok') != 'deprecated';

-- ============================================================
-- STEP 2: Create mv_kpi_scale_corr (Scale Correlations)
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_scale_corr CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_scale_corr AS
WITH z AS (
  SELECT scale_tag, AVG(mean_raw_1_5) AS mu, STDDEV_POP(mean_raw_1_5) AS sd
  FROM public.v_scale_scores 
  WHERE mean_raw_1_5 IS NOT NULL
  GROUP BY scale_tag
),
zscores AS (
  SELECT s.session_id, s.scale_tag, 
    (s.mean_raw_1_5 - z.mu) / NULLIF(z.sd, 0) AS zval
  FROM public.v_scale_scores s
  JOIN z ON z.scale_tag = s.scale_tag
  WHERE s.mean_raw_1_5 IS NOT NULL
)
SELECT 
  a.scale_tag AS scale_a,
  b.scale_tag AS scale_b,
  corr(a.zval, b.zval) AS r,
  COUNT(*) AS n_pairs
FROM zscores a
JOIN zscores b ON b.session_id = a.session_id AND b.scale_tag > a.scale_tag
GROUP BY a.scale_tag, b.scale_tag;

CREATE UNIQUE INDEX idx_mv_kpi_scale_corr ON public.mv_kpi_scale_corr(scale_a, scale_b);

-- ============================================================
-- STEP 3: Create mv_kpi_external (External Validity)
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_external CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_external AS
WITH anchor_corr AS (
  SELECT 
    s.scale_tag,
    a.anchor_code,
    corr(s.mean_raw_1_5, a.value_numeric) AS r,
    COUNT(*) AS n_pairs
  FROM public.v_scale_scores s
  JOIN public.external_anchor_scores a ON a.session_id = s.session_id AND a.scale_tag = s.scale_tag
  WHERE s.mean_raw_1_5 IS NOT NULL AND a.value_numeric IS NOT NULL
  GROUP BY s.scale_tag, a.anchor_code
)
SELECT 
  scale_tag,
  MAX(r) FILTER (WHERE anchor_code LIKE '%target%' OR anchor_code LIKE '%convergent%') AS convergent_r,
  MAX(ABS(r)) FILTER (WHERE anchor_code NOT LIKE '%target%' AND anchor_code NOT LIKE '%convergent%') AS max_non_target_r,
  COUNT(DISTINCT anchor_code) AS n_anchors
FROM anchor_corr
GROUP BY scale_tag;

CREATE UNIQUE INDEX idx_mv_kpi_external ON public.mv_kpi_external(scale_tag);

-- ============================================================
-- STEP 4: Create mv_kpi_neuroticism (Deep-Dive KPIs)
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_neuroticism CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_neuroticism AS
WITH n_scores AS (
  SELECT * FROM public.v_scale_scores WHERE scale_tag = 'N'
),
n_stats AS (
  SELECT 
    COUNT(*) AS n_resp,
    AVG(mean_raw_1_5)::numeric(10,3) AS mean_raw_1_5,
    STDDEV_POP(mean_raw_1_5)::numeric(10,3) AS sd_raw_1_5,
    AVG(idx_0_100)::numeric(10,2) AS mean_idx_0_100
  FROM n_scores
  WHERE mean_raw_1_5 IS NOT NULL
),
rel AS (
  SELECT alpha, omega_total, split_half_sb
  FROM public.psychometrics_external
  WHERE scale_code = 'N' AND results_version = 'v1.2.1'
  ORDER BY created_at DESC LIMIT 1
),
items AS (
  SELECT 
    AVG(CASE WHEN r_it < 0.20 THEN 1.0 ELSE 0.0 END) * 100.0 AS pct_items_low,
    COUNT(*) AS n_items
  FROM public.psychometrics_item_stats
  WHERE scale_code = 'N' AND results_version = 'v1.2.1'
),
retest AS (
  SELECT 
    AVG(r_pearson)::numeric(10,3) AS retest_r,
    COUNT(*) AS n_pairs
  FROM public.psychometrics_retest_pairs
  WHERE scale_code = 'N' 
    AND results_version = 'v1.2.1'
    AND days_between BETWEEN 14 AND 180
),
discr AS (
  SELECT 
    MAX(ABS(r)) AS max_abs_corr,
    (ARRAY_AGG(scale_b ORDER BY ABS(r) DESC))[1] AS max_corr_with
  FROM (
    SELECT scale_b, r FROM public.mv_kpi_scale_corr WHERE scale_a = 'N'
    UNION ALL
    SELECT scale_a AS scale_b, r FROM public.mv_kpi_scale_corr WHERE scale_b = 'N'
  ) u
),
avecr AS (
  SELECT ave, cr 
  FROM public.mv_kpi_ave_cr 
  WHERE scale_tag = 'N' AND results_version = 'v1.2.1'
  LIMIT 1
)
SELECT
  'v1.2.1'::text AS results_version,
  'N'::text AS scale_tag,
  ns.n_resp, ns.mean_raw_1_5, ns.sd_raw_1_5, ns.mean_idx_0_100,
  rel.alpha, rel.omega_total, rel.split_half_sb,
  it.pct_items_low, it.n_items,
  rt.retest_r, rt.n_pairs,
  d.max_abs_corr, d.max_corr_with,
  ac.ave, ac.cr,
  CASE 
    WHEN ac.ave IS NULL OR d.max_abs_corr IS NULL THEN NULL
    ELSE (ac.ave > (d.max_abs_corr * d.max_abs_corr))
  END AS fornell_larcker_pass
FROM n_stats ns
CROSS JOIN rel
CROSS JOIN items it
CROSS JOIN retest rt
CROSS JOIN discr d
CROSS JOIN avecr ac;

CREATE UNIQUE INDEX idx_mv_kpi_neuroticism ON public.mv_kpi_neuroticism(results_version, scale_tag);

-- ============================================================
-- STEP 5: Create mv_kpi_scale_norms (Percentile Norms)
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_scale_norms CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_scale_norms AS
SELECT
  scale_tag,
  PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY idx_0_100) AS p05,
  PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY idx_0_100) AS p10,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY idx_0_100) AS p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY idx_0_100) AS p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY idx_0_100) AS p75,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY idx_0_100) AS p90,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY idx_0_100) AS p95,
  COUNT(*) AS n_scores
FROM public.v_scale_scores
WHERE idx_0_100 IS NOT NULL
GROUP BY scale_tag;

CREATE UNIQUE INDEX idx_mv_kpi_scale_norms ON public.mv_kpi_scale_norms(scale_tag);

-- ============================================================
-- STEP 6: Create mv_kpi_release_gates (Component Quality Gates)
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_release_gates CASCADE;

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

CREATE UNIQUE INDEX idx_mv_kpi_release_gates ON public.mv_kpi_release_gates(scale_tag);

-- ============================================================
-- STEP 7: Update refresh_psych_kpis Function
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_psych_kpis()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Core psychometric MVs (order matters - dependencies)
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scale_corr; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_internal; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_external; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_ave_cr; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_stability; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_invariance; EXCEPTION WHEN OTHERS THEN NULL; END;
  
  -- KPI displays (depend on core MVs above)
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_neuroticism; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scale_norms; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_release_gates; EXCEPTION WHEN OTHERS THEN NULL; END;
  
  -- Other existing MVs
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_engagement; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_construct_coverage; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_retest; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_post_survey; EXCEPTION WHEN OTHERS THEN NULL; END;
END$$;

REVOKE ALL ON FUNCTION public.refresh_psych_kpis() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_psych_kpis() TO anon, authenticated, service_role;

-- ============================================================
-- STEP 8: Grant Permissions on New MVs
-- ============================================================
GRANT SELECT ON public.mv_kpi_scale_corr TO anon, authenticated, service_role;
GRANT SELECT ON public.mv_kpi_external TO anon, authenticated, service_role;
GRANT SELECT ON public.mv_kpi_neuroticism TO anon, authenticated, service_role;
GRANT SELECT ON public.mv_kpi_scale_norms TO anon, authenticated, service_role;
GRANT SELECT ON public.mv_kpi_release_gates TO anon, authenticated, service_role;

-- ============================================================
-- STEP 9: Verification Queries
-- ============================================================
-- Verify Neuroticism items are now included
SELECT 'v_scale_items_by_tag N count' AS check_name, COUNT(*)::text AS result
FROM public.v_scale_items_by_tag WHERE scale_tag = 'N'
UNION ALL
-- Verify scale correlations populated
SELECT 'mv_kpi_scale_corr count', COUNT(*)::text
FROM public.mv_kpi_scale_corr
UNION ALL
-- Verify neuroticism KPI exists
SELECT 'mv_kpi_neuroticism exists', CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END
FROM public.mv_kpi_neuroticism
UNION ALL
-- Verify scale norms N exists
SELECT 'mv_kpi_scale_norms N exists', CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END
FROM public.mv_kpi_scale_norms WHERE scale_tag = 'N'
UNION ALL
-- Verify release gates populated
SELECT 'mv_kpi_release_gates count', COUNT(*)::text
FROM public.mv_kpi_release_gates;