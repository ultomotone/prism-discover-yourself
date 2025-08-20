-- Fix NaN and >100% issues in KPI cards and Latest Assessments
-- Drop and recreate views to fix column structure issues

-- 1. Drop existing view first to avoid column drop error
DROP VIEW IF EXISTS public.v_latest_assessments_v11;

-- 2. Create the v1.1 latest-assessments view with consistent numeric fits
CREATE VIEW public.v_latest_assessments_v11 AS
SELECT
  p.created_at as finished_at,
  p.session_id,
  -- Get country from assessment responses safely
  COALESCE(
    (SELECT ar.answer_value 
     FROM assessment_responses ar 
     JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
     WHERE ar.session_id = p.session_id 
     AND ar.question_id = (sc.value->>'id')::integer
     LIMIT 1), 
    'Unknown'
  ) as country,
  p.type_code,
  -- Pick calibrated fit first, then raw, ensure numeric
  COALESCE(p.score_fit_calibrated, p.score_fit_raw)::numeric as fit_value,
  -- Band computed server-side to avoid FE drift
  CASE 
    WHEN COALESCE(p.score_fit_calibrated, p.score_fit_raw) >= 70 THEN 'High'
    WHEN COALESCE(p.score_fit_calibrated, p.score_fit_raw) >= 55 THEN 'Moderate'
    WHEN COALESCE(p.score_fit_calibrated, p.score_fit_raw) IS NULL THEN NULL
    ELSE 'Low'
  END as fit_band,
  p.results_version as version,
  p.confidence,
  p.overlay,
  -- Add share_pct for compatibility
  CASE 
    WHEN p.top_types IS NOT NULL 
         AND jsonb_array_length(p.top_types) > 0 
         AND p.type_scores IS NOT NULL 
    THEN COALESCE(
      (p.type_scores->(p.top_types->>0)->>'share_pct')::numeric, 
      0
    )
    ELSE 0
  END as share_pct,
  p.invalid_combo_flag
FROM profiles p
WHERE p.results_version = 'v1.1'
ORDER BY p.created_at DESC;

-- 3. Create KPI overview view with safe division and proper bounds
CREATE OR REPLACE VIEW public.v_kpi_overview_30d_v11 AS
WITH base AS (
  SELECT *
  FROM profiles
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND results_version = 'v1.1'
),
dedup AS (
  -- Remove invalid combos and duplicates
  SELECT * FROM base
  WHERE COALESCE(invalid_combo_flag, false) = false
)
SELECT
  COUNT(*)::BIGINT as started_count,
  COUNT(*) FILTER (WHERE type_code IS NOT NULL)::BIGINT as completed_count,
  -- Safe completion rate (clip to [0,100])
  LEAST(100, GREATEST(0, 
    ROUND(
      (COUNT(*) FILTER (WHERE type_code IS NOT NULL))::numeric 
      / NULLIF(COUNT(*), 0) * 100, 1
    )
  )) as completion_rate_pct,
  
  -- High/Moderate confidence coverage (only among completed)
  ROUND(
    (COUNT(*) FILTER (WHERE type_code IS NOT NULL 
                      AND (confidence = 'High' OR confidence = 'Moderate')))::numeric
    / NULLIF(COUNT(*) FILTER (WHERE type_code IS NOT NULL), 0) * 100, 1
  ) as hi_mod_conf_pct,
  
  -- Average fit score
  ROUND(AVG(COALESCE(score_fit_calibrated, score_fit_raw))::numeric, 1) as avg_fit_score,
  
  -- Count by overlay
  COUNT(*) FILTER (WHERE overlay = '+')::BIGINT as overlay_positive,
  COUNT(*) FILTER (WHERE overlay = '-')::BIGINT as overlay_negative
FROM dedup;

-- 4. Grant proper access for anonymous dashboard reads
GRANT SELECT ON public.v_latest_assessments_v11 TO anon;
GRANT SELECT ON public.v_kpi_overview_30d_v11 TO anon;
GRANT SELECT ON public.v_latest_assessments_v11 TO public;
GRANT SELECT ON public.v_kpi_overview_30d_v11 TO public;