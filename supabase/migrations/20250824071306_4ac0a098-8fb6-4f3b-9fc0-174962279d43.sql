-- Fix PRISM scoring & dashboard unification issues (corrected syntax)

-- 1) Create improved FC coverage view for completed sessions only
CREATE OR REPLACE VIEW v_fc_coverage_v11 AS
SELECT
  s.id as session_id,
  COALESCE(COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%'), 0)::int as fc_answered,
  CASE 
    WHEN COALESCE(COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%'), 0) = 0 THEN 'None'
    WHEN COALESCE(COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%'), 0) BETWEEN 1 AND 10 THEN 'Partial (1-10)'
    WHEN COALESCE(COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%'), 0) BETWEEN 11 AND 20 THEN 'Low (11-20)'
    WHEN COALESCE(COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%'), 0) BETWEEN 21 AND 22 THEN 'Medium (21-22)'
    WHEN COALESCE(COUNT(DISTINCT r.question_id) FILTER (WHERE r.question_type LIKE 'forced-choice-%'), 0) BETWEEN 23 AND 24 THEN 'High (23-24)'
    ELSE 'Complete (25+)'
  END as fc_coverage_bucket
FROM assessment_sessions s
LEFT JOIN assessment_responses r ON r.session_id = s.id
WHERE s.status = 'completed'
GROUP BY s.id;

-- 2) Update FC analytics view to use completed sessions only
CREATE OR REPLACE VIEW v_fc_analytics_v11 AS
SELECT 
  fc_coverage_bucket,
  COUNT(*) as session_count,
  ROUND(COUNT(*)::numeric * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM v_fc_coverage_v11
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

-- 3) Fix latest assessments view to use absolute fit consistently
CREATE OR REPLACE VIEW v_latest_assessments_v11_abs AS
SELECT 
  p.session_id,
  (p.top_types->>0)::text as type_code,
  p.overlay,
  p.confidence,
  p.fit_band,
  p.results_version,
  p.created_at as finished_at,
  -- Use absolute fit consistently
  COALESCE(
    p.score_fit_calibrated, 
    p.score_fit_raw, 
    ((p.type_scores->(p.top_types->>0)::text)->>'fit_abs')::numeric,
    0
  ) as fit_abs,
  -- Get share percentage from type scores
  COALESCE(
    ((p.type_scores->(p.top_types->>0)::text)->>'share_pct')::numeric,
    ((p.type_scores->(p.top_types->>0)::text)->>'share')::numeric,
    0
  ) as share_pct,
  -- Country from responses
  COALESCE(
    (SELECT ar.answer_value 
     FROM assessment_responses ar 
     JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
     WHERE ar.session_id = p.session_id 
     AND ar.question_id = (sc.value->>'id')::integer
     LIMIT 1), 
    'Unknown'
  ) as country,
  p.invalid_combo_flag,
  p.score_fit_raw,
  p.score_fit_calibrated
FROM profiles p
WHERE p.results_version = 'v1.1'
  AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY p.created_at DESC
LIMIT 100;

-- 4) Create comprehensive fit histogram using absolute fit
CREATE OR REPLACE VIEW v_fit_histogram_abs AS
WITH fit_data AS (
  SELECT 
    COALESCE(
      p.score_fit_calibrated, 
      p.score_fit_raw, 
      ((p.type_scores->(p.top_types->>0)::text)->>'fit_abs')::numeric
    ) as fit_abs
  FROM profiles p
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
    FLOOR(fit_abs / 5) * 5 as bin_start,
    FLOOR(fit_abs / 5) * 5 + 5 as bin_end,
    COUNT(*) as count
  FROM fit_data
  WHERE fit_abs BETWEEN 0 AND 100
  GROUP BY FLOOR(fit_abs / 5)
)
SELECT 
  bin_start as bin_min,
  bin_end as bin_max,
  bin_start as bin,
  count
FROM bins
ORDER BY bin_start;

-- 5) Add RLS policy for assessment responses
DROP POLICY IF EXISTS "Allow anon insert for valid sessions" ON assessment_responses;
CREATE POLICY "Allow anon insert for valid sessions"
ON assessment_responses
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessment_sessions s
    WHERE s.id = assessment_responses.session_id
      AND s.status IN ('in_progress', 'completed')
  )
);

-- 6) Update KPI metrics view to use absolute fit
CREATE OR REPLACE VIEW v_kpi_metrics_v11_abs AS
SELECT 
  p.session_id,
  p.created_at,
  DATE(p.created_at) as day,
  (p.top_types->>0)::text as type_code,
  p.confidence,
  p.fit_band,
  p.results_version,
  -- Use absolute fit consistently
  COALESCE(
    p.score_fit_calibrated, 
    p.score_fit_raw, 
    ((p.type_scores->(p.top_types->>0)::text)->>'fit_abs')::numeric
  ) as fit,
  -- Get type share
  COALESCE(
    ((p.type_scores->(p.top_types->>0)::text)->>'share_pct')::numeric,
    ((p.type_scores->(p.top_types->>0)::text)->>'share')::numeric
  ) as type_share,
  -- Country from responses
  COALESCE(
    (SELECT ar.answer_value 
     FROM assessment_responses ar 
     JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
     WHERE ar.session_id = p.session_id 
     AND ar.question_id = (sc.value->>'id')::integer
     LIMIT 1), 
    'Unknown'
  ) as country
FROM profiles p
WHERE p.results_version = 'v1.1';

-- 7) Update KPI overview to use absolute fit (fixed FILTER syntax)
CREATE OR REPLACE VIEW v_kpi_overview_30d_v11_abs AS
WITH recent_sessions AS (
  SELECT * FROM assessment_sessions 
  WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
),
recent_profiles AS (
  SELECT * FROM v_kpi_metrics_v11_abs
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  -- Basic counts
  (SELECT COUNT(*) FROM recent_sessions WHERE status IN ('in_progress', 'completed')) as started_count,
  (SELECT COUNT(*) FROM recent_sessions WHERE status = 'completed') as completed_count,
  
  -- Completion rate
  ROUND(
    (SELECT COUNT(*) FROM recent_sessions WHERE status = 'completed')::numeric * 100.0 / 
    NULLIF((SELECT COUNT(*) FROM recent_sessions WHERE status IN ('in_progress', 'completed')), 0),
    2
  ) as completion_rate_pct,
  
  -- Overlay distribution
  (SELECT COUNT(*) FROM recent_profiles WHERE overlay = '+') as overlay_positive,
  (SELECT COUNT(*) FROM recent_profiles WHERE overlay = '–') as overlay_negative,
  
  -- Quality metrics using absolute fit (corrected FILTER syntax)
  ROUND(COALESCE(AVG(fit), 0), 1) as avg_fit_score,
  ROUND(
    (COUNT(*) FILTER (WHERE confidence IN ('High', 'Moderate')))::numeric * 100.0 / 
    NULLIF(COUNT(*), 0),
    2
  ) as hi_mod_conf_pct
FROM recent_profiles;