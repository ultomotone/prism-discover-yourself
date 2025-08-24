-- Resolve view column mismatch by dropping and recreating dependent views
DROP VIEW IF EXISTS public.v_kpi_metrics_v11 CASCADE;

CREATE VIEW public.v_kpi_metrics_v11 AS
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