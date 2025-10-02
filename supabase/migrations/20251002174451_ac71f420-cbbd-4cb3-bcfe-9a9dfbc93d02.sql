-- Fix Construct Coverage view (section filter bug)
DROP MATERIALIZED VIEW IF EXISTS public.mv_kpi_construct_coverage CASCADE;

-- Robust coverage: per scale_code, how many items are *keyed* vs *available*
CREATE MATERIALIZED VIEW public.mv_kpi_construct_coverage AS
WITH core_q AS (
  SELECT q.id
  FROM public.assessment_questions q
  WHERE (
      q.section ILIKE 'Core PRISM%'      -- covers "Core PRISM Functions (1/2)", "(2/2)" etc.
      OR q.section ILIKE 'Core %'        -- extra safety
      OR q.section ILIKE '%Core%'        -- last resort
    )
),
bank AS (
  SELECT id FROM core_q
  UNION
  SELECT id FROM public.assessment_questions
),
keyed AS (
  SELECT sk.scale_type::text AS scale_code, COUNT(DISTINCT sk.question_id) AS keyed_items
  FROM public.assessment_scoring_key sk
  JOIN public.assessment_questions q ON q.id = sk.question_id
  WHERE sk.scale_type != 'META'
  GROUP BY sk.scale_type::text
),
denom AS (
  SELECT COUNT(DISTINCT q.id) AS total_items
  FROM public.assessment_questions q
  WHERE q.id IN (SELECT id FROM bank)
    AND EXISTS (
      SELECT 1 FROM public.assessment_scoring_key sk WHERE sk.question_id = q.id
    )
)
SELECT
  k.scale_code,
  k.keyed_items,
  d.total_items,
  ROUND((k.keyed_items::numeric / NULLIF(d.total_items,0)) * 100, 2) AS coverage_pct
FROM keyed k CROSS JOIN denom d
ORDER BY k.scale_code;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_construct_coverage_scale
  ON public.mv_kpi_construct_coverage (scale_code);

REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kpi_construct_coverage;