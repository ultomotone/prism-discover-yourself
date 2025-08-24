-- Fix fit score consistency and prevent artificial ties from early rounding

-- Create a view that provides consistent fit display values
CREATE OR REPLACE VIEW v_latest_assessments_unified AS
SELECT 
  p.session_id,
  p.submitted_at as finished_at,
  p.type_code,
  p.overlay,
  -- Use calibrated absolute fit consistently (0-100 scale, with decimals)
  COALESCE(
    p.score_fit_calibrated,
    (p.type_scores -> p.type_code ->> 'fit_abs')::numeric
  ) AS fit_display,
  -- Get share percentage from type_scores with proper fallback
  COALESCE(
    (p.type_scores -> p.type_code ->> 'share_pct')::numeric,
    CASE 
      WHEN p.type_scores IS NOT NULL AND p.type_code IS NOT NULL
      THEN (p.type_scores -> p.type_code ->> 'share')::numeric * 100
      ELSE NULL
    END
  ) AS share_pct,
  -- Use raw top_gap to prevent artificial close calls from rounding
  COALESCE(p.top_gap, 0.0) AS top_gap_raw,
  -- Rename fit_band to confidence_band for clarity
  p.fit_band as confidence_band,
  p.results_version,
  p.invalid_combo_flag,
  p.confidence,
  p.score_fit_raw,
  p.score_fit_calibrated
FROM profiles p
WHERE p.results_version = 'v1.2.0'
  AND p.type_code IS NOT NULL
ORDER BY p.submitted_at DESC;

-- Update v_latest_assessments_v11 to use consistent fit values
CREATE OR REPLACE VIEW v_latest_assessments_v11 AS
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