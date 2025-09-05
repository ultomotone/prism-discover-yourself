-- SESSION START/END + DURATION + COMPLETION FLAG + DERIVED STATUS
DO $$
BEGIN
  IF to_regclass('public.v_sessions_core') IS NULL THEN
    EXECUTE $sql$
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
        GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at),0)::bigint AS duration_sec,
        r.response_count,
        r.first_answer_at,
        r.last_answer_at
      FROM public.assessment_sessions s
      LEFT JOIN public.profiles p ON p.session_id = s.id
      LEFT JOIN resp r ON r.session_id = s.id;
    $sql$;
  ELSE
    EXECUTE $sql$
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
        GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at),0)::bigint AS duration_sec,
        r.response_count,
        r.first_answer_at,
        r.last_answer_at
      FROM public.assessment_sessions s
      LEFT JOIN public.profiles p ON p.session_id = s.id
      LEFT JOIN resp r ON r.session_id = s.id;
    $sql$;
  END IF;

  -- set security/grants on the core view
  EXECUTE 'ALTER VIEW public.v_sessions_core SET (security_invoker = true)';
  EXECUTE 'GRANT SELECT ON public.v_sessions_core TO anon, authenticated';

  -- redefine legacy wrapper to mirror _core (no CASCADE, no shape change in dependents)
  EXECUTE $sql$
    CREATE OR REPLACE VIEW public.v_sessions AS
    SELECT * FROM public.v_sessions_core
  $sql$;
  EXECUTE 'ALTER VIEW public.v_sessions SET (security_invoker = true)';
  EXECUTE 'GRANT SELECT ON public.v_sessions TO anon, authenticated';
END
$$;
