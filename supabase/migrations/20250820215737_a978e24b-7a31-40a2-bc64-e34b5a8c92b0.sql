-- Update v_latest_assessments_v11 to include both raw and calibrated fits
DROP VIEW IF EXISTS public.v_latest_assessments_v11;

CREATE VIEW public.v_latest_assessments_v11 AS
SELECT 
  p.created_at AS finished_at,
  CONCAT(LEFT(p.type_code, 3), COALESCE(p.overlay, '')) AS type_code,
  p.overlay,
  COALESCE(
    (SELECT ar.answer_value 
     FROM assessment_responses ar 
     JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
     WHERE ar.session_id = p.session_id 
     AND ar.question_id = (sc.value->>'id')::integer
     LIMIT 1), 
    'Unknown'
  ) AS country,
  ROUND(p.score_fit_calibrated)::int AS fit_value,
  p.score_fit_raw,
  p.score_fit_calibrated,
  COALESCE(
    (p.top_3_fits->0->>'share')::numeric,
    (p.type_scores->(p.top_types->>0)->>'share_pct')::numeric
  ) AS share_pct,
  p.fit_band,
  p.confidence,
  COALESCE(p.results_version, 'pre-v1.1') AS version,
  p.session_id,
  p.invalid_combo_flag
FROM profiles p
WHERE p.results_version = 'v1.1'
  AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY p.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.v_latest_assessments_v11 TO anon, authenticated;