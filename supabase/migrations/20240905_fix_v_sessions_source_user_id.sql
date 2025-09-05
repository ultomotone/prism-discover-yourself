-- Replace v_sessions to source user_id from sessions (s), not results (r)
-- Preview-safe: guards base table existence, no CASCADE, preserves dependents.

DO $$
BEGIN
  IF to_regclass('public.assessment_sessions') IS NULL THEN
    RAISE NOTICE 'Skipping v_sessions update: public.assessment_sessions missing (Preview order).';
    RETURN;
  END IF;

  IF to_regclass('public.assessment_results') IS NULL THEN
    -- Create without the results join if results table not present yet
    EXECUTE $sql$
      CREATE OR REPLACE VIEW public.v_sessions AS
      SELECT
        s.id             AS session_id,
        s.user_id        AS user_id,       -- ✅ from sessions
        s.started_at     AS started_at,
        s.completed_at   AS completed_at,
        s.status         AS status,
        CASE
          WHEN s.started_at IS NOT NULL THEN
            GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at), 0)::bigint
        END             AS duration_seconds,
        (
          s.completed_at IS NOT NULL
          OR LOWER(COALESCE(s.status, '')) IN ('completed','complete','finalized','scored')
        )                AS is_completed,
        NULL::uuid       AS result_id,
        NULL::timestamptz AS result_created_at
      FROM public.assessment_sessions AS s;
    $sql$;
  ELSE
    EXECUTE $sql$
      CREATE OR REPLACE VIEW public.v_sessions AS
      SELECT
        s.id             AS session_id,
        s.user_id        AS user_id,       -- ✅ from sessions
        s.started_at     AS started_at,
        s.completed_at   AS completed_at,
        s.status         AS status,
        CASE
          WHEN s.started_at IS NOT NULL THEN
            GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at), 0)::bigint
        END             AS duration_seconds,
        (
          s.completed_at IS NOT NULL
          OR LOWER(COALESCE(s.status, '')) IN ('completed','complete','finalized','scored')
        )                AS is_completed,
        r.id             AS result_id,
        r.created_at     AS result_created_at
      FROM public.assessment_sessions AS s
      LEFT JOIN public.assessment_results AS r
        ON r.session_id = s.id;
    $sql$;
  END IF;

  -- Preserve RLS semantics
  EXECUTE 'ALTER VIEW public.v_sessions SET (security_invoker = true)';
  EXECUTE 'GRANT SELECT ON public.v_sessions TO anon, authenticated';

  EXECUTE $$COMMENT ON VIEW public.v_sessions IS
    ''Sessions with optional linked results; user_id from sessions; includes duration and completion flag.''$$;
END
$$;
