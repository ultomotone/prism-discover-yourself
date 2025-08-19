-- 1) Extend profiles info for admin (top fits, gaps)
CREATE OR REPLACE VIEW v_profiles_ext AS
SELECT
  p.*,
  -- Extract top 1 fit score
  (SELECT (value->>'fit_abs')::numeric 
   FROM jsonb_each(p.type_scores) 
   ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST 
   LIMIT 1) as top1_fit,
  -- Extract top 2 fit score  
  (SELECT (value->>'fit_abs')::numeric 
   FROM jsonb_each(p.type_scores) 
   ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST 
   OFFSET 1 LIMIT 1) as top2_fit,
  -- Extract top 1 share percentage
  (SELECT (value->>'share_pct')::numeric 
   FROM jsonb_each(p.type_scores) 
   ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST 
   LIMIT 1) as top1_share,
  -- Extract top type code
  (SELECT key 
   FROM jsonb_each(p.type_scores) 
   ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST 
   LIMIT 1) as top_type
FROM profiles p;

-- 2) Throughput & experience metrics
CREATE OR REPLACE VIEW v_kpi_throughput AS
SELECT
  DATE_TRUNC('day', s.created_at) as d,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT CASE WHEN s.completed_at IS NOT NULL THEN s.id END) as completions,
  CASE 
    WHEN COUNT(DISTINCT s.id) > 0 
    THEN (COUNT(DISTINCT CASE WHEN s.completed_at IS NOT NULL THEN s.id END)::numeric / COUNT(DISTINCT s.id)::numeric) * 100
    ELSE 0 
  END as completion_rate,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (s.completed_at - s.started_at))/60 
  ) FILTER (WHERE s.completed_at IS NOT NULL) as median_minutes,
  -- Calculate speeders (< 12 minutes)
  AVG(CASE WHEN s.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (s.completed_at - s.started_at))/60 < 12 THEN 1 ELSE 0 END) * 100 as speeders_pct,
  -- Calculate stallers (> 60 minutes)  
  AVG(CASE WHEN s.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (s.completed_at - s.started_at))/60 > 60 THEN 1 ELSE 0 END) * 100 as stallers_pct
FROM assessment_sessions s
GROUP BY 1
ORDER BY 1;

-- 3) Quality metrics (psychometrics & scoring)
CREATE OR REPLACE VIEW v_kpi_quality AS
SELECT
  COUNT(*) as n,
  -- Inconsistency metrics
  AVG((p.validity->>'inconsistency')::numeric) as incons_mean,
  AVG(CASE WHEN (p.validity->>'inconsistency')::numeric >= 1.5 THEN 1 ELSE 0 END) * 100 as incons_ge_1_5_pct,
  -- Social desirability metrics
  AVG((p.validity->>'sd_index')::numeric) as sd_mean,
  AVG(CASE WHEN (p.validity->>'sd_index')::numeric >= 4.6 THEN 1 ELSE 0 END) * 100 as sd_ge_4_6_pct,
  -- Confidence distribution
  AVG(CASE WHEN p.confidence = 'High' THEN 1 ELSE 0 END) * 100 as conf_high_pct,
  AVG(CASE WHEN p.confidence = 'Moderate' THEN 1 ELSE 0 END) * 100 as conf_moderate_pct,
  AVG(CASE WHEN p.confidence = 'Low' THEN 1 ELSE 0 END) * 100 as conf_low_pct,
  -- Fit scores
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pe.top1_fit) as fit_median,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (pe.top1_fit - pe.top2_fit)) as gap_median,
  AVG(CASE WHEN (pe.top1_fit - pe.top2_fit) < 5 THEN 1 ELSE 0 END) * 100 as close_calls_pct
FROM profiles p
JOIN v_profiles_ext pe ON p.id = pe.id
WHERE pe.top1_fit IS NOT NULL AND pe.top2_fit IS NOT NULL;

-- 4) Overlay distribution
CREATE OR REPLACE VIEW v_kpi_overlay AS
SELECT 
  COALESCE(overlay, 'Unknown') as overlay,
  COUNT(*) as n,
  (COUNT(*)::numeric / (SELECT COUNT(*) FROM profiles)::numeric) * 100 as percentage
FROM profiles
GROUP BY overlay;

-- 5) Section timing analysis
CREATE OR REPLACE VIEW v_section_time AS
SELECT
  ar.session_id,
  COALESCE(ask.section, 'core') as section,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ar.response_time_ms) as median_response_ms,
  COUNT(*) as question_count,
  SUM(COALESCE(ar.response_time_ms, 0)) as total_time_ms
FROM assessment_responses ar
LEFT JOIN assessment_scoring_key ask ON ar.question_id = ask.question_id
WHERE ar.response_time_ms IS NOT NULL AND ar.response_time_ms > 0
GROUP BY ar.session_id, ask.section;

-- 6) Retest analysis 
CREATE OR REPLACE VIEW v_retest_deltas AS
SELECT
  a.user_id,
  a.session_id as session_id_1,
  b.session_id as session_id_2,
  a.created_at as t1,
  b.created_at as t2,
  EXTRACT(EPOCH FROM (b.created_at - a.created_at))/86400 as days_between,
  -- Type stability
  (a.type_code = b.type_code) as type_same,
  -- Calculate strength correlation/delta if both have strengths
  CASE 
    WHEN a.strengths IS NOT NULL AND b.strengths IS NOT NULL
    THEN (
      SELECT AVG(ABS((s1.value::numeric) - (s2.value::numeric)))
      FROM jsonb_each_text(a.strengths) s1
      JOIN jsonb_each_text(b.strengths) s2 ON s1.key = s2.key
    )
    ELSE NULL
  END as strength_delta,
  -- Count dimensional changes
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
FROM profiles a
JOIN profiles b ON a.user_id = b.user_id 
WHERE b.created_at > a.created_at
  AND a.user_id IS NOT NULL
  AND EXTRACT(EPOCH FROM (b.created_at - a.created_at))/86400 BETWEEN 1 AND 365;

-- 7) Type distribution heatmap data
CREATE OR REPLACE VIEW v_type_distribution AS
SELECT
  LEFT(type_code, 3) as type_prefix,
  overlay,
  COUNT(*) as count,
  AVG(pe.top1_fit) as avg_fit,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pe.top1_fit) as median_fit
FROM profiles p
JOIN v_profiles_ext pe ON p.id = pe.id
WHERE type_code IS NOT NULL
GROUP BY LEFT(type_code, 3), overlay;

-- 8) Item health analysis  
CREATE OR REPLACE VIEW v_item_health AS
SELECT
  ar.question_id,
  ask.section,
  ask.tag,
  COUNT(*) as response_count,
  AVG(ar.answer_numeric::numeric) as mean_response,
  STDDEV(ar.answer_numeric::numeric) as std_response,
  -- Calculate response distribution skew
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ar.answer_numeric) as median_response,
  MIN(ar.answer_numeric) as min_response,
  MAX(ar.answer_numeric) as max_response
FROM assessment_responses ar
LEFT JOIN assessment_scoring_key ask ON ar.question_id = ask.question_id
WHERE ar.answer_numeric IS NOT NULL
GROUP BY ar.question_id, ask.section, ask.tag;

-- 9) Anomaly detection view
CREATE OR REPLACE VIEW v_anomalies AS
SELECT
  'fit_score_out_of_range' as anomaly_type,
  p.session_id,
  p.created_at,
  'Top1 fit score out of range: ' || pe.top1_fit as description
FROM profiles p
JOIN v_profiles_ext pe ON p.id = pe.id
WHERE pe.top1_fit IS NOT NULL AND (pe.top1_fit < 0 OR pe.top1_fit > 100)

UNION ALL

SELECT
  'inverted_fit_scores' as anomaly_type,
  p.session_id,
  p.created_at,
  'Top2 fit > Top1 fit: ' || pe.top2_fit || ' > ' || pe.top1_fit as description
FROM profiles p  
JOIN v_profiles_ext pe ON p.id = pe.id
WHERE pe.top1_fit IS NOT NULL AND pe.top2_fit IS NOT NULL AND pe.top2_fit > pe.top1_fit

UNION ALL

SELECT
  'missing_top_types' as anomaly_type,
  p.session_id,
  p.created_at,
  'No top types found' as description
FROM profiles p
WHERE top_types IS NULL OR jsonb_array_length(top_types) < 1

UNION ALL

SELECT
  'null_type_code' as anomaly_type,
  p.session_id,
  p.created_at,
  'Missing type code' as description  
FROM profiles p
WHERE type_code IS NULL AND created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Enable RLS on all views for authenticated users
ALTER VIEW v_profiles_ext OWNER TO supabase_admin;
ALTER VIEW v_kpi_throughput OWNER TO supabase_admin;
ALTER VIEW v_kpi_quality OWNER TO supabase_admin;
ALTER VIEW v_kpi_overlay OWNER TO supabase_admin;
ALTER VIEW v_section_time OWNER TO supabase_admin;
ALTER VIEW v_retest_deltas OWNER TO supabase_admin;
ALTER VIEW v_type_distribution OWNER TO supabase_admin;
ALTER VIEW v_item_health OWNER TO supabase_admin;
ALTER VIEW v_anomalies OWNER TO supabase_admin;

-- Grant SELECT permissions to authenticated role
GRANT SELECT ON v_profiles_ext TO authenticated;
GRANT SELECT ON v_kpi_throughput TO authenticated;
GRANT SELECT ON v_kpi_quality TO authenticated;
GRANT SELECT ON v_kpi_overlay TO authenticated;
GRANT SELECT ON v_section_time TO authenticated;
GRANT SELECT ON v_retest_deltas TO authenticated;
GRANT SELECT ON v_type_distribution TO authenticated;
GRANT SELECT ON v_item_health TO authenticated;
GRANT SELECT ON v_anomalies TO authenticated;