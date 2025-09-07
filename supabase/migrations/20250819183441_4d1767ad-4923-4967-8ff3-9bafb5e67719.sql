-- supabase/migrations/20250907035100_evidence_kpis.sql
-- Builds v_retest_pairs and all Evidence KPI views in a dependency-safe order.

-- 0) Foundation: (re)create v_retest_pairs
DROP VIEW IF EXISTS public.v_retest_pairs;

DO $$
DECLARE
  has_profiles      boolean;
  has_user_id       boolean;
  has_session_id    boolean;
  has_created_at    boolean;
  has_top_types     boolean;
  has_fn_strengths  boolean;
  has_strengths     boolean;
  has_type_scores   boolean;
  has_dimensions    boolean;
  ddl               text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='profiles'
  ) INTO has_profiles;

  IF has_profiles THEN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='user_id')
      INTO has_user_id;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='session_id')
      INTO has_session_id;
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
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='dimensions')
      INTO has_dimensions;
  END IF;

  IF has_profiles AND has_user_id AND has_session_id AND has_created_at THEN
    ddl := $SQL$
      CREATE VIEW public.v_retest_pairs AS
      WITH prof AS (
        SELECT
          p.user_id,
          p.session_id,
          p.created_at,
          -- choose the best available strengths source
          COALESCE(
            (CASE WHEN $HAS_FN$ THEN p.function_strengths END),
            (CASE WHEN $HAS_ST$ THEN p.strengths END),
            (CASE WHEN $HAS_TS$ THEN p.type_scores END),
            '{}'::jsonb
          ) AS strengths,
          COALESCE(p.top_types, '[]'::jsonb) AS top_types,
          COALESCE(p.dimensions, '{}'::jsonb) AS dimensions
        FROM public.profiles p
        WHERE p.session_id IS NOT NULL
      ),
      seq AS (
        SELECT
          user_id,
          LAG(session_id)  OVER (PARTITION BY user_id ORDER BY created_at) AS session_id_1,
          session_id                                                     AS session_id_2,
          LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) AS t1,
          created_at                                                     AS t2,
          LAG(strengths)  OVER (PARTITION BY user_id ORDER BY created_at) AS strengths_1,
          strengths                                                      AS strengths_2,
          LAG(top_types)  OVER (PARTITION BY user_id ORDER BY created_at) AS top_types_1,
          top_types                                                      AS top_types_2,
          LAG(dimensions) OVER (PARTITION BY user_id ORDER BY created_at) AS dimensions_1,
          dimensions                                                     AS dimensions_2
        FROM prof
      )
      SELECT *
      FROM seq
      WHERE session_id_1 IS NOT NULL;
    $SQL$;

    ddl := replace(ddl, '$HAS_FN$', CASE WHEN has_fn_strengths THEN 'TRUE' ELSE 'FALSE' END);
    ddl := replace(ddl, '$HAS_ST$', CASE WHEN has_strengths THEN 'TRUE' ELSE 'FALSE' END);
    ddl := replace(ddl, '$HAS_TS$', CASE WHEN has_type_scores THEN 'TRUE' ELSE 'FALSE' END);

  ELSE
    -- stub to keep downstream views creatable
    ddl := $SQL$
      CREATE VIEW public.v_retest_pairs AS
      SELECT
        NULL::uuid        AS user_id,
        NULL::uuid        AS session_id_1,
        NULL::uuid        AS session_id_2,
        NULL::timestamptz AS t1,
        NULL::timestamptz AS t2,
        '{}'::jsonb       AS strengths_1,
        '{}'::jsonb       AS strengths_2,
        '[]'::jsonb       AS top_types_1,
        '[]'::jsonb       AS top_types_2,
        '{}'::jsonb       AS dimensions_1,
        '{}'::jsonb       AS dimensions_2
      WHERE FALSE;
    $SQL$;
  END IF;

  EXECUTE ddl;
END$$;

-- 1) Test–Retest: strength correlation
DROP VIEW IF EXISTS public.v_test_retest_strength_r;
CREATE VIEW public.v_test_retest_strength_r AS
SELECT 
  user_id,
  session_id_1, 
  session_id_2,
  t1, 
  t2,
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

-- 2) Confidence calibration
DROP VIEW IF EXISTS public.v_calibration_confidence;
CREATE VIEW public.v_calibration_confidence AS
SELECT 
  CASE p1.confidence 
    WHEN 'High' THEN 'High'
    WHEN 'Moderate' THEN 'Moderate' 
    ELSE 'Low' 
  END AS conf_bin,
  COUNT(*) AS n,
  AVG(CASE WHEN (p1.top_types->>0) = (p2.top_types->>0) THEN 1.0 ELSE 0.0 END) AS hit_rate
FROM public.v_retest_pairs x
JOIN public.profiles p1 ON p1.session_id = x.session_id_1
JOIN public.profiles p2 ON p2.session_id = x.session_id_2
WHERE p1.confidence IS NOT NULL
  AND p2.confidence IS NOT NULL
GROUP BY 1;

-- 3) State index
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='assessment_responses')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='assessment_scoring_key') THEN
    EXECUTE $SQL$
      DROP VIEW IF EXISTS public.v_state_index;
      CREATE VIEW public.v_state_index AS
      SELECT 
        ar.session_id,
        AVG(ar.answer_numeric::float) AS state_mean,
        COUNT(*) AS state_items_count
      FROM public.assessment_responses ar
      JOIN public.assessment_scoring_key ask ON ask.question_id = ar.question_id
      WHERE ask.scale_type = 'STATE_1_7'
        AND ar.answer_numeric IS NOT NULL
      GROUP BY ar.session_id;
    $SQL$;
  ELSE
    EXECUTE $SQL$
      DROP VIEW IF EXISTS public.v_state_index;
      CREATE VIEW public.v_state_index AS
      SELECT NULL::uuid AS session_id,
             NULL::float AS state_mean,
             NULL::int   AS state_items_count
      WHERE FALSE;
    $SQL$;
  END IF;
END$$;

-- 4) State–trait separation
DROP VIEW IF EXISTS public.v_state_trait_sep;
CREATE VIEW public.v_state_trait_sep AS
SELECT 
  p.session_id,
  p.user_id,
  s.state_mean,
  s.state_items_count,
  ((COALESCE((p.strengths->>'Ti')::float, 0) + 
    COALESCE((p.strengths->>'Te')::float, 0) +
    COALESCE((p.strengths->>'Fi')::float, 0) +
    COALESCE((p.strengths->>'Fe')::float, 0) +
    COALESCE((p.strengths->>'Ni')::float, 0) +
    COALESCE((p.strengths->>'Ne')::float, 0) +
    COALESCE((p.strengths->>'Si')::float, 0) +
    COALESCE((p.strengths->>'Se')::float, 0)) / 8.0) AS strengths_mean,
  p.overlay,
  p.confidence,
  p.created_at
FROM public.profiles p
LEFT JOIN public.v_state_index s ON s.session_id = p.session_id
WHERE p.strengths IS NOT NULL;

-- 5) Method agreement prep (FC vs Likert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='assessment_responses')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='assessment_scoring_key') THEN
    EXECUTE $SQL$
      DROP VIEW IF EXISTS public.v_method_agreement_prep;
      CREATE VIEW public.v_method_agreement_prep AS
      SELECT 
        ar.session_id,
        ask.fc_map->>'function' AS function_name,
        ask.scale_type,
        ar.answer_numeric,
        ar.answer_array,
        ask.question_id
      FROM public.assessment_responses ar
      JOIN public.assessment_scoring_key ask ON ask.question_id = ar.question_id  
      WHERE ask.fc_map IS NOT NULL 
        AND ask.fc_map->>'function' IS NOT NULL
        AND (ask.scale_type = 'LIKERT_1_7' OR ask.scale_type = 'FC_SHARE');
    $SQL$;
  ELSE
    EXECUTE $SQL$
      DROP VIEW IF EXISTS public.v_method_agreement_prep;
      CREATE VIEW public.v_method_agreement_prep AS
      SELECT NULL::uuid AS session_id,
             NULL::text AS function_name,
             NULL::text AS scale_type,
             NULL::float AS answer_numeric,
             NULL::jsonb AS answer_array,
             NULL::int AS question_id
      WHERE FALSE;
    $SQL$;
  END IF;
END$$;

-- 6) Overlay invariance
DROP VIEW IF EXISTS public.v_overlay_invariance;
CREATE VIEW public.v_overlay_invariance AS
SELECT 
  p.session_id,
  p.overlay,
  p.confidence,
  p.created_at,
  CASE 
    WHEN p.top_types IS NOT NULL AND jsonb_array_length(p.top_types) > 0 
         AND p.type_scores IS NOT NULL 
    THEN COALESCE((p.type_scores->(p.top_types->>0)->>'fit_abs')::numeric, 0)
    ELSE 0 
  END AS fit_abs_top1
FROM public.profiles p
WHERE p.overlay IN ('+', '–')
  AND p.created_at IS NOT NULL;

-- 7) Dimensionality reliability prep
DROP VIEW IF EXISTS public.v_dim_reliability_prep;
CREATE VIEW public.v_dim_reliability_prep AS
SELECT 
  rp.user_id,
  rp.session_id_1,
  rp.session_id_2,
  rp.t1,
  rp.t2,
  (rp.dimensions_1->>'Ti')::int AS ti_dim_1,
  (rp.dimensions_2->>'Ti')::int AS ti_dim_1_retest,
  (rp.dimensions_1->>'Te')::int AS te_dim_1,
  (rp.dimensions_2->>'Te')::int AS te_dim_1_retest,
  (rp.dimensions_1->>'Fi')::int AS fi_dim_1,
  (rp.dimensions_2->>'Fi')::int AS fi_dim_1_retest,
  (rp.dimensions_1->>'Fe')::int AS fe_dim_1,
  (rp.dimensions_2->>'Fe')::int AS fe_dim_1_retest,
  (rp.dimensions_1->>'Ni')::int AS ni_dim_1,
  (rp.dimensions_2->>'Ni')::int AS ni_dim_1_retest,
  (rp.dimensions_1->>'Ne')::int AS ne_dim_1,
  (rp.dimensions_2->>'Ne')::int AS ne_dim_1_retest,
  (rp.dimensions_1->>'Si')::int AS si_dim_1,
  (rp.dimensions_2->>'Si')::int AS si_dim_1_retest,
  (rp.dimensions_1->>'Se')::int AS se_dim_1,
  (rp.dimensions_2->>'Se')::int AS se_dim_1_retest
FROM public.v_retest_pairs rp
WHERE rp.dimensions_1 IS NOT NULL 
  AND rp.dimensions_2 IS NOT NULL;

-- 8) Close-call resolution
DROP VIEW IF EXISTS public.v_close_call_resolution;
CREATE VIEW public.v_close_call_resolution AS
SELECT 
  rp.user_id,
  rp.session_id_1,
  rp.session_id_2,
  rp.t1,
  rp.t2,
  COALESCE(
      (p1.type_scores->(p1.top_types->>0)->>'fit_abs')::numeric - 
      (p1.type_scores->(p1.top_types->>1)->>'fit_abs')::numeric, 
      0
  ) AS top_gap_1,
  COALESCE(
      (p2.type_scores->(p2.top_types->>0)->>'fit_abs')::numeric - 
      (p2.type_scores->(p2.top_types->>1)->>'fit_abs')::numeric, 
      0  
  ) AS top_gap_2,
  CASE WHEN COALESCE(
      (p1.type_scores->(p1.top_types->>0)->>'fit_abs')::numeric - 
      (p1.type_scores->(p1.top_types->>1)->>'fit_abs')::numeric, 
      0
  ) < 3 THEN true ELSE false END AS was_close_call
FROM public.v_retest_pairs rp
JOIN public.profiles p1 ON p1.session_id = rp.session_id_1
JOIN public.profiles p2 ON p2.session_id = rp.session_id_2
WHERE p1.type_scores IS NOT NULL 
  AND p2.type_scores IS NOT NULL
  AND p1.top_types IS NOT NULL 
  AND p2.top_types IS NOT NULL
  AND jsonb_array_length(p1.top_types) >= 2
  AND jsonb_array_length(p2.top_types) >= 2;

-- 9) Type distinctiveness prep
DROP VIEW IF EXISTS public.v_type_distinctiveness_prep;
CREATE VIEW public.v_type_distinctiveness_prep AS
SELECT 
  p.session_id,
  p.type_code,
  p.base_func,
  p.creative_func,
  COALESCE((p.strengths->>p.base_func)::float, 0) AS base_strength,
  COALESCE((p.strengths->>p.creative_func)::float, 0) AS creative_strength,
  COALESCE((p.dimensions->>p.base_func)::int, 1) AS base_dim,
  COALESCE((p.dimensions->>p.creative_func)::int, 1) AS creative_dim,
  p.confidence,
  p.overlay,
  p.created_at
FROM public.profiles p
WHERE p.type_code IS NOT NULL
  AND p.base_func IS NOT NULL
  AND p.creative_func IS NOT NULL
  AND p.strengths IS NOT NULL
  AND p.dimensions IS NOT NULL;

-- 10) Fairness by demographics (country)
DROP VIEW IF EXISTS public.v_fairness_demographics;
CREATE VIEW public.v_fairness_demographics AS
SELECT 
  p.session_id,
  p.user_id,
  COALESCE(
    (SELECT ar.answer_value 
     FROM public.assessment_responses ar 
     JOIN public.scoring_config sc ON sc.key = 'dashboard_country_qid' 
     WHERE ar.session_id = p.session_id 
       AND ar.question_id = (sc.value->>'id')::integer
     LIMIT 1), 
    'Unknown'
  ) AS country,
  CASE 
    WHEN p.top_types IS NOT NULL AND jsonb_array_length(p.top_types) > 0 
         AND p.type_scores IS NOT NULL 
    THEN COALESCE((p.type_scores->(p.top_types->>0)->>'fit_abs')::numeric, 0)
    ELSE 0 
  END AS fit_abs_top1,
  CASE WHEN p.confidence = 'Low' THEN 1 ELSE 0 END AS is_low_confidence,
  p.confidence,
  p.overlay,
  p.created_at
FROM public.profiles p
WHERE p.created_at IS NOT NULL;

-- (optional) permissions
-- GRANT SELECT ON
--   public.v_retest_pairs,
--   public.v_test_retest_strength_r,
--   public.v_calibration_confidence,
--   public.v_state_index,
--   public.v_state_trait_sep,
--   public.v_method_agreement_prep,
--   public.v_overlay_invariance,
--   public.v_dim_reliability_prep,
--   public.v_close_call_resolution,
--   public.v_type_distinctiveness_prep,
--   public.v_fairness_demographics
-- TO anon, authenticated;
