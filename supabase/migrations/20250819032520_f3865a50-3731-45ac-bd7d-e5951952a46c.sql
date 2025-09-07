-- Add missing section column to assessment_scoring_key if it doesn't exist
ALTER TABLE assessment_scoring_key ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'core';

-- Update existing records with sample section values (you can adjust these based on your actual sections)
UPDATE assessment_scoring_key SET section = 'cognitive_functions' WHERE section IS NULL AND question_id BETWEEN 1 AND 50;
UPDATE assessment_scoring_key SET section = 'scenarios' WHERE section IS NULL AND question_id BETWEEN 51 AND 100;
UPDATE assessment_scoring_key SET section = 'preferences' WHERE section IS NULL AND question_id BETWEEN 101 AND 150;
UPDATE assessment_scoring_key SET section = 'states' WHERE section IS NULL AND question_id > 150;

-- SESSION START/END + DURATION + COMPLETION FLAG
DROP VIEW IF EXISTS v_sessions CASCADE;
CREATE VIEW v_sessions AS
WITH resp AS (
  SELECT
    ar.session_id,
    COUNT(*)                       AS response_count,
    MIN(ar.created_at)             AS first_answer_at,
    MAX(ar.created_at)             AS last_answer_at
  FROM assessment_responses ar
  GROUP BY ar.session_id
)
SELECT
  s.id                              AS session_id,
  COALESCE(s.user_id, p.user_id)    AS user_id,
  r.first_answer_at                 AS started_at,
  r.last_answer_at                  AS last_event_at,
  EXTRACT(EPOCH FROM (r.last_answer_at - r.first_answer_at))::int AS duration_sec,
  EXISTS (SELECT 1 FROM profiles px WHERE px.session_id = s.id) AS completed
FROM assessment_sessions s
LEFT JOIN profiles p ON p.session_id = s.id
LEFT JOIN resp r ON r.session_id = s.id;

-- PROFILES EXTENDED (TOP GAP, OVERLAY +/-)
CREATE OR REPLACE VIEW v_profiles_ext AS
SELECT
  p.*,
  SUBSTRING(p.type_code FROM 1 FOR 3) as type_top,
  (p.type_scores->(p.top_types->>0)->>'fit_abs')::float as fit_top,
  (p.type_scores->(p.top_types->>1)->>'fit_abs')::float as fit_2,
  ((p.type_scores->(p.top_types->>0)->>'fit_abs')::float
   - (p.type_scores->(p.top_types->>1)->>'fit_abs')::float) as fit_gap,
  (p.validity->>'inconsistency')::float as inconsistency,
  (p.validity->>'sd_index')::float as sd_index
FROM profiles p;

-- FUNNEL by SECTION
CREATE OR REPLACE VIEW v_section_progress AS
SELECT
  r.session_id,
  sk.section,
  COUNT(*) as answered
FROM assessment_responses r
JOIN assessment_scoring_key sk USING (question_id)
GROUP BY r.session_id, sk.section;

-- ITEM DIAGNOSTICS (basic stats)
CREATE OR REPLACE VIEW v_item_stats AS
SELECT
  sk.question_id,
  sk.scale_type,
  sk.tag,
  sk.reverse_scored,
  sk.social_desirability,
  sk.section,
  COUNT(r.answer_value) as n,
  AVG(NULLIF(r.answer_value::float, 'NaN')) as mean_val,
  STDDEV(NULLIF(r.answer_value::float, 'NaN')) as sd_val
FROM assessment_scoring_key sk
LEFT JOIN assessment_responses r USING (question_id)
GROUP BY 1,2,3,4,5,6;

-- ITEM-TOTAL CORRELATION for Te strength
CREATE OR REPLACE VIEW v_item_total_te AS
SELECT
  r.question_id,
  CORR(r.answer_value::float, (p.strengths->>'Te')::float) as r_item_total_te
FROM assessment_responses r
JOIN assessment_scoring_key sk USING (question_id)
JOIN profiles p USING (session_id)
WHERE sk.tag LIKE 'Te_%'
GROUP BY r.question_id;

-- RETEST PAIRS & DELTAS
CREATE OR REPLACE VIEW v_retest_pairs AS
SELECT
  a.user_id,
  a.session_id as session_id_1, 
  b.session_id as session_id_2,
  a.created_at as t1, 
  b.created_at as t2,
  a.type_code as type_1, 
  b.type_code as type_2,
  a.strengths as strengths_1, 
  b.strengths as strengths_2,
  a.dimensions as dimensions_1, 
  b.dimensions as dimensions_2,
  a.blocks_norm as blocks_1, 
  b.blocks_norm as blocks_2,
  a.overlay as overlay_1, 
  b.overlay as overlay_2
FROM profiles a
JOIN profiles b ON a.user_id = b.user_id AND b.created_at > a.created_at;

CREATE OR REPLACE VIEW v_retest_deltas AS
SELECT
  user_id, 
  session_id_1, 
  session_id_2, 
  t1, 
  t2,
  EXTRACT(epoch FROM (t2 - t1))/86400.0 as days_between,
  (SELECT SQRT(SUM(((s2.value::numeric) - (s1.value::numeric))^2))
     FROM jsonb_each_text(strengths_1) s1
     JOIN jsonb_each_text(strengths_2) s2 USING (key)) as strength_delta,
  (SELECT COUNT(*) FROM jsonb_each_text(dimensions_1) d1
     JOIN jsonb_each_text(dimensions_2) d2 USING (key)
     WHERE d1.value <> d2.value) as dim_change_ct,
  (type_1 <> type_2) as type_changed
FROM v_retest_pairs;