CREATE OR REPLACE VIEW v_sessions
  (session_id, user_id, started_at, last_event_at, duration_sec, completed)
AS
SELECT
  r.session_id AS session_id,
  COALESCE(p.user_id, s.user_id) AS user_id,
  MIN(r.created_at) AS started_at,
  MAX(r.created_at) AS last_event_at,
  EXTRACT(EPOCH FROM (MAX(r.created_at) - MIN(r.created_at)))::INT AS duration_sec,
  EXISTS (
    SELECT 1
    FROM profiles p2
    WHERE p2.session_id = r.session_id
  ) AS completed
FROM assessment_responses r
LEFT JOIN profiles p
  ON p.session_id = r.session_id
LEFT JOIN assessment_sessions s
  ON s.id = r.session_id
GROUP BY
  r.session_id,
  COALESCE(p.user_id, s.user_id);
