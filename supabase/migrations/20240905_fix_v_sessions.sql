-- Preview-safe rebuild of public.v_sessions.
-- - No CASCADE
-- - Replaces view in place (preserve dependents)
-- - Restores SECURITY INVOKER
-- - Guards when base tables don't exist (Preview order)

DO $$
BEGIN
  -- Ensure base tables exist before (re)creating the view
  IF to_regclass('public.assessment_sessions') IS NULL THEN
    RAISE NOTICE 'Skipping v_sessions: public.assessment_sessions missing (Preview order).';
    RETURN;
  END IF;

  -- Optional: if results table is optional, allow it to be missing and omit the join
  IF to_regclass('public.assessment_results') IS NULL THEN
    RAISE NOTICE 'Creating v_sessions without assessment_results join.';
    EXECUTE $sql$
      CREATE OR REPLACE VIEW public.v_sessions AS
      SELECT
        s.id           AS session_id,
        s.user_id      AS user_id,
        s.started_at   AS started_at,
        s.completed_at AS completed_at,
        s.status       AS status,
        CASE
          WHEN s.started_at IS NOT NULL THEN
            GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at), 0)::bigint
        END            AS duration_seconds,
        (
          s.completed_at IS NOT NULL
          OR LOWER(COALESCE(s.status, '')) IN ('completed','complete','finalized','scored')
        )              AS is_completed,
        NULL::uuid     AS result_id,
        NULL::timestamptz AS result_created_at
      FROM public.assessment_sessions AS s;
    $sql$;
  ELSE
    EXECUTE $sql$
      CREATE OR REPLACE VIEW public.v_sessions AS
      SELECT
        s.id           AS session_id,
        s.user_id      AS user_id,
        s.started_at   AS started_at,
        s.completed_at AS completed_at,
        s.status       AS status,
        CASE
          WHEN s.started_at IS NOT NULL THEN
            GREATEST(EXTRACT(EPOCH FROM COALESCE(s.completed_at, NOW()) - s.started_at), 0)::bigint
        END            AS duration_seconds,
        (
          s.completed_at IS NOT NULL
          OR LOWER(COALESCE(s.status, '')) IN ('completed','complete','finalized','scored')
        )              AS is_completed,
        r.id           AS result_id,
        r.created_at   AS result_created_at
      FROM public.assessment_sessions AS s
      LEFT JOIN public.assessment_results AS r
        ON r.session_id = s.id;
    $sql$;
  END IF;

  -- Preserve prior security semantics (RLS applies through the view)
  EXECUTE 'ALTER VIEW public.v_sessions SET (security_invoker = true)';

  -- Keep grants (note: does not bypass RLS on base tables)
  EXECUTE 'GRANT SELECT ON public.v_sessions TO anon, authenticated';

  -- Optional: keep the comment
  EXECUTE 'COMMENT ON VIEW public.v_sessions IS ''Sessions with optional linked results; includes duration and completion flag.''';

END
$$;
