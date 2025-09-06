CREATE OR REPLACE VIEW v_sessions
  (session_id, user_id, started_at, completed_at, completed, duration_sec)
AS
SELECT
  r.session_id AS session_id,
  COALESCE(p.user_id, s.user_id) AS user_id,
  MIN(r.created_at) AS started_at,
  COALESCE(MAX(s.completed_at), MAX(r.created_at)) AS completed_at,
  CASE
    WHEN MAX(s.completed_at) IS NOT NULL THEN TRUE
    ELSE EXISTS (
      SELECT 1
      FROM profiles p2
      WHERE p2.session_id = r.session_id
    )
  END AS completed,
  EXTRACT(
    EPOCH FROM (COALESCE(MAX(s.completed_at), MAX(r.created_at)) - MIN(r.created_at))
  )::INT AS duration_sec
FROM assessment_responses r
LEFT JOIN profiles p
  ON p.session_id = r.session_id
LEFT JOIN assessment_sessions s
  ON s.id = r.session_id
GROUP BY
  r.session_id,
  COALESCE(p.user_id, s.user_id);
