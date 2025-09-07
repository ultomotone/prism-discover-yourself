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
LEFT JOIN assessment_sessions s ON s.id = v.session_id;

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

-- 10) Section timing / drop-off (resilient to missing source tables)
DROP VIEW IF EXISTS public.v_section_times;

DO $$
DECLARE
  has_ar       boolean;
  has_aq       boolean;
  has_aq_sec   boolean;
  has_aq_meta  boolean;
  has_qs       boolean;
  ddl          text;
BEGIN
  -- do we have responses to build anything?
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='assessment_responses'
  ) INTO has_ar;

  -- preferred source: assessment_questions (either section or meta->>'section')
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='assessment_questions'
  ) INTO has_aq;

  IF has_aq THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='assessment_questions' AND column_name='section'
    ) INTO has_aq_sec;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='assessment_questions' AND column_name='meta'
    ) INTO has_aq_meta;
  END IF;

  -- alternate mapping table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='question_sections'
  ) INTO has_qs;

  IF NOT has_ar THEN
    -- nothing to aggregate yet: create a stub view to keep migrations green
    ddl := $SQL$
      CREATE VIEW public.v_section_times AS
      SELECT NULL::uuid AS session_id,
             'Unknown'  AS section,
             NULL::timestamptz AS started_at,
             NULL::timestamptz AS ended_at,
             NULL::int  AS duration_sec,
             0          AS answers
      WHERE false;
    $SQL$;

  ELSIF has_aq AND has_aq_sec THEN
    ddl := $SQL$
      CREATE VIEW public.v_section_times AS
      SELECT
        r.session_id,
        COALESCE(q.section, 'Unknown') AS section,
        MIN(r.created_at) AS started_at,
        MAX(r.created_at) AS ended_at,
        EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
        COUNT(*) AS answers
      FROM public.assessment_responses r
      JOIN public.assessment_questions q ON q.id = r.question_id
      GROUP BY r.session_id, COALESCE(q.section,'Unknown');
    $SQL$;

  ELSIF has_aq AND has_aq_meta THEN
    ddl := $SQL$
      CREATE VIEW public.v_section_times AS
      SELECT
        r.session_id,
        COALESCE(q.meta->>'section', 'Unknown') AS section,
        MIN(r.created_at) AS started_at,
        MAX(r.created_at) AS ended_at,
        EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
        COUNT(*) AS answers
      FROM public.assessment_responses r
      JOIN public.assessment_questions q ON q.id = r.question_id
      GROUP BY r.session_id, COALESCE(q.meta->>'section','Unknown');
    $SQL$;

  ELSIF has_qs THEN
    ddl := $SQL$
      CREATE VIEW public.v_section_times AS
      SELECT
        r.session_id,
        COALESCE(qs.section,'Unknown') AS section,
        MIN(r.created_at) AS started_at,
        MAX(r.created_at) AS ended_at,
        EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
        COUNT(*) AS answers
      FROM public.assessment_responses r
      LEFT JOIN public.question_sections qs ON qs.question_id = r.question_id
      GROUP BY r.session_id, COALESCE(qs.section,'Unknown');
    $SQL$;

  ELSE
    -- final fallback: no section source yet → group per session as 'Unknown'
    ddl := $SQL$
      CREATE VIEW public.v_section_times AS
      SELECT
        r.session_id,
        'Unknown' AS section,
        MIN(r.created_at) AS started_at,
        MAX(r.created_at) AS ended_at,
        EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
        COUNT(*) AS answers
      FROM public.assessment_responses r
      GROUP BY r.session_id;
    $SQL$;
  END IF;

  EXECUTE ddl;
END$$;

-- (optional) grant read access
-- GRANT SELECT ON public.v_section_times TO anon, authenticated;

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