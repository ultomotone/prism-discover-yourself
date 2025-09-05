-- Preview-safe v_sessions_core, resilient to missing aux tables.
DO $$
DECLARE
  has_sessions   boolean := to_regclass('public.assessment_sessions')   IS NOT NULL;
  has_profiles   boolean := to_regclass('public.profiles')              IS NOT NULL;
  has_responses  boolean := to_regclass('public.assessment_responses')  IS NOT NULL;
BEGIN
  IF NOT has_sessions THEN
    RAISE NOTICE 'Skipping v_sessions_core: public.assessment_sessions missing (Preview order).';
    RETURN;
  END IF;

  -- Build v_sessions_core depending on what exists
  IF has_profiles AND has_responses THEN
    -- Full shape: sessions + profiles + responses rollups
    EXECUTE $sql$
      CREATE OR REPLACE VIEW public.v_sessions_core AS
      WITH resp AS (
        SELECT
          ar.session_id,
          COUNT(*)                AS response_count,
          MIN(ar.created_at)      AS first_answer_at,
          MAX(ar.created_at)      AS last_answer_at
        FROM public.assessment_responses ar
        GROUP BY ar.session_id
      )
      SELECT
        s.id                                         AS session_id,
        COALESCE(s.user_id, p.user_id)               AS user_id,
        CASE
          WHEN s.completed_at IS NOT NULL            THEN 'completed'
          WHEN r.response_count > 0                  THEN 'in_progress'
          ELSE 'started'
        END                                          AS status,
        s.started_at                                 AS started_at,
        s.completed_at                               AS completed_at,
        GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at), 0)::bigint AS duration_sec,
        r.response_count                             AS response_count,
        r.first_answer_at                            AS first_answer_at,
        r.last_answer_at                             AS last_answer_at
      FROM public.assessment_sessions s
      LEFT JOIN public.profiles p ON p.session_id = s.id
      LEFT JOIN resp r           ON r.session_id = s.id
    $sql$;
  ELSIF has_profiles THEN
    -- Partial: sessions + profiles (no responses rollup)
    EXECUTE $sql$
      CREATE OR REPLACE VIEW public.v_sessions_core AS
      SELECT
        s.id                                         AS session_id,
        COALESCE(s.user_id, p.user_id)               AS user_id,
        CASE
          WHEN s.completed_at IS NOT NULL            THEN 'completed'
          ELSE 'started'
        END                                          AS status,
        s.started_at                                 AS started_at,
        s.completed_at                               AS completed_at,
        GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at), 0)::bigint AS duration_sec,
        NULL::bigint                                 AS response_count,
        NULL::timestamptz                            AS first_answer_at,
        NULL::timestamptz                            AS last_answer_at
      FROM public.assessment_sessions s
      LEFT JOIN public.profiles p ON p.session_id = s.id
    $sql$;
  ELSE
    -- Minimal: sessions only
    EXECUTE $sql$
      CREATE OR REPLACE VIEW public.v_sessions_core AS
      SELECT
        s.id                                         AS session_id,
        s.user_id                                    AS user_id,
        CASE
          WHEN s.completed_at IS NOT NULL            THEN 'completed'
          ELSE 'started'
        END                                          AS status,
        s.started_at                                 AS started_at,
        s.completed_at                               AS completed_at,
        GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at), 0)::bigint AS duration_sec,
        NULL::bigint                                 AS response_count,
        NULL::timestamptz                            AS first_answer_at,
        NULL::timestamptz                            AS last_answer_at
      FROM public.assessment_sessions s
    $sql$;
  END IF;

  -- Security & grants on the core view
  EXECUTE 'ALTER VIEW public.v_sessions_core SET (security_invoker = true)';
  EXECUTE 'GRANT SELECT ON public.v_sessions_core TO anon, authenticated';
  EXECUTE $$COMMENT ON VIEW public.v_sessions_core IS
    'Core sessions view: resilient definition (sessions±profiles±responses), non-negative durations.'$$;

    -- Legacy wrapper mirrors _core (keeps downstream stable)
    EXECUTE $sql$
      CREATE OR REPLACE VIEW public.v_sessions AS
      SELECT * FROM public.v_sessions_core
    $sql$;
    EXECUTE 'ALTER VIEW public.v_sessions SET (security_invoker = true)';
    EXECUTE 'GRANT SELECT ON public.v_sessions TO anon, authenticated';
END
$$;
