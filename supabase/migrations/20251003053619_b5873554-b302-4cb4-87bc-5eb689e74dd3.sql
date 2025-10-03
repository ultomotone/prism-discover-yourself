-- A1) Safe view: map scales (by tag) to questions
CREATE OR REPLACE VIEW public.v_scale_items_by_tag AS
SELECT
  sk.tag AS scale_tag,
  sk.question_id AS question_id,
  COALESCE(sk.weight, 0) AS weight
FROM public.assessment_scoring_key sk
JOIN public.assessment_questions q ON q.id = sk.question_id
WHERE COALESCE(q.required, true) = true;

-- A2) Per-session scale scores
CREATE OR REPLACE VIEW public.v_scale_scores AS
WITH coverage AS (
  SELECT scale_tag, COUNT(DISTINCT question_id) AS k_total
  FROM v_scale_items_by_tag GROUP BY 1
),
resp AS (
  SELECT r.session_id, r.question_id, r.answer_numeric::numeric AS x
  FROM public.assessment_responses r
  WHERE r.answer_numeric BETWEEN 1 AND 5
),
joined AS (
  SELECT
    resp.session_id,
    map.scale_tag,
    map.question_id,
    CASE WHEN map.weight < 0 THEN (6 - resp.x) ELSE resp.x END AS x_adj
  FROM resp
  JOIN v_scale_items_by_tag map ON map.question_id = resp.question_id
),
per_session AS (
  SELECT
    j.session_id, j.scale_tag,
    COUNT(*) AS k_used,
    MAX(c.k_total) AS k_total,
    AVG(j.x_adj) AS mean_raw_1_5
  FROM joined j
  JOIN coverage c ON c.scale_tag = j.scale_tag
  GROUP BY j.session_id, j.scale_tag
)
SELECT
  session_id, scale_tag, k_used, k_total,
  (k_used::numeric / NULLIF(k_total,0)) AS completeness,
  mean_raw_1_5,
  ROUND(100 * (mean_raw_1_5 - 1) / 4, 2) AS idx_0_100
FROM per_session
WHERE (k_used::numeric / NULLIF(k_total,0)) >= 0.70;

-- A3) Scale correlations
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_scale_corr CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_scale_corr AS
WITH z AS (
  SELECT scale_tag, AVG(mean_raw_1_5) AS mu, STDDEV_POP(mean_raw_1_5) AS sd
  FROM v_scale_scores GROUP BY 1
),
zscores AS (
  SELECT s.session_id, s.scale_tag, (s.mean_raw_1_5 - z.mu) / NULLIF(z.sd,0) AS zval
  FROM v_scale_scores s JOIN z ON z.scale_tag = s.scale_tag
)
SELECT a.scale_tag AS scale_a, b.scale_tag AS scale_b,
       corr(a.zval, b.zval) AS r, COUNT(*) AS n_pairs
FROM zscores a JOIN zscores b ON b.session_id = a.session_id AND b.scale_tag > a.scale_tag
GROUP BY 1,2;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_scale_corr ON public.mv_kpi_scale_corr(scale_a, scale_b);

-- A4) New tables
CREATE TABLE IF NOT EXISTS public.cfa_loadings (
  results_version text NOT NULL,
  scale_tag text NOT NULL,
  question_id bigint NOT NULL,
  lambda_std numeric,
  theta numeric,
  PRIMARY KEY (results_version, scale_tag, question_id)
);

CREATE TABLE IF NOT EXISTS public.external_anchor_scores (
  session_id uuid NOT NULL,
  scale_tag text NOT NULL,
  anchor_code text NOT NULL,
  value_numeric numeric,
  PRIMARY KEY(session_id, scale_tag, anchor_code)
);

CREATE TABLE IF NOT EXISTS public.invariance_results (
  results_version text NOT NULL,
  level text NOT NULL,
  delta_cfi numeric,
  delta_rmsea numeric,
  pass boolean,
  PRIMARY KEY(results_version, level)
);

ALTER TABLE public.psychometrics_external
  ADD COLUMN IF NOT EXISTS omega_total numeric,
  ADD COLUMN IF NOT EXISTS alpha numeric;

-- A5) AVE / CR
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_ave_cr CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_ave_cr AS
WITH L AS (
  SELECT results_version, scale_tag, question_id,
         lambda_std::numeric AS l, theta::numeric AS th
  FROM public.cfa_loadings
),
prim AS (
  SELECT results_version, question_id, scale_tag AS primary_factor, l AS primary_l
  FROM (
    SELECT results_version, question_id, scale_tag, l,
           ROW_NUMBER() OVER (PARTITION BY results_version, question_id ORDER BY ABS(l) DESC) rn
    FROM L
  ) t WHERE rn=1
),
xload AS (
  SELECT l.results_version, p.primary_factor AS scale_tag, l.question_id,
         MAX(CASE WHEN l.scale_tag <> p.primary_factor AND ABS(l.l) > 0.30 THEN 1 ELSE 0 END)::int AS has_xload
  FROM L l
  JOIN prim p ON p.results_version=l.results_version AND p.question_id=l.question_id
  GROUP BY 1,2,3
),
agg AS (
  SELECT
    L.results_version, L.scale_tag,
    COUNT(*) AS k,
    SUM(L.l*L.l) AS sum_l2,
    SUM(L.l) AS sum_l,
    SUM(L.th) AS sum_theta,
    AVG(CASE WHEN ABS(L.l) >= 0.40 THEN 1 ELSE 0 END)*100 AS pct_load_ge_40,
    AVG(CASE WHEN ABS(L.l) >= 0.60 THEN 1 ELSE 0 END)*100 AS pct_load_ge_60,
    AVG(x.has_xload)::numeric*100 AS pct_crossloading_gt_30
  FROM L
  LEFT JOIN xload x ON x.results_version=L.results_version AND x.scale_tag=L.scale_tag AND x.question_id=L.question_id
  GROUP BY L.results_version, L.scale_tag
)
SELECT
  results_version, scale_tag, k,
  (sum_l2 / NULLIF(k,0))::numeric(10,4) AS ave,
  ((sum_l*sum_l) / NULLIF((sum_l*sum_l + sum_theta),0))::numeric(10,4) AS cr,
  pct_load_ge_40::numeric(10,2) AS pct_load_ge_40,
  pct_load_ge_60::numeric(10,2) AS pct_load_ge_60,
  pct_crossloading_gt_30::numeric(10,2) AS pct_crossloading_gt_30
FROM agg;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_ave_cr ON public.mv_kpi_ave_cr(results_version, scale_tag);

-- A6) Internal
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_internal CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_internal AS
WITH coverage AS (
  SELECT scale_tag, COUNT(DISTINCT question_id) AS n_items
  FROM v_scale_items_by_tag GROUP BY 1
),
itemq AS (
  SELECT scale_code AS scale_tag,
         PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY r_it) AS r_it_median,
         AVG(CASE WHEN r_it < .20 THEN 1 ELSE 0 END)*100 AS pct_items_low
  FROM public.psychometrics_item_stats
  WHERE results_version='v1.2.1'
  GROUP BY 1
)
SELECT
  c.scale_tag, c.n_items,
  pe.split_half_sb, pe.omega_total, pe.alpha,
  iq.r_it_median, iq.pct_items_low
FROM coverage c
LEFT JOIN public.psychometrics_external pe ON pe.results_version='v1.2.1' AND pe.scale_code=c.scale_tag
LEFT JOIN itemq iq ON iq.scale_tag=c.scale_tag;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_internal ON public.mv_kpi_internal(scale_tag);

-- A7) External (fixed nested aggregates)
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_external CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_external AS
WITH s AS ( SELECT session_id, scale_tag, mean_raw_1_5 FROM v_scale_scores ),
conv AS (
  SELECT a.scale_tag,
         corr(s.mean_raw_1_5, a.value_numeric) AS convergent_r,
         COUNT(*) AS n_pair
  FROM external_anchor_scores a
  JOIN s ON s.session_id=a.session_id AND s.scale_tag=a.scale_tag
  GROUP BY 1
),
disc_pairs AS (
  SELECT sc1.scale_tag AS scale_a, sc2.scale_tag AS scale_b,
         corr(sc1.mean_raw_1_5, sc2.mean_raw_1_5) AS r
  FROM s sc1
  JOIN s sc2 ON sc2.session_id=sc1.session_id AND sc2.scale_tag<>sc1.scale_tag
  GROUP BY sc1.scale_tag, sc2.scale_tag
),
disc AS (
  SELECT scale_a AS scale_tag, MAX(ABS(r)) AS max_non_target_r
  FROM disc_pairs
  GROUP BY scale_a
)
SELECT COALESCE(conv.scale_tag, disc.scale_tag) AS scale_tag,
       conv.convergent_r, conv.n_pair,
       disc.max_non_target_r
FROM disc
FULL JOIN conv ON conv.scale_tag=disc.scale_tag;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_external ON public.mv_kpi_external(scale_tag);

-- A8) Stability
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_stability CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_stability AS
SELECT
  scale_code AS scale_tag,
  AVG(r_pearson)::numeric(10,3) AS retest_r,
  COUNT(*) AS n_pairs
FROM public.psychometrics_retest_pairs
WHERE results_version='v1.2.1' AND days_between BETWEEN 14 AND 180
GROUP BY 1;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_stability ON public.mv_kpi_stability(scale_tag);

-- A9) Norms
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_scale_norms CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_scale_norms AS
WITH base AS (SELECT scale_tag, idx_0_100 FROM v_scale_scores)
SELECT
  scale_tag,
  PERCENTILE_CONT(0.05) WITHIN GROUP(ORDER BY idx_0_100) AS p05,
  PERCENTILE_CONT(0.10) WITHIN GROUP(ORDER BY idx_0_100) AS p10,
  PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY idx_0_100) AS p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP(ORDER BY idx_0_100) AS p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY idx_0_100) AS p75,
  PERCENTILE_CONT(0.90) WITHIN GROUP(ORDER BY idx_0_100) AS p90,
  PERCENTILE_CONT(0.95) WITHIN GROUP(ORDER BY idx_0_100) AS p95
FROM base GROUP BY 1;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_scale_norms ON public.mv_kpi_scale_norms(scale_tag);

-- A10) Invariance (fixed boolean aggregation)
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_invariance CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_invariance AS
SELECT
  results_version,
  bool_or(CASE WHEN level='configural' THEN pass ELSE false END) AS pass_configural,
  bool_or(CASE WHEN level='metric' THEN pass ELSE false END) AS pass_metric,
  bool_or(CASE WHEN level='scalar' THEN pass ELSE false END) AS pass_scalar
FROM public.invariance_results
GROUP BY 1;

-- A11) Neuroticism
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_neuroticism CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_neuroticism AS
WITH n_scores AS ( SELECT * FROM v_scale_scores WHERE scale_tag='N' ),
n_stats AS (
  SELECT COUNT(*) AS n_resp,
         AVG(mean_raw_1_5)::numeric(10,3) AS mean_raw_1_5,
         STDDEV_POP(mean_raw_1_5)::numeric(10,3) AS sd_raw_1_5,
         AVG(idx_0_100)::numeric(10,2) AS mean_idx_0_100
  FROM n_scores
),
rel AS (
  SELECT pe.results_version, pe.scale_code, pe.alpha, pe.omega_total, pe.split_half_sb
  FROM public.psychometrics_external pe
  WHERE pe.scale_code='N' AND pe.results_version='v1.2.1' LIMIT 1
),
items AS (
  SELECT AVG(CASE WHEN r_it < 0.20 THEN 1 ELSE 0 END)*100.0 AS pct_items_low, COUNT(*) AS n_items
  FROM public.psychometrics_item_stats
  WHERE results_version='v1.2.1' AND scale_code='N'
),
retest AS (
  SELECT AVG(r_pearson)::numeric(10,3) AS retest_r, COUNT(*) AS n_pairs
  FROM public.psychometrics_retest_pairs
  WHERE results_version='v1.2.1' AND scale_code='N' AND days_between BETWEEN 14 AND 180
),
discr AS (
  SELECT MAX(ABS(r)) AS max_abs_corr,
         (array_agg(CASE WHEN scale_a='N' THEN scale_b ELSE scale_a END ORDER BY ABS(r) DESC))[1] AS max_corr_with
  FROM (
    SELECT scale_a, scale_b, r, n_pairs FROM mv_kpi_scale_corr WHERE scale_a='N'
    UNION ALL
    SELECT scale_b AS scale_a, scale_a AS scale_b, r, n_pairs FROM mv_kpi_scale_corr WHERE scale_b='N'
  ) u
),
avecr AS (
  SELECT ave, cr FROM mv_kpi_ave_cr WHERE results_version='v1.2.1' AND scale_tag='N' LIMIT 1
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
  CASE WHEN ac.ave IS NULL OR d.max_abs_corr IS NULL THEN NULL
       ELSE (ac.ave > (d.max_abs_corr*d.max_abs_corr)) END AS fornell_larcker_pass
FROM n_stats ns
LEFT JOIN rel ON TRUE
LEFT JOIN items it ON TRUE
LEFT JOIN retest rt ON TRUE
LEFT JOIN discr d ON TRUE
LEFT JOIN avecr ac ON TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_neuroticism ON public.mv_kpi_neuroticism(results_version, scale_tag);

-- A12) Release gates
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_release_gates CASCADE;
CREATE MATERIALIZED VIEW public.mv_kpi_release_gates AS
WITH i AS (SELECT * FROM mv_kpi_internal),
s AS (SELECT * FROM mv_kpi_stability),
e AS (SELECT * FROM mv_kpi_external),
a AS (SELECT * FROM mv_kpi_ave_cr WHERE results_version='v1.2.1')
SELECT
  i.scale_tag,
  i.n_items, i.split_half_sb, i.omega_total, i.alpha,
  i.r_it_median, i.pct_items_low,
  e.convergent_r, e.max_non_target_r,
  s.retest_r, s.n_pairs,
  a.ave, a.cr,
  (COALESCE(i.omega_total, 0) >= 0.75 OR COALESCE(i.split_half_sb,0) >= 0.70) AS pass_reliability,
  (COALESCE(i.r_it_median,0) >= 0.30 AND COALESCE(i.pct_items_low,100) <= 10) AS pass_item_quality,
  (COALESCE(e.convergent_r, 0) >= 0.60 OR COALESCE(a.ave,0) >= 0.50) AS pass_validity,
  (COALESCE(s.retest_r, 0) >= 0.70 OR s.retest_r IS NULL) AS pass_stability,
  (
    (COALESCE(i.omega_total, 0) >= 0.75 OR COALESCE(i.split_half_sb,0) >= 0.70)
    AND (COALESCE(i.r_it_median,0) >= 0.30 AND COALESCE(i.pct_items_low,100) <= 10)
    AND (COALESCE(e.convergent_r, 0) >= 0.60 OR COALESCE(a.ave,0) >= 0.50)
    AND (COALESCE(s.retest_r, 0) >= 0.70 OR s.retest_r IS NULL)
  ) AS release_ready
FROM i
LEFT JOIN s ON s.scale_tag=i.scale_tag
LEFT JOIN e ON e.scale_tag=i.scale_tag
LEFT JOIN a ON a.scale_tag=i.scale_tag;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_release_gates ON public.mv_kpi_release_gates(scale_tag);

-- A13) Update refresh function
CREATE OR REPLACE FUNCTION public.refresh_psych_kpis()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scale_corr; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_ave_cr; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_internal; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_external; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_stability; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scale_norms; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_neuroticism; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_release_gates; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_invariance; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_engagement; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_construct_coverage; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_retest; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_post_survey; EXCEPTION WHEN undefined_table THEN NULL; END;
END$$;

REVOKE ALL ON FUNCTION public.refresh_psych_kpis() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_psych_kpis() TO anon, authenticated, service_role;