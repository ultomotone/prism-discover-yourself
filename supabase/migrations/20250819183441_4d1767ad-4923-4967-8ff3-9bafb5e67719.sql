-- Create views to support Evidence KPIs

-- Test-Retest Reliability view for strength correlations
CREATE OR REPLACE VIEW v_test_retest_strength_r AS
SELECT 
    user_id,
    session_id_1, 
    session_id_2,
    t1, 
    t2,
    -- Calculate correlation between strength vectors
    (SELECT corr(s1::float, s2::float)
     FROM (SELECT (strengths_1->>'Ti')::float AS v UNION ALL
                  SELECT (strengths_1->>'Te')::float UNION ALL
                  SELECT (strengths_1->>'Fi')::float UNION ALL
                  SELECT (strengths_1->>'Fe')::float UNION ALL
                  SELECT (strengths_1->>'Ni')::float UNION ALL
                  SELECT (strengths_1->>'Ne')::float UNION ALL
                  SELECT (strengths_1->>'Si')::float UNION ALL
                  SELECT (strengths_1->>'Se')::float) a(s1),
          (SELECT (strengths_2->>'Ti')::float AS v UNION ALL
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
FROM v_retest_pairs;

-- Confidence calibration view
CREATE OR REPLACE VIEW v_calibration_confidence AS
SELECT 
    CASE p1.confidence 
        WHEN 'High' THEN 'High'
        WHEN 'Moderate' THEN 'Moderate' 
        ELSE 'Low' 
    END AS conf_bin,
    COUNT(*) AS n,
    AVG(CASE WHEN (p1.top_types->>0) = (p2.top_types->>0) THEN 1.0 ELSE 0.0 END) AS hit_rate
FROM v_retest_pairs x
JOIN profiles p1 ON p1.session_id = x.session_id_1
JOIN profiles p2 ON p2.session_id = x.session_id_2
WHERE p1.confidence IS NOT NULL
  AND p2.confidence IS NOT NULL
GROUP BY 1;

-- State index calculation
CREATE OR REPLACE VIEW v_state_index AS
SELECT 
    ar.session_id,
    AVG(ar.answer_numeric::float) AS state_mean,
    COUNT(*) AS state_items_count
FROM assessment_responses ar
JOIN assessment_scoring_key ask ON ask.question_id = ar.question_id
WHERE ask.scale_type = 'STATE_1_7'
  AND ar.answer_numeric IS NOT NULL
GROUP BY ar.session_id;

-- State-trait separation analysis
CREATE OR REPLACE VIEW v_state_trait_sep AS
SELECT 
    p.session_id,
    p.user_id,
    s.state_mean,
    s.state_items_count,
    -- Calculate strengths composite (mean of 8 functions)
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
FROM profiles p
LEFT JOIN v_state_index s ON s.session_id = p.session_id
WHERE p.strengths IS NOT NULL;

-- Method agreement preparation (FC vs Likert correlation by function)
CREATE OR REPLACE VIEW v_method_agreement_prep AS
SELECT 
    ar.session_id,
    ask.fc_map->>'function' AS function_name,
    ask.scale_type,
    ar.answer_numeric,
    ar.answer_array,
    ask.question_id
FROM assessment_responses ar
JOIN assessment_scoring_key ask ON ask.question_id = ar.question_id  
WHERE ask.fc_map IS NOT NULL 
  AND ask.fc_map->>'function' IS NOT NULL
  AND (ask.scale_type = 'LIKERT_1_7' OR ask.scale_type = 'FC_SHARE');

-- Overlay invariance comparison
CREATE OR REPLACE VIEW v_overlay_invariance AS
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
FROM profiles p
WHERE p.overlay IN ('+', '–')
  AND p.created_at IS NOT NULL;

-- Dimensionality reliability preparation
CREATE OR REPLACE VIEW v_dim_reliability_prep AS
SELECT 
    rp.user_id,
    rp.session_id_1,
    rp.session_id_2,
    rp.t1,
    rp.t2,
    -- Extract dimensionality for each function from both sessions
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
FROM v_retest_pairs rp
WHERE rp.dimensions_1 IS NOT NULL 
  AND rp.dimensions_2 IS NOT NULL;

-- Close-call resolution tracking
CREATE OR REPLACE VIEW v_close_call_resolution AS
SELECT 
    rp.user_id,
    rp.session_id_1,
    rp.session_id_2,
    rp.t1,
    rp.t2,
    -- Calculate top gap for both sessions
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
FROM v_retest_pairs rp
JOIN profiles p1 ON p1.session_id = rp.session_id_1
JOIN profiles p2 ON p2.session_id = rp.session_id_2
WHERE p1.type_scores IS NOT NULL 
  AND p2.type_scores IS NOT NULL
  AND p1.top_types IS NOT NULL 
  AND p2.top_types IS NOT NULL
  AND jsonb_array_length(p1.top_types) >= 2
  AND jsonb_array_length(p2.top_types) >= 2;

-- Type distinctiveness preparation
CREATE OR REPLACE VIEW v_type_distinctiveness_prep AS
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
FROM profiles p
WHERE p.type_code IS NOT NULL
  AND p.base_func IS NOT NULL
  AND p.creative_func IS NOT NULL
  AND p.strengths IS NOT NULL
  AND p.dimensions IS NOT NULL;

-- Fairness audit by demographics (country focus)
CREATE OR REPLACE VIEW v_fairness_demographics AS
SELECT 
    p.session_id,
    p.user_id,
    COALESCE(
        (SELECT ar.answer_value 
         FROM assessment_responses ar 
         JOIN scoring_config sc ON sc.key = 'dashboard_country_qid' 
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
FROM profiles p
WHERE p.created_at IS NOT NULL;