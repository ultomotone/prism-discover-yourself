-- Fix mv_kpi_item_flags to match analytics dashboard schema
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_item_flags CASCADE;

CREATE MATERIALIZED VIEW public.mv_kpi_item_flags AS
WITH flag_counts AS (
  SELECT
    f.question_id,
    COUNT(*) AS flags
  FROM public.assessment_item_flags f
  GROUP BY f.question_id
),
session_counts AS (
  SELECT
    r.question_id,
    COUNT(DISTINCT r.session_id) AS answered
  FROM public.assessment_responses r
  GROUP BY r.question_id
)
SELECT
  fc.question_id,
  q.section,
  fc.flags,
  sc.answered,
  CASE 
    WHEN sc.answered > 0 
    THEN ROUND((fc.flags::numeric / sc.answered::numeric), 4)
    ELSE 0
  END AS flag_rate
FROM flag_counts fc
JOIN session_counts sc ON sc.question_id = fc.question_id
JOIN public.assessment_questions q ON q.id = fc.question_id;

CREATE UNIQUE INDEX idx_mv_kpi_item_flags_qid ON public.mv_kpi_item_flags(question_id);

GRANT SELECT ON public.mv_kpi_item_flags TO authenticated, anon;

REFRESH MATERIALIZED VIEW public.mv_kpi_item_flags;