-- SESSION START/END + DURATION + COMPLETION FLAG (resilient)
DROP VIEW IF EXISTS public.v_sessions;

DO $$
DECLARE
  has_ar  boolean;
  has_asn boolean; has_asn_user boolean;
  has_p   boolean; has_p_user  boolean; has_p_sess boolean;
  ddl text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='assessment_responses'
  ) INTO has_ar;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='assessment_sessions'
  ) INTO has_asn;

  IF has_asn THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='assessment_sessions' AND column_name='user_id'
    ) INTO has_asn_user;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='profiles'
  ) INTO has_p;

  IF has_p THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='profiles' AND column_name='user_id'
    ) INTO has_p_user;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='profiles' AND column_name='session_id'
    ) INTO has_p_sess;
  END IF;

  IF NOT has_ar THEN
    -- stub keeps migrations green
    ddl := $SQL$
      CREATE VIEW public.v_sessions AS
      SELECT
        NULL::uuid        AS user_id,
        NULL::uuid        AS session_id,
        NULL::timestamptz AS started_at,
        NULL::timestamptz AS ended_at,
        NULL::int         AS duration_sec,
        NULL::boolean     AS completed,
        NULL::int         AS answers
      WHERE false;
    $SQL$;

  ELSIF has_asn AND has_asn_user THEN
    -- prefer assessment_sessions.user_id
    ddl := $SQL$
      CREATE VIEW public.v_sessions AS
      WITH base AS (
        SELECT
          r.session_id,
          MIN(r.created_at) AS started_at,
          MAX(r.created_at) AS ended_at,
          COUNT(*)          AS answers
        FROM public.assessment_responses r
        GROUP BY r.session_id
      )
      SELECT
        s.user_id,
        b.session_id,
        b.started_at,
        b.ended_at,
        CASE WHEN b.started_at IS NOT NULL AND b.ended_at IS NOT NULL
             THEN EXTRACT(epoch FROM (b.ended_at - b.started_at))::int
             ELSE NULL END AS duration_sec,
        (b.ended_at IS NOT NULL) AS completed,
        b.answers
      FROM base b
      LEFT JOIN public.assessment_sessions s
        ON s.id = b.session_id;
    $SQL$;

  ELSIF has_p AND has_p_user AND has_p_sess THEN
    -- fallback: derive user_id from profiles via session_id
    ddl := $SQL$
      CREATE VIEW public.v_sessions AS
      WITH base AS (
        SELECT
          r.session_id,
          MIN(r.created_at) AS started_at,
          MAX(r.created_at) AS ended_at,
          COUNT(*)          AS answers
        FROM public.assessment_responses r
        GROUP BY r.session_id
      )
      SELECT
        p.user_id,
        b.session_id,
        b.started_at,
        b.ended_at,
        CASE WHEN b.started_at IS NOT NULL AND b.ended_at IS NOT NULL
             THEN EXTRACT(epoch FROM (b.ended_at - b.started_at))::int
             ELSE NULL END AS duration_sec,
        (b.ended_at IS NOT NULL) AS completed,
        b.answers
      FROM base b
      LEFT JOIN public.profiles p
        ON p.session_id = b.session_id;
    $SQL$;

  ELSE
    -- minimal view without user_id source
    ddl := $SQL$
      CREATE VIEW public.v_sessions AS
      WITH base AS (
        SELECT
          r.session_id,
          MIN(r.created_at) AS started_at,
          MAX(r.created_at) AS ended_at,
          COUNT(*)          AS answers
        FROM public.assessment_responses r
        GROUP BY r.session_id
      )
      SELECT
        NULL::uuid AS user_id,
        b.session_id,
        b.started_at,
        b.ended_at,
        CASE WHEN b.started_at IS NOT NULL AND b.ended_at IS NOT NULL
             THEN EXTRACT(epoch FROM (b.ended_at - b.started_at))::int
             ELSE NULL END AS duration_sec,
        (b.ended_at IS NOT NULL) AS completed,
        b.answers
      FROM base b;
    $SQL$;
  END IF;

  EXECUTE ddl;
END$$;
