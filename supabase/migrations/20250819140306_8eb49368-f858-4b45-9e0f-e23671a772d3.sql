-- Evidence KPIs (resilient)

-- 1) Ensure v_retest_pairs exists (build from profiles if available; else stub)
DROP VIEW IF EXISTS public.v_retest_pairs;

DO $$
DECLARE
  has_profiles   boolean;
  has_session_id boolean;
  has_user_id    boolean;
  has_created_at boolean;
  has_top_types  boolean;
  has_fn_strengths boolean;
  has_strengths  boolean;
  has_type_scores boolean;
  ddl text;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables
                 WHERE table_schema='public' AND table_name='profiles') INTO has_profiles;

  IF has_profiles THEN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='session_id')
      INTO has_session_id;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='user_id')
      INTO has_user_id;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='created_at')
      INTO has_created_at;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='top_types')
      INTO has_top_types;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='function_strengths')
      INTO has_fn_strengths;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='strengths')
      INTO has_strengths;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='type_scores')
      INTO has_type_scores;
  END IF;

  IF has_profiles AND has_session_id AND has_user_id AND has_created_at THEN
    -- Prefer function_strengths → strengths → type_scores as the "strengths" source
    ddl := $SQL$
      CREATE VIEW public.v_retest_pairs AS
      WITH prof AS (
        SELECT
          p.user_id,
          p.session_id,
          p.created_at,
          COALESCE(
            (CASE WHEN $fn$TRUE$fn$ THEN p.function_strengths END),
            (CASE WHEN $st$TRUE$st$ THEN p.strengths END),
            (CASE WHEN $ts$TRUE$ts$ THEN p.type_scores END),
            '{}'::jsonb
          ) AS strengths,
          COALESCE(p.top_types, '[]'::jsonb) AS top_types
        FROM public.profiles p
        WHERE p.session_id IS NOT NULL
      ),
      seq AS (
        SELECT
          user_id,
          LAG(session_id)   OVER (PARTITION BY user_id ORDER BY created_at) AS session_id_1,
          session_id                                                     AS session_id_2,
          LAG(created_at)  OVER (PARTITION BY user_id ORDER BY created_at) AS t1,
          created_at                                                     AS t2,
          LAG(strengths)   OVER (PARTITION BY user_id ORDER BY created_at) AS strengths_1,
          strengths                                                      AS strengths_2,
          LAG(top_types)   OVER (PARTITION BY user_id ORDER BY created_at) AS top_types_1,
          top_types                                                      AS top_types_2
        FROM prof
      )
      SELECT *
      FROM seq
      WHERE session_id_1 IS NOT NULL;
    $SQL$;

    -- substitute TRUE/FALSE based on column existence
    ddl := replace(ddl, '$fn$TRUE$fn$', CASE WHEN has_fn_strengths THEN 'TRUE' ELSE 'FALSE' END);
    ddl := replace(ddl, '$st$TRUE$st$', CASE WHEN has_strengths THEN 'TRUE' ELSE 'FALSE' END);
    ddl := replace(ddl, '$ts$TRUE$ts$', CASE WHEN has_type_scores THEN 'TRUE' ELSE 'FALSE' END);

  ELSE
    -- Stub: correct shape, zero rows (keeps later views creatable)
    ddl := $SQL$
      CREATE VIEW public.v_retest_pairs AS
      SELECT
        NULL::uuid         AS user_id,
        NULL::uuid         AS session_id_1,
        NULL::uuid         AS session_id_2,
        NULL::timestamptz  AS t1,
        NULL::timestamptz  AS t2,
        '{}'::jsonb        AS strengths_1,
        '{}'::jsonb        AS strengths_2,
        '[]'::jsonb        AS top_types_1,
        '[]'::jsonb        AS top_types_2
      WHERE FALSE;
    $SQL$;
  END IF;

  EXECUTE ddl;
END$$;

-- 2) Now (re)create the KPI view that depends on v_retest_pairs
DROP VIEW IF EXISTS public.v_test_retest_strength_r;

CREATE VIEW public.v_test_retest_strength_r AS
SELECT 
  user_id,
  session_id_1, 
  session_id_2,
  t1, 
  t2,
  -- correlation across 8 functions
  (SELECT corr(s1::float, s2::float)
     FROM (SELECT (strengths_1->>'Ti')::float UNION ALL
                  SELECT (strengths_1->>'Te')::float UNION ALL
                  SELECT (strengths_1->>'Fi')::float UNION ALL
                  SELECT (strengths_1->>'Fe')::float UNION ALL
                  SELECT (strengths_1->>'Ni')::float UNION ALL
                  SELECT (strengths_1->>'Ne')::float UNION ALL
                  SELECT (strengths_1->>'Si')::float UNION ALL
                  SELECT (strengths_1->>'Se')::float) a(s1),
          (SELECT (strengths_2->>'Ti')::float UNION ALL
                  SELECT (strengths_2->>'Te')::float UNION ALL
                  SELECT (strengths_2->>'Fi')::float UNION ALL
                  SELECT (strengths_2->>'Fe')::float UNION ALL
                  SELECT (strengths_2->>'Ni')::float UNION ALL
                  SELECT (strengths_2->>'Ne')::float UNION ALL
                  SELECT (strengths_2->>'Si')::float UNION ALL
                  SELECT (strengths_2->>'Se')::float) b(s2)
  ) AS r_strengths,
  EXTRACT(day FROM (t2 - t1))::int AS days_apart,
  (top_types_1->>0) AS top1_a,
  (top_types_2->>0) AS top1_b,
  ((top_types_1->>0) = (top_types_2->>0)) AS stable,
  ((top_types_1->>0) <> (top_types_2->>0)
    AND (top_types_1->>1) = (top_types_2->>0)
    AND (top_types_1->>0) = (top_types_2->>1)) AS adjacent_flip
FROM public.v_retest_pairs;
