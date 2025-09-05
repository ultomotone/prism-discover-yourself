-- Fix fit score consistency by dropping and recreating the problematic view
DROP VIEW IF EXISTS v_latest_assessments_v11;

-- Recreate the view with consistent fit values (no normalization to 100%)
CREATE VIEW v_latest_assessments_v11 AS
SELECT 
  p.session_id,
  p.submitted_at as finished_at,
  p.type_code,
  p.overlay,
  -- Use absolute fit consistently (no normalization to 100%)
  COALESCE(
    p.score_fit_calibrated,
    (p.type_scores -> p.type_code ->> 'fit_abs')::numeric
  ) AS fit_value,
  -- Share percentage with proper extraction
  COALESCE(
    (p.type_scores -> p.type_code ->> 'share_pct')::numeric,
    (p.type_scores -> p.type_code ->> 'share')::numeric * 100
  ) AS share_pct,
  p.fit_band,
  p.results_version as version,
  p.invalid_combo_flag,
  p.confidence,
  p.score_fit_raw,
  p.score_fit_calibrated,
  -- Country lookup for display
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
WHERE p.results_version IN ('v1.1', 'v1.2.0')
  AND p.type_code IS NOT NULL;