
-- Fix v_scale_scores to handle both likert-1-5 and likert-1-7 responses
-- Previous view filtered answer_numeric BETWEEN 1 AND 5, excluding N scale (likert-1-7)

DROP VIEW IF EXISTS public.v_scale_scores CASCADE;

CREATE OR REPLACE VIEW public.v_scale_scores AS
WITH coverage AS (
  SELECT scale_tag, 
         COUNT(DISTINCT question_id) AS k_total
  FROM v_scale_items_by_tag 
  GROUP BY 1
),
resp AS (
  SELECT r.session_id, r.question_id, r.answer_numeric::numeric AS x
  FROM public.assessment_responses r
  JOIN public.assessment_questions q ON q.id = r.question_id
  WHERE r.answer_numeric IS NOT NULL
    AND (
      (q.type LIKE 'likert-1-5%' AND r.answer_numeric BETWEEN 1 AND 5)
      OR (q.type LIKE 'likert-1-7%' AND r.answer_numeric BETWEEN 1 AND 7)
    )
),
raw_by_session_scale AS (
  SELECT r.session_id, i.scale_tag,
         COUNT(DISTINCT r.question_id) AS k_answered,
         SUM(i.weight * r.x) AS sum_wx,
         SUM(i.weight) AS sum_w
  FROM resp r
  JOIN v_scale_items_by_tag i ON i.question_id = r.question_id
  GROUP BY 1,2
),
norm AS (
  SELECT session_id, scale_tag, k_answered, sum_wx, sum_w,
         (sum_wx / NULLIF(sum_w,0))::numeric(10,3) AS mean_raw,
         ((sum_wx / NULLIF(sum_w,0)) * 25 - 25)::numeric(10,2) AS idx_0_100
  FROM raw_by_session_scale
),
final AS (
  SELECT n.session_id, 
         c.scale_tag, 
         n.k_answered AS k_used,
         c.k_total,
         (n.k_answered::float / NULLIF(c.k_total, 0)) AS completeness,
         CASE WHEN (n.k_answered::float / NULLIF(c.k_total, 0)) >= 0.7 
              THEN n.mean_raw END AS mean_raw_1_5,
         CASE WHEN (n.k_answered::float / NULLIF(c.k_total, 0)) >= 0.7 
              THEN n.idx_0_100 END AS idx_0_100
  FROM coverage c
  LEFT JOIN norm n ON n.scale_tag = c.scale_tag
  WHERE n.session_id IS NOT NULL
)
SELECT * FROM final;
