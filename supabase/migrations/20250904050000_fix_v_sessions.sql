-- SESSION START/END + DURATION + COMPLETION FLAG + DERIVED STATUS
DO $$
BEGIN
  IF to_regclass('public.v_sessions_core') IS NULL THEN
    CREATE VIEW public.v_sessions_core AS
    WITH resp AS (
      SELECT
        ar.session_id,
        COUNT(*) AS response_count,
        MIN(ar.created_at) AS first_answer_at,
        MAX(ar.created_at) AS last_answer_at
      FROM public.assessment_responses ar
      GROUP BY ar.session_id
    )
    SELECT
      s.id AS session_id,
      COALESCE(s.user_id, p.user_id) AS user_id,
      CASE
        WHEN s.completed_at IS NOT NULL THEN 'completed'
        WHEN r.response_count > 0 THEN 'in_progress'
        ELSE 'started'
      END AS status,
      s.started_at,
      s.completed_at,
      EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) AS duration_sec,
      r.response_count,
      r.first_answer_at,
      r.last_answer_at
    FROM public.assessment_sessions s
    LEFT JOIN public.profiles p ON p.session_id = s.id
    LEFT JOIN resp r ON r.session_id = s.id;
  ELSE
    CREATE OR REPLACE VIEW public.v_sessions_core AS
    WITH resp AS (
      SELECT
        ar.session_id,
        COUNT(*) AS response_count,
        MIN(ar.created_at) AS first_answer_at,
        MAX(ar.created_at) AS last_answer_at
      FROM public.assessment_responses ar
      GROUP BY ar.session_id
    )
    SELECT
      s.id AS session_id,
      COALESCE(s.user_id, p.user_id) AS user_id,
      CASE
        WHEN s.completed_at IS NOT NULL THEN 'completed'
        WHEN r.response_count > 0 THEN 'in_progress'
        ELSE 'started'
      END AS status,
      s.started_at,
      s.completed_at,
      EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) AS duration_sec,
      r.response_count,
      r.first_answer_at,
      r.last_answer_at
    FROM public.assessment_sessions s
    LEFT JOIN public.profiles p ON p.session_id = s.id
    LEFT JOIN resp r ON r.session_id = s.id;
  END IF;
END
$$;

ALTER VIEW public.v_sessions_core SET (security_invoker = true);
GRANT SELECT ON public.v_sessions_core TO authenticated;

CREATE OR REPLACE VIEW public.v_sessions AS
SELECT
  session_id,
  user_id,
  status,
  started_at,
  completed_at,
  duration_sec,
  response_count,
  first_answer_at,
  last_answer_at
FROM public.v_sessions_core;

ALTER VIEW public.v_sessions SET (security_invoker = true);
GRANT SELECT ON public.v_sessions TO authenticated;
