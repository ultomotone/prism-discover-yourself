-- Drop existing conflicting views first
DROP VIEW IF EXISTS v_sessions CASCADE;
DROP VIEW IF EXISTS v_sessions_plus CASCADE;
DROP VIEW IF EXISTS v_fit_ranks CASCADE;
DROP VIEW IF EXISTS v_quality CASCADE;
DROP VIEW IF EXISTS v_overlay_conf CASCADE;
DROP VIEW IF EXISTS v_duplicates CASCADE;
DROP VIEW IF EXISTS v_validity CASCADE;
DROP VIEW IF EXISTS v_fc_coverage CASCADE;
DROP VIEW IF EXISTS v_dim_coverage CASCADE;
DROP VIEW IF EXISTS v_share_entropy CASCADE;
DROP VIEW IF EXISTS v_section_times CASCADE;
DROP VIEW IF EXISTS v_throughput CASCADE;
DROP VIEW IF EXISTS v_conf_dist CASCADE;

-- 1) Helper: filtered sessions (latest profile per session within date range)
CREATE VIEW v_sessions AS
SELECT
  p.user_id,
  p.session_id,
  p.created_at::date as d,
  p.type_code,
  left(p.type_code,3) as type3,
  p.overlay,
  p.confidence,
  (p.validity->>'inconsistency')::float as inconsistency,
  (p.validity->>'sd_index')::float as sd_index,
  p.strengths,
  p.dimensions,
  p.type_scores,
  p.top_types,
  p.created_at
FROM profiles p;

-- Optional durations (fallback to 0 if table absent)
CREATE VIEW v_sessions_plus AS
SELECT
  v.*,
  s.started_at,
  s.completed_at,
  CASE 
    WHEN s.completed_at IS NOT NULL AND s.started_at IS NOT NULL 
    THEN EXTRACT(epoch FROM (s.completed_at - s.started_at))::integer
    ELSE NULL 
  END as duration_sec,
  COALESCE(s.metadata->>'device','unknown') as device
FROM v_sessions v
LEFT JOIN public.assessment_sessions s ON s.id = v.session_id;

-- 2) Top-1 / Top-2 fit + gap
CREATE VIEW v_fit_ranks AS
WITH pairs AS (
  SELECT
    session_id,
    (jsonb_each(type_scores)).key as code,
    ((jsonb_each(type_scores)).value->>'fit_abs')::float as fit
  FROM v_sessions
  WHERE type_scores IS NOT NULL
), ranked AS (
  SELECT session_id, code, fit,
         row_number() OVER (PARTITION BY session_id ORDER BY fit DESC) as rk
  FROM pairs
  WHERE fit IS NOT NULL
)
SELECT
  s.session_id,
  max(CASE WHEN rk=1 THEN code END) as top1_code,
  max(CASE WHEN rk=1 THEN fit END) as top1_fit,
  max(CASE WHEN rk=2 THEN fit END) as top2_fit,
  COALESCE(max(CASE WHEN rk=1 THEN fit END) - max(CASE WHEN rk=2 THEN fit END), 0) as top_gap
FROM ranked s
GROUP BY s.session_id;

-- 3) Close-call flag and function-balance index
CREATE VIEW v_quality AS
SELECT
  v.session_id,
  v.inconsistency,
  v.sd_index,
  f.top1_fit,
  f.top2_fit,
  f.top_gap,
  CASE 
    WHEN v.strengths IS NOT NULL THEN
      (SELECT max((value)::float) FROM jsonb_each_text(v.strengths)) -
      (SELECT min((value)::float) FROM jsonb_each_text(v.strengths))
    ELSE NULL
  END as func_balance
FROM v_sessions v
LEFT JOIN v_fit_ranks f USING (session_id);

-- 4) Overlay & confidence counts
CREATE VIEW v_overlay_conf AS
SELECT overlay, confidence, count(*) as n
FROM v_sessions
GROUP BY 1,2;

-- 5) Duplicates (users with >1 sessions in window)
CREATE VIEW v_duplicates AS
SELECT user_id, count(*) as sessions_ct
FROM v_sessions
WHERE user_id IS NOT NULL
GROUP BY 1
HAVING count(*) > 1;

-- 6) Validity pass flag
CREATE VIEW v_validity AS
SELECT
  session_id,
  (COALESCE(inconsistency, 0) < 1.0 AND COALESCE(sd_index, 0) < 4.3) as pass_validity
FROM v_quality;

-- 7) Forced-choice coverage
CREATE VIEW v_fc_coverage AS
SELECT
  r.session_id,
  count(*) FILTER (WHERE sk.scale_type::text LIKE 'FORCED_CHOICE%') as fc_count,
  count(*) as answered_count
FROM assessment_responses r
JOIN assessment_scoring_key sk ON sk.question_id = r.question_id
GROUP BY 1;

-- 8) Dimensional coverage per function
CREATE VIEW v_dim_coverage AS
SELECT
  r.session_id,
  split_part(sk.tag,'_',1) as func,
  count(*) FILTER (WHERE sk.tag LIKE '%_D') as d_items
FROM assessment_responses r
JOIN assessment_scoring_key sk ON sk.question_id = r.question_id
WHERE sk.tag LIKE '%\_D' ESCAPE '\'
GROUP BY 1,2;

-- 9) Share entropy
CREATE VIEW v_share_entropy AS
SELECT
  p.session_id,
  CASE 
    WHEN p.type_scores IS NOT NULL THEN
      -1 * sum( 
        CASE 
          WHEN ((x.val->>'share_pct')::float / 100.0) > 0 THEN
            ((x.val->>'share_pct')::float / 100.0) * ln((x.val->>'share_pct')::float / 100.0)
          ELSE 0
        END
      )
    ELSE NULL
  END as share_entropy
FROM v_sessions p,
LATERAL jsonb_each(p.type_scores) as x(code, val)
WHERE p.type_scores IS NOT NULL
GROUP BY 1, p.type_scores;

-- 10) Section timing/drop-off
CREATE VIEW v_section_times AS
SELECT
  r.session_id, 
  COALESCE(sk.section,'Unknown') as section,
  percentile_disc(0.5) WITHIN GROUP (ORDER BY COALESCE(r.response_time_ms, 0)) as median_sec,
  1.0 * count(*) FILTER (WHERE r.answer_value IS NULL) / GREATEST(count(*),1) as drop_rate
FROM assessment_responses r
LEFT JOIN assessment_scoring_key sk ON sk.question_id = r.question_id
GROUP BY 1,2;

-- 11) Completion rate & throughput
CREATE VIEW v_throughput AS
SELECT
  date_trunc('day', COALESCE(completed_at, started_at))::date as d,
  count(*) as sessions
FROM v_sessions_plus
GROUP BY 1;

-- 12) Confidence buckets
CREATE VIEW v_conf_dist AS
SELECT confidence, count(*) as n
FROM v_sessions
GROUP BY 1;