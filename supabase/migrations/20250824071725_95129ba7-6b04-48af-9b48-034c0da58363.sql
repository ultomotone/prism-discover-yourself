-- PRISM scoring & dashboard unification - drop and recreate views with correct structure

-- Drop views that need restructuring
DROP VIEW IF EXISTS public.v_fc_coverage;
DROP VIEW IF EXISTS public.v_fc_analytics;

-- 1) Recreate FC coverage for completed sessions only
CREATE VIEW public.v_fc_coverage AS
SELECT
  s.id AS session_id,
  COUNT(DISTINCT r.question_id) AS answered_count,
  COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%') AS fc_count,
  (
    SELECT COUNT(*) 
    FROM public.assessment_questions q 
    WHERE q.type LIKE 'forced-choice-%' AND q.section ILIKE '%Work Style%'
  )::int AS fc_total_questions,
  CASE 
    WHEN COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%') = 0 THEN 'None'
    WHEN COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%') BETWEEN 1 AND 10 THEN 'Partial (1-10)'
    WHEN COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%') BETWEEN 11 AND 20 THEN 'Low (11-20)'
    WHEN COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%') BETWEEN 21 AND 22 THEN 'Medium (21-22)'
    WHEN COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%') BETWEEN 23 AND 24 THEN 'High (23-24)'
    ELSE 'Complete (25+)'
  END AS fc_coverage_bucket
FROM public.assessment_sessions s
LEFT JOIN public.assessment_responses r ON r.session_id = s.id
WHERE s.status = 'completed'
GROUP BY s.id;

-- 2) Recreate FC analytics aggregated 
CREATE VIEW public.v_fc_analytics AS
SELECT 
  fc_coverage_bucket,
  COUNT(*) AS session_count,
  ROUND(COUNT(*)::numeric * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 2) AS percentage
FROM public.v_fc_coverage
GROUP BY fc_coverage_bucket
ORDER BY 
  CASE fc_coverage_bucket
    WHEN 'None' THEN 0
    WHEN 'Partial (1-10)' THEN 1
    WHEN 'Low (11-20)' THEN 2
    WHEN 'Medium (21-22)' THEN 3
    WHEN 'High (23-24)' THEN 4
    WHEN 'Complete (25+)' THEN 5
    ELSE 6
  END;

-- 3) Update KPI metrics view to use absolute fit
CREATE OR REPLACE VIEW public.v_kpi_metrics_v11 AS
SELECT 
  p.session_id,
  p.created_at,
  DATE(p.created_at) AS day,
  (p.top_types->>0)::text AS type_code,
  p.confidence,
  p.fit_band,
  p.results_version,
  COALESCE(
    p.score_fit_calibrated,
    p.score_fit_raw,
    ((p.type_scores->(p.top_types->>0)::text)->>'fit_abs')::numeric
  ) AS fit,
  COALESCE(
    ((p.type_scores->(p.top_types->>0)::text)->>'share_pct')::numeric,
    ((p.type_scores->(p.top_types->>0)::text)->>'share')::numeric
  ) AS type_share,
  COALESCE(
    (SELECT ar.answer_value 
     FROM public.assessment_responses ar 
     JOIN public.scoring_config sc ON sc.key = 'dashboard_country_qid' 
     WHERE ar.session_id = p.session_id 
     AND ar.question_id = (sc.value->>'id')::integer
     LIMIT 1), 
    'Unknown'
  ) AS country
FROM public.profiles p
WHERE p.results_version = 'v1.1';

-- 4) Update latest assessments to use absolute fit consistently
CREATE OR REPLACE VIEW public.v_latest_assessments_v11 AS
SELECT 
  p.session_id,
  (p.top_types->>0)::text AS type_code,
  p.overlay,
  p.confidence,
  p.fit_band,
  p.results_version AS version,
  p.created_at AS finished_at,
  COALESCE(
    p.score_fit_calibrated,
    p.score_fit_raw,
    ((p.type_scores->(p.top_types->>0)::text)->>'fit_abs')::numeric,
    0
  ) AS fit_value,
  COALESCE(
    ((p.type_scores->(p.top_types->>0)::text)->>'share_pct')::numeric,
    ((p.type_scores->(p.top_types->>0)::text)->>'share')::numeric,
    0
  ) AS share_pct,
  COALESCE(
    (SELECT ar.answer_value 
     FROM public.assessment_responses ar 
     JOIN public.scoring_config sc ON sc.key = 'dashboard_country_qid' 
     WHERE ar.session_id = p.session_id 
     AND ar.question_id = (sc.value->>'id')::integer
     LIMIT 1), 
    'Unknown'
  ) AS country,
  p.invalid_combo_flag,
  p.score_fit_raw,
  p.score_fit_calibrated
FROM public.profiles p
WHERE p.results_version = 'v1.1'
  AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY p.created_at DESC
LIMIT 100;

-- 5) Update fit histogram to use absolute fit
CREATE OR REPLACE VIEW public.v_fit_histogram AS
WITH fit_data AS (
  SELECT 
    COALESCE(
      p.score_fit_calibrated,
      p.score_fit_raw,
      ((p.type_scores->(p.top_types->>0)::text)->>'fit_abs')::numeric
    ) AS fit_abs
  FROM public.profiles p
  WHERE p.results_version = 'v1.1'
    AND p.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND COALESCE(
      p.score_fit_calibrated,
      p.score_fit_raw,
      ((p.type_scores->(p.top_types->>0)::text)->>'fit_abs')::numeric
    ) IS NOT NULL
),
bins AS (
  SELECT 
    FLOOR(fit_abs / 5) * 5 AS bin_start,
    FLOOR(fit_abs / 5) * 5 + 5 AS bin_end,
    COUNT(*) AS count
  FROM fit_data
  WHERE fit_abs BETWEEN 0 AND 100
  GROUP BY FLOOR(fit_abs / 5)
)
SELECT 
  bin_start AS bin_min,
  bin_end AS bin_max,
  bin_start AS bin,
  count
FROM bins
ORDER BY bin_start;

-- 6) Update KPI overview to use absolute fit  
CREATE OR REPLACE VIEW public.v_kpi_overview_30d_v11 AS
WITH recent_sessions AS (
  SELECT * FROM public.assessment_sessions 
  WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
),
recent_profiles AS (
  SELECT p.session_id, p.created_at, p.overlay, 
         COALESCE(
           p.score_fit_calibrated,
           p.score_fit_raw,
           ((p.type_scores->(p.top_types->>0)::text)->>'fit_abs')::numeric
         ) AS fit,
         p.confidence
  FROM public.profiles p
  WHERE p.results_version = 'v1.1'
    AND p.created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  (SELECT COUNT(*) FROM recent_sessions WHERE status IN ('in_progress', 'completed')) AS started_count,
  (SELECT COUNT(*) FROM recent_sessions WHERE status = 'completed') AS completed_count,
  ROUND(
    (SELECT COUNT(*) FROM recent_sessions WHERE status = 'completed')::numeric * 100.0 / 
    NULLIF((SELECT COUNT(*) FROM recent_sessions WHERE status IN ('in_progress', 'completed')), 0),
    2
  ) AS completion_rate_pct,
  (SELECT COUNT(*) FROM recent_profiles WHERE overlay = '+') AS overlay_positive,
  (SELECT COUNT(*) FROM recent_profiles WHERE overlay = '–') AS overlay_negative,
  ROUND(COALESCE((SELECT AVG(fit) FROM recent_profiles), 0), 1) AS avg_fit_score,
  ROUND(
    (SELECT COUNT(*) FILTER (WHERE confidence IN ('High', 'Moderate')) FROM recent_profiles)::numeric * 100.0 / 
    NULLIF((SELECT COUNT(*) FROM recent_profiles), 0),
    2
  ) AS hi_mod_conf_pct;