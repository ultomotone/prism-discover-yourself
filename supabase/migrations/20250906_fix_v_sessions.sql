-- fix v_sessions: derive user_id from sessions (or profiles if present)
-- up
DROP VIEW IF EXISTS v_sessions;

CREATE OR REPLACE VIEW v_sessions AS
WITH resp AS (
  SELECT
    session_id,
    COUNT(*)               AS responses_count,
    MIN(answered_at)       AS first_answer_at,
    MAX(answered_at)       AS last_answer_at
  FROM assessment_responses
  GROUP BY session_id
)
SELECT
  s.id                           AS session_id,
  COALESCE(p.user_id, s.user_id) AS user_id,
  s.email,
  s.started_at,
  s.completed_at,
  s.status,
  COALESCE(r.responses_count, 0) AS responses_count,
  r.first_answer_at,
  r.last_answer_at,
  CASE
    WHEN s.status = 'completed' OR p.session_id IS NOT NULL THEN 'completed'
    WHEN COALESCE(r.responses_count, 0) > 0 THEN 'in_progress'
    ELSE 'started'
  END                            AS derived_status
FROM assessment_sessions s
LEFT JOIN resp r ON r.session_id = s.id
LEFT JOIN profiles p ON p.session_id = s.id;

-- down
DROP VIEW IF EXISTS v_sessions;

CREATE OR REPLACE VIEW v_sessions AS
SELECT
  r.user_id,
  r.session_id,
  MIN(r.created_at) AS started_at,
  MAX(r.created_at) AS last_event_at,
  EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
  EXISTS (SELECT 1 FROM profiles p WHERE p.session_id = r.session_id) AS completed
FROM assessment_responses r
GROUP BY r.user_id, r.session_id;
