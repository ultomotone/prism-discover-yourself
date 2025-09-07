-- Drop dependent views to allow shape changes
DROP VIEW IF EXISTS v_retest_stability CASCADE;
DROP VIEW IF EXISTS v_retest_deltas CASCADE;
DROP VIEW IF EXISTS v_section_time CASCADE;
DROP VIEW IF EXISTS v_kpi_overlay CASCADE;
DROP VIEW IF EXISTS v_kpi_quality CASCADE;
DROP VIEW IF EXISTS v_kpi_throughput CASCADE;
DROP VIEW IF EXISTS v_profiles_ext CASCADE;

-- 1) Extend profiles info for admin (top fits, gaps)
CREATE VIEW v_profiles_ext AS
SELECT
  p.id,
  p.user_id,
  p.session_id,
  p.type_code,
  p.base_func,
  p.creative_func,
  p.overlay,
  p.strengths,
  p.dimensions,
  p.blocks,
  p.neuroticism,
  p.validity,
  p.confidence,
  p.type_scores,
  p.top_types,
  p.dims_highlights,
  p.glossary_version,
  p.created_at,
  p.updated_at,
  p.blocks_norm,
  p.version,
  (p.type_scores->(
    SELECT key FROM jsonb_each(p.type_scores)
    ORDER BY (value->>'fit_abs')::numeric DESC
    LIMIT 1
  )->>'fit_abs')::numeric AS fit_top,
  (p.type_scores->(
    SELECT key FROM jsonb_each(p.type_scores)
    ORDER BY (value->>'fit_abs')::numeric DESC
    OFFSET 1 LIMIT 1
  )->>'fit_abs')::numeric AS fit_2,
  COALESCE(
    (p.type_scores->(
      SELECT key FROM jsonb_each(p.type_scores)
      ORDER BY (value->>'fit_abs')::numeric DESC
      LIMIT 1
    )->>'fit_abs')::numeric -
    (p.type_scores->(
      SELECT key FROM jsonb_each(p.type_scores)
      ORDER BY (value->>'fit_abs')::numeric DESC
      OFFSET 1 LIMIT 1
    )->>'fit_abs')::numeric,
    0
  ) AS fit_gap,
  COALESCE((p.validity->>'inconsistency')::numeric, 0) AS inconsistency,
  COALESCE((p.validity->>'sd_index')::numeric, 0) AS sd_index,
  (
    SELECT key
    FROM jsonb_each(p.type_scores)
    ORDER BY (value->>'fit_abs')::numeric DESC
    LIMIT 1
  ) AS type_top
FROM profiles p;

GRANT SELECT ON v_profiles_ext TO authenticated;

-- 2) Throughput & experience
CREATE OR REPLACE VIEW v_kpi_throughput AS
SELECT
  date_trunc('day', p.created_at) d,
  count(*) as completions,
  percentile_cont(0.5) within group (order by (p.validity->>'duration_min')::numeric nulls last) as median_minutes
FROM v_profiles_ext p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY 1;

GRANT SELECT ON v_kpi_throughput TO authenticated;

-- 3) Quality / confidence & scoring
CREATE OR REPLACE VIEW v_kpi_quality AS
SELECT
  count(*) as n,
  avg(p.inconsistency) as inconsistency_mean,
  avg(p.sd_index) as sd_index_mean,
  avg((p.inconsistency >= 1.5)::int)::numeric as incons_ge_1_5,
  avg((p.sd_index >= 4.6)::int)::numeric as sd_ge_4_6,
  avg((p.confidence in ('High','Moderate'))::int)::numeric as conf_hi_mod_share,
  avg((p.confidence = 'Low')::int)::numeric as conf_low_share,
  percentile_cont(0.5) within group (order by p.fit_top) as fit_median,
  percentile_cont(0.5) within group (order by p.fit_gap) as gap_median,
  avg((p.fit_gap < 5)::int)::numeric as close_calls_share
FROM v_profiles_ext p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days';

GRANT SELECT ON v_kpi_quality TO authenticated;

-- 4) Overlay mix
CREATE OR REPLACE VIEW v_kpi_overlay AS
SELECT overlay, count(*) as n
FROM profiles
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY overlay;

GRANT SELECT ON v_kpi_overlay TO authenticated;

-- 5) Section timing
CREATE OR REPLACE VIEW v_section_time AS
SELECT
  r.question_section as section,
  percentile_cont(0.5) within group (order by r.response_time_ms / 1000.0) as median_seconds
FROM assessment_responses r
JOIN assessment_sessions s ON s.id = r.session_id
WHERE s.created_at >= CURRENT_DATE - INTERVAL '90 days'
AND r.response_time_ms IS NOT NULL
GROUP BY r.question_section
ORDER BY median_seconds DESC;

GRANT SELECT ON v_section_time TO authenticated;

-- 6) Retest deltas
CREATE OR REPLACE VIEW v_retest_deltas AS
SELECT
  a.user_id, a.session_id as session_id_1, b.session_id as session_id_2,
  a.created_at as t1, b.created_at as t2,
  (select sqrt(sum( pow( coalesce((b.strengths->>key)::numeric,0) - coalesce((a.strengths->>key)::numeric,0), 2)))
   from jsonb_object_keys(a.strengths) as key) as strength_delta,
  (select count(*) from jsonb_each_text(a.dimensions) d1
   join jsonb_each_text(b.dimensions) d2 using (key)
   where d1.value <> d2.value) as dim_change_ct,
  (a.type_code = b.type_code)::int as type_same,
  extract(epoch from b.created_at - a.created_at)/86400.0 as days_between
FROM v_profiles_ext a
JOIN v_profiles_ext b on a.user_id=b.user_id and b.created_at > a.created_at
WHERE a.created_at >= CURRENT_DATE - INTERVAL '365 days';

GRANT SELECT ON v_retest_deltas TO authenticated;