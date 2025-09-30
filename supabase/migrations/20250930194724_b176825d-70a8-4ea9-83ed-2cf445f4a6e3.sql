-- Create remaining materialized views for analytics dashboard

-- mv_kpi_engagement
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_engagement AS
WITH daily_data AS (
  SELECT
    date_trunc('day', s.started_at) AS day,
    COUNT(*) AS sessions_started,
    COUNT(*) FILTER (WHERE s.status = 'completed') AS sessions_completed,
    COUNT(*) FILTER (WHERE s.status = 'abandoned') AS sessions_abandoned
  FROM public.assessment_sessions s
  GROUP BY date_trunc('day', s.started_at)
)
SELECT
  day,
  sessions_started,
  sessions_completed,
  sessions_abandoned,
  CASE 
    WHEN sessions_started > 0 
    THEN ROUND((sessions_completed::numeric / sessions_started::numeric) * 100, 1)
    ELSE 0
  END AS completion_rate_pct,
  CASE 
    WHEN sessions_started > 0 
    THEN ROUND((sessions_abandoned::numeric / sessions_started::numeric) * 100, 1)
    ELSE 0
  END AS drop_off_rate
FROM daily_data;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_engagement_day ON public.mv_kpi_engagement(day);

-- mv_kpi_item_flow
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_item_flow AS
SELECT
  q.id AS question_id,
  COUNT(*) FILTER (WHERE r.skipped = true) AS skip_count,
  COUNT(*) AS total_responses,
  CASE 
    WHEN COUNT(*) > 0 
    THEN ROUND((COUNT(*) FILTER (WHERE r.skipped = true)::numeric / COUNT(*)::numeric), 4)
    ELSE 0
  END AS skip_rate
FROM public.assessment_questions q
LEFT JOIN public.assessment_responses r ON r.question_id = q.id
GROUP BY q.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_item_flow_qid ON public.mv_kpi_item_flow(question_id);

-- mv_kpi_item_clarity
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_item_clarity AS
WITH flag_data AS (
  SELECT
    f.question_id,
    COUNT(*) AS clarity_flag_count
  FROM public.assessment_item_flags f
  WHERE f.flag_type = 'unclear'
  GROUP BY f.question_id
),
response_data AS (
  SELECT
    r.question_id,
    COUNT(DISTINCT r.session_id) AS response_count
  FROM public.assessment_responses r
  GROUP BY r.question_id
)
SELECT
  rd.question_id,
  COALESCE(fd.clarity_flag_count, 0) AS clarity_flag_count,
  rd.response_count,
  CASE 
    WHEN rd.response_count > 0 
    THEN ROUND((COALESCE(fd.clarity_flag_count, 0)::numeric / rd.response_count::numeric) * 100, 2)
    ELSE 0
  END AS clarity_flag_rate_pct
FROM response_data rd
LEFT JOIN flag_data fd ON fd.question_id = rd.question_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_item_clarity_qid ON public.mv_kpi_item_clarity(question_id);

-- mv_kpi_response_process
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_response_process AS
SELECT
  date_trunc('day', r.created_at) AS day,
  ROUND(AVG(r.response_time_ms)::numeric, 0) AS avg_response_time_ms,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.response_time_ms)::numeric, 0) AS median_response_time_ms
FROM public.assessment_responses r
WHERE r.response_time_ms IS NOT NULL
GROUP BY date_trunc('day', r.created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_response_process_day ON public.mv_kpi_response_process(day);

-- mv_kpi_reliability (placeholder - requires test-retest data)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_reliability AS
SELECT
  'test_retest'::text AS metric_type,
  0::numeric AS correlation,
  0::integer AS n_pairs;

-- mv_kpi_cfa (placeholder - requires factor analysis)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_cfa AS
SELECT
  'model_fit'::text AS metric_type,
  0::numeric AS cfi,
  0::numeric AS tli,
  0::numeric AS rmsea;

-- mv_kpi_construct_coverage
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_construct_coverage AS
SELECT
  COUNT(DISTINCT q.construct_tag) AS constructs_covered,
  COUNT(*) AS total_items
FROM public.assessment_questions q
WHERE q.construct_tag IS NOT NULL;

-- mv_kpi_fairness_dif (placeholder - requires DIF analysis)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_fairness_dif AS
SELECT
  0::integer AS flagged_items,
  0::integer AS total_items;

-- mv_kpi_calibration
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_calibration AS
SELECT
  ROUND(AVG(COALESCE(p.conf_calibrated, p.conf_raw))::numeric, 3) AS avg_confidence,
  COUNT(*) AS n_profiles
FROM public.profiles p;

-- mv_kpi_classification_stability (placeholder)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_classification_stability AS
SELECT
  0::numeric AS stability_rate,
  0::integer AS n_pairs;

-- mv_kpi_confidence_spread
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_confidence_spread AS
SELECT
  ROUND(MIN(COALESCE(p.conf_calibrated, p.conf_raw))::numeric, 2) AS min_confidence,
  ROUND(MAX(COALESCE(p.conf_calibrated, p.conf_raw))::numeric, 2) AS max_confidence,
  ROUND(AVG(COALESCE(p.conf_calibrated, p.conf_raw))::numeric, 2) AS mean_confidence,
  ROUND(STDDEV(COALESCE(p.conf_calibrated, p.conf_raw))::numeric, 2) AS stddev_confidence
FROM public.profiles p;

-- mv_kpi_user_experience
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_user_experience AS
SELECT
  date_trunc('day', f.submitted_at) AS day,
  ROUND(AVG(f.nps)::numeric, 1) AS avg_nps,
  ROUND(AVG(f.engagement)::numeric, 1) AS avg_engagement,
  COUNT(*) AS feedback_count
FROM public.assessment_feedback f
GROUP BY date_trunc('day', f.submitted_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_user_experience_day ON public.mv_kpi_user_experience(day);

-- mv_kpi_business (placeholder)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_business AS
SELECT
  COUNT(*) AS total_completions,
  COUNT(DISTINCT s.email) AS unique_users
FROM public.assessment_sessions s
WHERE s.status = 'completed';

-- mv_kpi_followup (placeholder)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_followup AS
SELECT
  0::integer AS followup_count,
  0::integer AS total_completions;

-- mv_kpi_behavioral_impact (placeholder)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_behavioral_impact AS
SELECT
  0::numeric AS impact_rate,
  0::integer AS responses;

-- mv_kpi_trajectory_alignment (placeholder)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpi_trajectory_alignment AS
SELECT
  0::numeric AS alignment_score,
  0::integer AS n_users;

-- Grant SELECT to authenticated and anon
GRANT SELECT ON public.mv_kpi_engagement TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_item_flow TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_item_clarity TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_response_process TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_reliability TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_cfa TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_construct_coverage TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_fairness_dif TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_calibration TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_classification_stability TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_confidence_spread TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_user_experience TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_business TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_followup TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_behavioral_impact TO authenticated, anon;
GRANT SELECT ON public.mv_kpi_trajectory_alignment TO authenticated, anon;

-- Refresh all views
REFRESH MATERIALIZED VIEW public.mv_kpi_engagement;
REFRESH MATERIALIZED VIEW public.mv_kpi_item_flow;
REFRESH MATERIALIZED VIEW public.mv_kpi_item_clarity;
REFRESH MATERIALIZED VIEW public.mv_kpi_response_process;
REFRESH MATERIALIZED VIEW public.mv_kpi_reliability;
REFRESH MATERIALIZED VIEW public.mv_kpi_cfa;
REFRESH MATERIALIZED VIEW public.mv_kpi_construct_coverage;
REFRESH MATERIALIZED VIEW public.mv_kpi_fairness_dif;
REFRESH MATERIALIZED VIEW public.mv_kpi_calibration;
REFRESH MATERIALIZED VIEW public.mv_kpi_classification_stability;
REFRESH MATERIALIZED VIEW public.mv_kpi_confidence_spread;
REFRESH MATERIALIZED VIEW public.mv_kpi_user_experience;
REFRESH MATERIALIZED VIEW public.mv_kpi_business;
REFRESH MATERIALIZED VIEW public.mv_kpi_followup;
REFRESH MATERIALIZED VIEW public.mv_kpi_behavioral_impact;
REFRESH MATERIALIZED VIEW public.mv_kpi_trajectory_alignment;