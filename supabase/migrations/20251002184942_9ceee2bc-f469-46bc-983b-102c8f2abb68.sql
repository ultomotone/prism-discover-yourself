-- A) Create missing materialized views and tables

-- 1) Engagement rollup (period-weighted completion + median time)
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_engagement CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_engagement AS
WITH started AS (
  SELECT date_trunc('day', started_at)::date AS day, COUNT(*) AS sessions_started
  FROM public.assessment_sessions
  WHERE started_at IS NOT NULL
  GROUP BY 1
),
completed AS (
  SELECT date_trunc('day', started_at)::date AS day, COUNT(*) AS sessions_completed
  FROM public.assessment_sessions
  WHERE status='completed' AND started_at IS NOT NULL
  GROUP BY 1
),
dur AS (
  SELECT date_trunc('day', started_at)::date AS day,
         PERCENTILE_CONT(0.5) WITHIN GROUP (
           ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at))
         ) FILTER (
           WHERE status='completed'
             AND completed_at>started_at
             AND EXTRACT(EPOCH FROM (completed_at - started_at)) BETWEEN 300 AND 7200
         ) AS median_completion_sec
  FROM public.assessment_sessions
  GROUP BY 1
)
SELECT
  COALESCE(s.day, c.day, d.day) AS day,
  COALESCE(s.sessions_started,0) AS sessions_started,
  COALESCE(c.sessions_completed,0) AS sessions_completed,
  CASE WHEN COALESCE(s.sessions_started,0)>0
       THEN ROUND(100.0 * COALESCE(c.sessions_completed,0)::numeric / s.sessions_started::numeric, 2)
       ELSE 0 END AS completion_rate_pct,
  CASE WHEN COALESCE(s.sessions_started,0)>0
       THEN GREATEST(0, 100 - ROUND(100.0 * COALESCE(c.sessions_completed,0)::numeric / s.sessions_started::numeric, 2))
       ELSE 0 END AS drop_off_rate_pct,
  d.median_completion_sec
FROM started s
FULL OUTER JOIN completed c USING(day)
FULL OUTER JOIN dur d ON d.day = COALESCE(s.day, c.day)
ORDER BY 1;
CREATE UNIQUE INDEX idx_mv_kpi_engagement_day ON public.mv_kpi_engagement(day);

-- 2) Construct coverage (uses item_catalog.scale_id + keyed>0; labels via scale_catalog)
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_construct_coverage CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_construct_coverage AS
WITH bank AS (
  SELECT ic.question_id, ic.scale_id, COALESCE(ic.keyed,0) AS keyed
  FROM public.item_catalog ic
  JOIN public.assessment_questions q ON q.id = ic.question_id
),
denom AS (
  SELECT scale_id, COUNT(DISTINCT question_id) AS total_items FROM bank GROUP BY 1
),
num AS (
  SELECT scale_id, COUNT(DISTINCT question_id) AS keyed_items FROM bank WHERE keyed > 0 GROUP BY 1
)
SELECT
  d.scale_id,
  sc.scale_id AS scale_code,
  sc.scale_name,
  COALESCE(n.keyed_items,0) AS keyed_items,
  d.total_items,
  ROUND(100.0 * COALESCE(n.keyed_items,0)::numeric / NULLIF(d.total_items,0), 2) AS coverage_pct
FROM denom d
LEFT JOIN num n USING (scale_id)
LEFT JOIN public.scale_catalog sc ON sc.scale_id = d.scale_id
ORDER BY sc.scale_id NULLS LAST;
CREATE UNIQUE INDEX idx_mv_kpi_construct_coverage_scale ON public.mv_kpi_construct_coverage(scale_id);

-- 3) Fairness AIR view
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_fairness_air CASCADE;
CREATE MATERIALIZED VIEW mv_kpi_fairness_air AS
SELECT NULL::numeric AS adverse_impact_ratio;
CREATE UNIQUE INDEX idx_mv_kpi_fairness_air_true ON mv_kpi_fairness_air((true));

-- Initial refresh
REFRESH MATERIALIZED VIEW mv_kpi_engagement;
REFRESH MATERIALIZED VIEW mv_kpi_construct_coverage;
REFRESH MATERIALIZED VIEW mv_kpi_fairness_dif;
REFRESH MATERIALIZED VIEW mv_kpi_fairness_air;
REFRESH MATERIALIZED VIEW mv_kpi_calibration;
REFRESH MATERIALIZED VIEW mv_kpi_reliability;
REFRESH MATERIALIZED VIEW mv_kpi_retest;