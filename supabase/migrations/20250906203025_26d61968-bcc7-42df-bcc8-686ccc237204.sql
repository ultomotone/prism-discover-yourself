-- Repair analytics view chain by redefining v_sessions and dependents to a stable schema
-- 1) Drop dependent views to avoid column-shape conflicts
DROP VIEW IF EXISTS public.v_conf_dist CASCADE;
DROP VIEW IF EXISTS public.v_throughput CASCADE;
DROP VIEW IF EXISTS public.v_section_times CASCADE;
DROP VIEW IF EXISTS public.v_share_entropy CASCADE;
DROP VIEW IF EXISTS public.v_dim_coverage CASCADE;
DROP VIEW IF EXISTS public.v_fc_coverage CASCADE;
DROP VIEW IF EXISTS public.v_validity CASCADE;
DROP VIEW IF EXISTS public.v_duplicates CASCADE;
DROP VIEW IF EXISTS public.v_overlay_conf CASCADE;
DROP VIEW IF EXISTS public.v_quality CASCADE;
DROP VIEW IF EXISTS public.v_fit_ranks CASCADE;
DROP VIEW IF EXISTS public.v_sessions_plus CASCADE;
DROP VIEW IF EXISTS public.v_sessions CASCADE;

-- 2) Recreate v_sessions using profiles (no r.user_id dependency)
CREATE VIEW public.v_sessions AS
SELECT
  p.user_id,
  p.session_id,
  p.created_at::date AS d,
  p.type_code,
  left(p.type_code,3) AS type3,
  p.overlay,
  p.confidence,
  (p.validity->>'inconsistency')::float AS inconsistency,
  (p.validity->>'sd_index')::float AS sd_index,
  p.strengths,
  p.dimensions,
  p.type_scores,
  p.top_types,
  p.created_at
FROM public.profiles p;

ALTER VIEW public.v_sessions SET (security_invoker = true);

-- 3) Recreate v_sessions_plus with session timing
CREATE VIEW public.v_sessions_plus AS
SELECT
  v.*,
  s.started_at,
  s.completed_at,
  CASE 
    WHEN s.completed_at IS NOT NULL AND s.started_at IS NOT NULL 
    THEN EXTRACT(epoch FROM (s.completed_at - s.started_at))::integer
    ELSE NULL 
  END AS duration_sec,
  COALESCE(s.metadata->>'device','unknown') AS device
FROM public.v_sessions v
LEFT JOIN public.assessment_sessions s ON s.id = v.session_id;

ALTER VIEW public.v_sessions_plus SET (security_invoker = true);

-- 4) Top-1 / Top-2 fit + gap
CREATE VIEW public.v_fit_ranks AS
WITH pairs AS (
  SELECT
    session_id,
    (jsonb_each(type_scores)).key AS code,
    ((jsonb_each(type_scores)).value->>'fit_abs')::float AS fit
  FROM public.v_sessions
  WHERE type_scores IS NOT NULL
), ranked AS (
  SELECT session_id, code, fit,
         row_number() OVER (PARTITION BY session_id ORDER BY fit DESC) AS rk
  FROM pairs
  WHERE fit IS NOT NULL
)
SELECT
  s.session_id,
  max(CASE WHEN rk=1 THEN code END) AS top1_code,
  max(CASE WHEN rk=1 THEN fit END) AS top1_fit,
  max(CASE WHEN rk=2 THEN fit END) AS top2_fit,
  COALESCE(max(CASE WHEN rk=1 THEN fit END) - max(CASE WHEN rk=2 THEN fit END), 0) AS top_gap
FROM ranked s
GROUP BY s.session_id;

ALTER VIEW public.v_fit_ranks SET (security_invoker = true);

-- 5) Close-call/quality metrics
CREATE VIEW public.v_quality AS
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
  END AS func_balance
FROM public.v_sessions v
LEFT JOIN public.v_fit_ranks f USING (session_id);

ALTER VIEW public.v_quality SET (security_invoker = true);

-- 6) Overlay & confidence counts
CREATE VIEW public.v_overlay_conf AS
SELECT overlay, confidence, count(*) AS n
FROM public.v_sessions
GROUP BY 1,2;

ALTER VIEW public.v_overlay_conf SET (security_invoker = true);

-- 7) Duplicates (users with >1 sessions)
CREATE VIEW public.v_duplicates AS
SELECT user_id, count(*) AS sessions_ct
FROM public.v_sessions
WHERE user_id IS NOT NULL
GROUP BY 1
HAVING count(*) > 1;

ALTER VIEW public.v_duplicates SET (security_invoker = true);

-- 8) Validity pass flag
CREATE VIEW public.v_validity AS
SELECT
  session_id,
  (COALESCE(inconsistency, 0) < 1.0 AND COALESCE(sd_index, 0) < 4.3) AS pass_validity
FROM public.v_quality;

ALTER VIEW public.v_validity SET (security_invoker = true);

-- 9) Forced-choice coverage
CREATE VIEW public.v_fc_coverage AS
SELECT
  r.session_id,
  count(*) FILTER (WHERE sk.scale_type::text LIKE 'FORCED_CHOICE%') AS fc_count,
  count(*) AS answered_count
FROM public.assessment_responses r
JOIN public.assessment_scoring_key sk ON sk.question_id = r.question_id
GROUP BY 1;

ALTER VIEW public.v_fc_coverage SET (security_invoker = true);

-- 10) Dimensional coverage per function
CREATE VIEW public.v_dim_coverage AS
SELECT
  r.session_id,
  split_part(sk.tag,'_',1) AS func,
  count(*) FILTER (WHERE sk.tag LIKE '%_D') AS d_items
FROM public.assessment_responses r
JOIN public.assessment_scoring_key sk ON sk.question_id = r.question_id
WHERE sk.tag LIKE '%\_D' ESCAPE '\\'
GROUP BY 1,2;

ALTER VIEW public.v_dim_coverage SET (security_invoker = true);

-- 11) Share entropy
CREATE VIEW public.v_share_entropy AS
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
  END AS share_entropy
FROM public.v_sessions p,
LATERAL jsonb_each(p.type_scores) AS x(code, val)
WHERE p.type_scores IS NOT NULL
GROUP BY 1, p.type_scores;

ALTER VIEW public.v_share_entropy SET (security_invoker = true);

DROP VIEW IF EXISTS public.v_section_times;

-- derive section from assessment_questions.section or meta->>'section'
CREATE VIEW public.v_section_times AS
WITH qsec AS (
  SELECT
    q.id AS question_id,
    COALESCE(q.section, q.meta->>'section', 'Unknown') AS section
  FROM public.assessment_questions q
)
SELECT
  r.session_id,
  qsec.section,
  MIN(r.created_at) AS started_at,
  MAX(r.created_at) AS ended_at,
  EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
  COUNT(*) AS answers
FROM public.assessment_responses r
LEFT JOIN qsec ON qsec.question_id = r.question_id
GROUP BY r.session_id, qsec.section;

ALTER VIEW public.v_section_times SET (security_invoker = true);

-- 13) Throughput per day
CREATE VIEW public.v_throughput AS
SELECT
  date_trunc('day', COALESCE(completed_at, started_at))::date AS d,
  count(*) AS sessions
FROM public.v_sessions_plus
GROUP BY 1;

ALTER VIEW public.v_throughput SET (security_invoker = true);

-- 14) Confidence buckets
CREATE VIEW public.v_conf_dist AS
SELECT confidence, count(*) AS n
FROM public.v_sessions
GROUP BY 1;

ALTER VIEW public.v_conf_dist SET (security_invoker = true);
