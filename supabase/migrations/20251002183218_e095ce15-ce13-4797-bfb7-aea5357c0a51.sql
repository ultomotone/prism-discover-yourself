-- ============================================
-- A) DIF (Differential Item Functioning)
-- ============================================

-- Store DIF analysis results (computed offline by R/Python)
CREATE TABLE IF NOT EXISTS dif_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id integer NOT NULL,
  scale_id text,
  focal_group text NOT NULL,
  reference_group text NOT NULL,
  method text NOT NULL,
  effect_size numeric,
  p_value numeric,
  flag boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dif_results_item ON dif_results(question_id);

-- Materialized view for DIF dashboard
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_fairness_dif CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_fairness_dif AS
WITH tested AS (
  SELECT count(DISTINCT question_id) as items_tested FROM dif_results
),
flags AS (
  SELECT count(*) as flagged_items FROM dif_results WHERE flag IS TRUE
),
by_scale AS (
  SELECT dr.scale_id, 
         count(*) FILTER (WHERE dr.flag) as flagged_items,
         count(*) as items_tested
  FROM dif_results dr 
  GROUP BY dr.scale_id
)
SELECT
  COALESCE((SELECT flagged_items FROM flags), 0) as flagged_items,
  COALESCE((SELECT items_tested FROM tested), 0) as total_items,
  round(100.0 * COALESCE((SELECT flagged_items FROM flags), 0)::numeric / 
        nullif(COALESCE((SELECT items_tested FROM tested), 0), 0), 2) as dif_flag_rate_pct;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_fairness_dif_true ON mv_kpi_fairness_dif((true));

-- ============================================
-- B) Calibration (Prediction Reliability)
-- ============================================

-- Store calibration bins (10-bin reliability curve)
CREATE TABLE IF NOT EXISTS calibration_bins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  results_version text NOT NULL,
  bin_index int NOT NULL,
  p_pred numeric NOT NULL,
  p_obs numeric NOT NULL,
  n int NOT NULL,
  computed_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_calib_bins_ver_bin 
  ON calibration_bins(results_version, bin_index);

-- Store calibration summary metrics
CREATE TABLE IF NOT EXISTS calibration_summary (
  results_version text PRIMARY KEY,
  ece numeric,
  brier numeric,
  computed_at timestamptz DEFAULT now()
);

-- Update existing mv_kpi_calibration to include bins
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_calibration CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_calibration AS
SELECT 
  COALESCE(s.results_version, 'v1.2.1') as results_version,
  s.ece,
  s.brier,
  (SELECT json_agg(t ORDER BY bin_index)
   FROM (SELECT bin_index, p_pred, p_obs, n
         FROM calibration_bins 
         WHERE results_version = COALESCE(s.results_version, 'v1.2.1')) t) as bins,
  -- Keep existing fields for backward compatibility
  avg(p.conf_calibrated) as avg_confidence,
  avg(p.top_gap) as avg_top_gap
FROM calibration_summary s
CROSS JOIN profiles p
WHERE p.results_version = COALESCE(s.results_version, 'v1.2.1')
GROUP BY s.results_version, s.ece, s.brier
UNION ALL
-- Fallback when no calibration_summary exists
SELECT 
  'v1.2.1' as results_version,
  NULL as ece,
  NULL as brier,
  NULL as bins,
  avg(p.conf_calibrated) as avg_confidence,
  avg(p.top_gap) as avg_top_gap
FROM profiles p
WHERE p.results_version = 'v1.2.1'
  AND NOT EXISTS (SELECT 1 FROM calibration_summary);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_calibration_ver 
  ON mv_kpi_calibration(results_version);

-- ============================================
-- C) Enhanced Psychometrics
-- ============================================

-- Split-Half Reliability (Guttman λ₂)
CREATE TABLE IF NOT EXISTS split_half_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_code text NOT NULL,
  results_version text NOT NULL,
  cohort_start date NOT NULL,
  cohort_end date NOT NULL,
  lambda2 numeric,
  n_respondents int,
  created_at timestamptz DEFAULT now()
);

DROP MATERIALIZED VIEW IF EXISTS mv_kpi_split_half CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_split_half AS
SELECT 
  scale_code, 
  results_version,
  avg(lambda2) as lambda2_mean, 
  sum(n_respondents) as n_total
FROM split_half_results 
GROUP BY scale_code, results_version;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_split_half 
  ON mv_kpi_split_half(scale_code, results_version);

-- CFA (Confirmatory Factor Analysis) Fit
CREATE TABLE IF NOT EXISTS cfa_fit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  results_version text NOT NULL,
  cfi numeric,
  tli numeric,
  rmsea numeric,
  srmr numeric,
  n int,
  created_at timestamptz DEFAULT now()
);

DROP MATERIALIZED VIEW IF EXISTS mv_kpi_cfa CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_cfa AS
SELECT model_name, results_version, cfi, tli, rmsea, srmr, n 
FROM cfa_fit;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_cfa 
  ON mv_kpi_cfa(model_name, results_version);

-- Item Discrimination (item-total correlation)
CREATE TABLE IF NOT EXISTS item_discrimination (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id integer NOT NULL,
  scale_code text,
  r_it numeric,
  n int,
  results_version text,
  created_at timestamptz DEFAULT now()
);

DROP MATERIALIZED VIEW IF EXISTS mv_kpi_items_discrimination CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_items_discrimination AS
SELECT 
  scale_code,
  count(*) FILTER (WHERE r_it < 0.20) as low_disc_items,
  count(*) as total_items
FROM item_discrimination
GROUP BY scale_code;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_items_disc 
  ON mv_kpi_items_discrimination(scale_code);

-- Update refresh function to include new MVs
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_fairness_dif;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_fairness_dif', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_split_half;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_split_half', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_cfa;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_cfa', 'error', SQLERRM); END;
  
  BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_items_discrimination;
  EXCEPTION WHEN OTHERS THEN v_errors := v_errors || jsonb_build_object('view', 'mv_kpi_items_discrimination', 'error', SQLERRM); END;
  
  RETURN jsonb_build_object(
    'success', true, 
    'duration_ms', EXTRACT(EPOCH FROM (now() - v_start)) * 1000, 
    'errors', v_errors, 
    'timestamp', now()
  );
END
$function$;