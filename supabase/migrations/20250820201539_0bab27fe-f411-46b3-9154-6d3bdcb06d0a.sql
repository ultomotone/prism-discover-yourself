-- Create comprehensive v1.1 KPI metrics view
CREATE OR REPLACE VIEW public.v_kpi_metrics_v11 AS
SELECT
  p.session_id,
  p.created_at,
  p.created_at::date AS day,
  COALESCE(p.score_fit_calibrated, p.score_fit_raw) AS fit,
  p.fit_band,
  p.confidence,
  COALESCE(
    (SELECT ar.answer_value 
     FROM assessment_responses ar 
     JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
     WHERE ar.session_id = p.session_id 
     AND ar.question_id = (sc.value->>'id')::integer
     LIMIT 1), 
    'Unknown'
  ) as country,
  COALESCE(p.results_version, 'legacy') as results_version,
  p.type_code,
  -- Get share_pct from type_scores for the top type
  CASE 
    WHEN p.top_types IS NOT NULL 
         AND jsonb_array_length(p.top_types) > 0 
         AND p.type_scores IS NOT NULL 
    THEN COALESCE(
      (p.type_scores->(p.top_types->>0)->>'share_pct')::numeric, 
      0
    )
    ELSE 0
  END as type_share
FROM profiles p
WHERE p.results_version = 'v1.1' 
  AND p.created_at >= CURRENT_DATE - INTERVAL '90 days'; -- Limit for performance

-- Create country activity function
CREATE OR REPLACE FUNCTION public.kpi_country_activity_v11(
  start_ts timestamptz DEFAULT NOW() - INTERVAL '30 days',
  end_ts   timestamptz DEFAULT NOW()
) RETURNS TABLE (country text, sessions bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(country, 'Unknown') AS country, 
    COUNT(DISTINCT session_id)::bigint as sessions
  FROM public.v_kpi_metrics_v11
  WHERE created_at BETWEEN start_ts AND end_ts
    AND country != 'Unknown'
    AND country IS NOT NULL
  GROUP BY country
  ORDER BY sessions DESC
  LIMIT 50; -- Limit for performance
$$;

-- Create enhanced KPI overview that uses v_kpi_metrics_v11
CREATE OR REPLACE VIEW public.v_kpi_overview_30d_v11 AS
WITH base AS (
  SELECT 
    session_id,
    created_at,
    fit,
    fit_band,
    confidence,
    type_share
  FROM public.v_kpi_metrics_v11
  WHERE created_at >= NOW() - INTERVAL '30 days'
),
sessions_30d AS (
  SELECT COUNT(DISTINCT session_id) as started_count
  FROM assessment_sessions
  WHERE started_at >= NOW() - INTERVAL '30 days'
),
completed AS (
  SELECT 
    COUNT(DISTINCT session_id) as completed_count,
    COUNT(DISTINCT session_id) FILTER (WHERE confidence IN ('high', 'moderate')) as hi_mod_count,
    AVG(fit) FILTER (WHERE fit IS NOT NULL) as avg_fit_score
  FROM base
  WHERE fit IS NOT NULL
),
overlay_counts AS (
  SELECT 
    COUNT(DISTINCT p.session_id) FILTER (WHERE p.overlay = '+') as overlay_positive,
    COUNT(DISTINCT p.session_id) FILTER (WHERE p.overlay = '–') as overlay_negative
  FROM profiles p
  WHERE p.created_at >= NOW() - INTERVAL '30 days'
    AND p.results_version = 'v1.1'
)
SELECT
  s.started_count,
  c.completed_count,
  -- Safe division with NULLIF to prevent NaN
  ROUND(
    (c.completed_count::numeric / NULLIF(s.started_count, 0) * 100), 
    1
  ) as completion_rate_pct,
  ROUND(
    (c.hi_mod_count::numeric / NULLIF(c.completed_count, 0) * 100), 
    1
  ) as hi_mod_conf_pct,
  ROUND(c.avg_fit_score, 1) as avg_fit_score,
  o.overlay_positive,
  o.overlay_negative
FROM sessions_30d s
CROSS JOIN completed c
CROSS JOIN overlay_counts o;

-- Grant permissions for anonymous access to dashboard views
GRANT SELECT ON public.v_kpi_metrics_v11 TO anon, authenticated;
GRANT SELECT ON public.v_latest_assessments_v11 TO anon, authenticated; 
GRANT SELECT ON public.v_kpi_overview_30d_v11 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kpi_country_activity_v11(timestamptz, timestamptz) TO anon, authenticated;