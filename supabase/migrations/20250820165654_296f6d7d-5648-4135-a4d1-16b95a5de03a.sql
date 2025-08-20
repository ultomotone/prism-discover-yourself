-- Create canonical view for Admin Latest Assessments with v1.1 fields
CREATE OR REPLACE VIEW public.v_latest_assessments_v11 AS
SELECT
  p.created_at,
  p.session_id,
  p.user_id,
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
  -- Canonical fit for display (calibrated -> raw -> null)
  COALESCE(p.score_fit_calibrated, p.score_fit_raw) as fit_display,
  -- Band computed server-side for consistency
  CASE
    WHEN p.score_fit_calibrated IS NULL THEN NULL
    WHEN p.score_fit_calibrated >= 70 THEN 'High'
    WHEN p.score_fit_calibrated >= 50 THEN 'Moderate'
    ELSE 'Low'
  END as fit_band_display,
  -- Percent share if we have it
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
  -- Version tags
  COALESCE(p.results_version, 'legacy') as results_version,
  (p.score_fit_calibrated IS NULL) as is_legacy_fit,
  -- Keep existing telemetry
  COALESCE(p.invalid_combo_flag, false) as invalid_combo_flag,
  p.top_gap,
  p.confidence,
  CONCAT(LEFT(p.type_code, 3), COALESCE(p.overlay, '')) as type_display
FROM public.profiles p
ORDER BY p.created_at DESC;