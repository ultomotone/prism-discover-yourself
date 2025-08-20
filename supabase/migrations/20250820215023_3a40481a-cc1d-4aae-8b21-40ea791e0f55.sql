-- Update v_latest_assessments_v11 to use calibrated fit and fix share calculation
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

-- Update v_kpi_overview_30d_v11 to use calibrated fits
DROP VIEW IF EXISTS public.v_kpi_overview_30d_v11;

CREATE VIEW public.v_kpi_overview_30d_v11 AS
SELECT 
  -- Session counts
  COUNT(CASE WHEN s.status IN ('in_progress', 'completed') THEN 1 END) AS started_count,
  COUNT(CASE WHEN s.status = 'completed' THEN 1 END) AS completed_count,
  ROUND((COUNT(CASE WHEN s.status = 'completed' THEN 1 END)::numeric / 
         NULLIF(COUNT(CASE WHEN s.status IN ('in_progress', 'completed') THEN 1 END), 0)) * 100, 1) AS completion_rate_pct,
  
  -- Fit scores using calibrated
  ROUND(AVG(p.score_fit_calibrated), 1) AS avg_fit_score,
  
  -- Confidence/fit band analysis
  ROUND((COUNT(CASE WHEN p.fit_band IN ('High', 'Moderate') THEN 1 END)::numeric / 
         NULLIF(COUNT(p.fit_band), 0)) * 100, 1) AS hi_mod_conf_pct,
  
  -- Overlay counts
  COUNT(CASE WHEN p.overlay = '+' THEN 1 END) AS overlay_positive,
  COUNT(CASE WHEN p.overlay = '–' THEN 1 END) AS overlay_negative
  
FROM assessment_sessions s
LEFT JOIN profiles p ON p.session_id = s.id AND p.results_version = 'v1.1'
WHERE s.started_at >= CURRENT_DATE - INTERVAL '30 days';

-- Grant permissions
GRANT SELECT ON public.v_latest_assessments_v11 TO anon, authenticated;
GRANT SELECT ON public.v_kpi_overview_30d_v11 TO anon, authenticated;