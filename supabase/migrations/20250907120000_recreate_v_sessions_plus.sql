-- Recreate v_sessions_plus with explicit join and defensive column detection
-- up
DO $$
DECLARE
  has_tbl  boolean;
  has_id   boolean;
  has_sid  boolean;
  ddl      text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'assessment_sessions'
  ) INTO has_tbl;

  IF NOT has_tbl THEN
    ddl := $$
      CREATE OR REPLACE VIEW public.v_sessions_plus AS
      SELECT
        v.*,
        NULL::timestamptz AS started_at,
        NULL::timestamptz AS completed_at,
        NULL::int         AS duration_sec,
        'unknown'         AS device
      FROM public.v_sessions v;
    $$;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'assessment_sessions' AND column_name = 'id'
    ) INTO has_id;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'assessment_sessions' AND column_name = 'session_id'
    ) INTO has_sid;

    IF has_id THEN
      ddl := $$
        CREATE OR REPLACE VIEW public.v_sessions_plus AS
        SELECT
          v.*,
          s.started_at,
          s.completed_at,
          CASE
            WHEN s.completed_at IS NOT NULL AND s.started_at IS NOT NULL
              THEN EXTRACT(epoch FROM (s.completed_at - s.started_at))::int
            ELSE NULL
          END AS duration_sec,
          COALESCE(s.metadata->>'device', 'unknown') AS device
        FROM public.v_sessions v
        LEFT JOIN public.assessment_sessions s
          ON s.id = v.session_id;
      $$;
    ELSIF has_sid THEN
      ddl := $$
        CREATE OR REPLACE VIEW public.v_sessions_plus AS
        SELECT
          v.*,
          s.started_at,
          s.completed_at,
          CASE
            WHEN s.completed_at IS NOT NULL AND s.started_at IS NOT NULL
              THEN EXTRACT(epoch FROM (s.completed_at - s.started_at))::int
            ELSE NULL
          END AS duration_sec,
          COALESCE(s.metadata->>'device', 'unknown') AS device
        FROM public.v_sessions v
        LEFT JOIN public.assessment_sessions s
          ON s.session_id = v.session_id;
      $$;
    ELSE
      ddl := $$
        CREATE OR REPLACE VIEW public.v_sessions_plus AS
        SELECT
          v.*,
          NULL::timestamptz AS started_at,
          NULL::timestamptz AS completed_at,
          NULL::int         AS duration_sec,
          'unknown'         AS device
        FROM public.v_sessions v;
      $$;
    END IF;
  END IF;

  EXECUTE ddl;
  EXECUTE 'ALTER VIEW public.v_sessions_plus SET (security_invoker = true)';
END$$;

-- down
DROP VIEW IF EXISTS public.v_sessions_plus CASCADE;
