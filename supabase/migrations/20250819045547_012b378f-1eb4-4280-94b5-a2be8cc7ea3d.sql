-- Drop dependent KPI views before rebuilding v_profiles_ext
DROP VIEW IF EXISTS public.v_kpi_throughput;
DROP VIEW IF EXISTS public.v_kpi_quality;
DROP VIEW IF EXISTS public.v_kpi_overlay;
DROP VIEW IF EXISTS public.v_section_time;
DROP VIEW IF EXISTS public.v_retest_deltas;

DROP VIEW IF EXISTS public.v_profiles_ext;
CREATE VIEW public.v_profiles_ext AS
SELECT
  p.*,
  -- Extract top fit score
  (p.type_scores->(
    SELECT key 
    FROM jsonb_each(p.type_scores) 
    ORDER BY (value->>'fit_abs')::numeric DESC 
    LIMIT 1
  )->>'fit_abs')::numeric as fit_top,
  -- Extract second-best fit score  
  (p.type_scores->(
    SELECT key 
    FROM jsonb_each(p.type_scores) 
    ORDER BY (value->>'fit_abs')::numeric DESC 
    OFFSET 1 
    LIMIT 1
  )->>'fit_abs')::numeric as fit_2,
  -- Calculate gap between top and second
  COALESCE(
    (p.type_scores->(
      SELECT key 
      FROM jsonb_each(p.type_scores) 
      ORDER BY (value->>'fit_abs')::numeric DESC 
      LIMIT 1
    )->>'fit_abs')::numeric -
    (p.type_scores->(
      SELECT key 
      FROM jsonb_each(p.type_scores) 
      ORDER BY (value->>'fit_abs')::numeric DESC 
      OFFSET 1 
      LIMIT 1
    )->>'fit_abs')::numeric,
    0
  ) as fit_gap,
  -- Extract inconsistency and SD index
  COALESCE((p.validity->>'inconsistency')::numeric, 0) as inconsistency,
  COALESCE((p.validity->>'sd_index')::numeric, 0) as sd_index,
  -- Get top type
  (
    SELECT key 
    FROM jsonb_each(p.type_scores) 
    ORDER BY (value->>'fit_abs')::numeric DESC 
    LIMIT 1
  ) as type_top
FROM public.profiles p;
-- Grant access to authenticated users
GRANT SELECT ON public.v_profiles_ext TO authenticated;

CREATE VIEW public.v_kpi_throughput AS
SELECT
  DATE_TRUNC('day', p.created_at) as d,
  COUNT(*) as completions,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (p.validity->>'duration_min')::numeric) as median_minutes
FROM public.v_profiles_ext p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY 1;

GRANT SELECT ON public.v_kpi_throughput TO authenticated;

CREATE VIEW public.v_kpi_quality AS
SELECT
  COUNT(*) as n,
  AVG(p.inconsistency) as inconsistency_mean,
  AVG(p.sd_index) as sd_index_mean,
  AVG((p.inconsistency >= 1.5)::int)::numeric as inconsistency_ge_1_5_pct,
  AVG((p.sd_index >= 4.6)::int)::numeric as sd_index_ge_4_6_pct,
  AVG((p.confidence IN ('High', 'Moderate'))::int)::numeric as confidence_high_mod_pct,
  AVG((p.confidence = 'Low')::int)::numeric as confidence_low_pct,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.fit_top) as fit_median,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.fit_gap) as gap_median,
  AVG((p.fit_gap < 5)::int)::numeric as close_calls_pct
FROM public.v_profiles_ext p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days';

GRANT SELECT ON public.v_kpi_quality TO authenticated;

CREATE VIEW public.v_kpi_overlay AS
SELECT 
  overlay,
  COUNT(*) as n,
COUNT(*)::numeric / (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '90 days')::numeric * 100 as percentage
FROM public.profiles
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY overlay;

GRANT SELECT ON public.v_kpi_overlay TO authenticated;

CREATE VIEW public.v_section_time AS
SELECT
  r.question_section as section,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.response_time_ms / 1000.0) as median_seconds
FROM public.assessment_responses r
JOIN public.assessment_sessions s ON s.id = r.session_id
WHERE s.created_at >= CURRENT_DATE - INTERVAL '90 days'
AND r.response_time_ms IS NOT NULL
GROUP BY r.question_section
ORDER BY median_seconds DESC;

GRANT SELECT ON public.v_section_time TO authenticated;

CREATE VIEW public.v_retest_deltas AS
SELECT
  a.user_id,
  a.session_id as session_id_1,
  b.session_id as session_id_2,
  a.created_at as t1,
  b.created_at as t2,
  EXTRACT(EPOCH FROM b.created_at - a.created_at) / 86400.0 as days_between,
  -- Type stability check
  (a.type_code = b.type_code) as type_changed,
  -- Strength correlation approximation
  CASE 
    WHEN a.strengths IS NOT NULL AND b.strengths IS NOT NULL
    THEN (
      SELECT SQRT(SUM(POW(
        COALESCE((b.strengths->>key)::numeric, 0) - COALESCE((a.strengths->>key)::numeric, 0), 2
      )))
      FROM jsonb_object_keys(a.strengths) as key
    )
    ELSE NULL
  END as strength_delta,
  -- Count dimension changes
  CASE
    WHEN a.dimensions IS NOT NULL AND b.dimensions IS NOT NULL
    THEN (
      SELECT COUNT(*)
      FROM jsonb_each_text(a.dimensions) d1
      JOIN jsonb_each_text(b.dimensions) d2 ON d1.key = d2.key
      WHERE d1.value <> d2.value
    )
    ELSE NULL
  END as dim_change_ct
FROM public.v_profiles_ext a
JOIN public.v_profiles_ext b ON (
  a.user_id = b.user_id 
  AND b.created_at > a.created_at
  AND a.created_at >= CURRENT_DATE - INTERVAL '365 days'
);

GRANT SELECT ON public.v_retest_deltas TO authenticated;
