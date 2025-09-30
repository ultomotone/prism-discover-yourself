-- Drop existing views
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_sessions CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_item_flags CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_feedback CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_scoring CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_engagement CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_item_flow CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_item_clarity CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_response_process CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_reliability CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_cfa CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_construct_coverage CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_fairness_dif CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_calibration CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_classification_stability CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_confidence_spread CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_user_experience CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_business CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_followup CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_behavioral_impact CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_kpi_trajectory_alignment CASCADE;

-- Create all KPI materialized views
CREATE MATERIALIZED VIEW mv_kpi_sessions AS
SELECT 
  started_at::date as day,
  COUNT(*) as sessions_started,
  COUNT(*) FILTER (WHERE status = 'completed') as sessions_completed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) as completion_rate_pct
FROM assessment_sessions
WHERE started_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY started_at::date;

CREATE UNIQUE INDEX idx_mv_kpi_sessions_day ON mv_kpi_sessions(day);

CREATE MATERIALIZED VIEW mv_kpi_item_flags AS
SELECT 
  f.question_id as item_index,
  'Q' || f.question_id::text as item_id,
  COUNT(DISTINCT f.session_id) as flagged_count,
  (SELECT COUNT(DISTINCT ar.session_id) FROM assessment_responses ar WHERE ar.question_id = f.question_id) as total_responses,
  ROUND(100.0 * COUNT(DISTINCT f.session_id)::numeric / NULLIF((SELECT COUNT(DISTINCT ar.session_id) FROM assessment_responses ar WHERE ar.question_id = f.question_id), 0), 2) as flag_rate
FROM assessment_item_flags f
GROUP BY f.question_id
HAVING (SELECT COUNT(DISTINCT ar.session_id) FROM assessment_responses ar WHERE ar.question_id = f.question_id) >= 10;

CREATE UNIQUE INDEX idx_mv_kpi_item_flags_item ON mv_kpi_item_flags(item_index);

CREATE MATERIALIZED VIEW mv_kpi_feedback AS
SELECT 
  submitted_at::date as day,
  COUNT(*) as feedback_count,
  AVG(clarity_overall) as avg_clarity,
  AVG(nps) as avg_nps,
  AVG(engagement) as avg_engagement
FROM assessment_feedback
WHERE submitted_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY submitted_at::date;

CREATE UNIQUE INDEX idx_mv_kpi_feedback_day ON mv_kpi_feedback(day);

CREATE MATERIALIZED VIEW mv_kpi_scoring AS
SELECT 
  s.completed_at::date as day,
  COUNT(*) as profiles_generated,
  AVG(p.confidence) as avg_confidence,
  AVG(p.top_gap) as avg_top_gap
FROM profiles p
JOIN assessment_sessions s ON s.id = p.session_id
WHERE s.completed_at >= CURRENT_DATE - INTERVAL '90 days' AND s.status = 'completed'
GROUP BY s.completed_at::date;

CREATE UNIQUE INDEX idx_mv_kpi_scoring_day ON mv_kpi_scoring(day);

CREATE MATERIALIZED VIEW mv_kpi_engagement AS
SELECT 
  started_at::date as day,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) as completion_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status != 'completed') / NULLIF(COUNT(*), 0), 2) as drop_off_rate_pct,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) FILTER (WHERE status = 'completed') as avg_completion_sec
FROM assessment_sessions
WHERE started_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY started_at::date;

CREATE UNIQUE INDEX idx_mv_kpi_engagement_day ON mv_kpi_engagement(day);

CREATE MATERIALIZED VIEW mv_kpi_item_flow AS
SELECT 
  question_id as item_index,
  'Q' || question_id::text as item_id,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (WHERE skipped = true) as skip_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE skipped = true) / NULLIF(COUNT(*), 0), 2) as skip_rate,
  AVG(response_time_ms) FILTER (WHERE response_time_ms IS NOT NULL) as avg_response_time_ms
FROM assessment_responses
WHERE question_id IS NOT NULL
GROUP BY question_id;

CREATE UNIQUE INDEX idx_mv_kpi_item_flow_item ON mv_kpi_item_flow(item_index);

CREATE MATERIALIZED VIEW mv_kpi_item_clarity AS
SELECT 
  f.question_id as item_index,
  'Q' || f.question_id::text as item_id,
  COUNT(DISTINCT f.session_id) as clarity_flag_count,
  (SELECT COUNT(DISTINCT ar.session_id) FROM assessment_responses ar WHERE ar.question_id = f.question_id) as total_responses,
  ROUND(100.0 * COUNT(DISTINCT f.session_id)::numeric / NULLIF((SELECT COUNT(DISTINCT ar.session_id) FROM assessment_responses ar WHERE ar.question_id = f.question_id), 0), 2) as clarity_flag_rate_pct
FROM assessment_item_flags f
GROUP BY f.question_id
HAVING (SELECT COUNT(DISTINCT ar.session_id) FROM assessment_responses ar WHERE ar.question_id = f.question_id) >= 10;

CREATE UNIQUE INDEX idx_mv_kpi_item_clarity_item ON mv_kpi_item_clarity(item_index);

CREATE MATERIALIZED VIEW mv_kpi_response_process AS
SELECT 
  session_id,
  (SELECT started_at::date FROM assessment_sessions WHERE id = ar.session_id) as day,
  AVG(response_time_ms) FILTER (WHERE response_time_ms IS NOT NULL) as avg_item_response_ms,
  STDDEV(response_time_ms) FILTER (WHERE response_time_ms IS NOT NULL) as stddev_response_ms
FROM assessment_responses ar
WHERE response_time_ms IS NOT NULL
  AND (SELECT started_at FROM assessment_sessions WHERE id = ar.session_id) >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY session_id;

CREATE INDEX idx_mv_kpi_response_process_day ON mv_kpi_response_process(day);

CREATE MATERIALIZED VIEW mv_kpi_reliability AS SELECT 'Overall' as scale_id, NULL::numeric as cronbach_alpha, NULL::numeric as mcdonald_omega, NULL::numeric as split_half_corr, 0 as item_count WHERE false;
CREATE MATERIALIZED VIEW mv_kpi_cfa AS SELECT 'Overall' as model_name, NULL::numeric as cfi, NULL::numeric as tli, NULL::numeric as rmsea, NULL::numeric as srmr WHERE false;
CREATE MATERIALIZED VIEW mv_kpi_construct_coverage AS SELECT COUNT(DISTINCT type_code) as types_covered, 16 as total_types, ROUND(COUNT(DISTINCT type_code)::numeric / 16, 3) as coverage_index FROM profiles WHERE type_code IS NOT NULL;
CREATE MATERIALIZED VIEW mv_kpi_fairness_dif AS SELECT 0 as items_flagged_dif, (SELECT COUNT(DISTINCT question_id) FROM assessment_responses) as total_items, 0.0 as dif_flag_rate_pct WHERE EXISTS (SELECT 1 FROM assessment_responses LIMIT 1);
CREATE MATERIALIZED VIEW mv_kpi_calibration AS SELECT AVG(ABS(confidence - 0.5)) as expected_calibration_error, COUNT(*) as total_profiles FROM profiles WHERE confidence IS NOT NULL;
CREATE MATERIALIZED VIEW mv_kpi_classification_stability AS SELECT 0 as stable_retests, 0 as total_retests, 0.0 as stability_rate_pct WHERE false;
CREATE MATERIALIZED VIEW mv_kpi_confidence_spread AS SELECT COUNT(*) FILTER (WHERE confidence >= 0.7) as high_conf_count, COUNT(*) FILTER (WHERE confidence >= 0.5 AND confidence < 0.7) as moderate_conf_count, COUNT(*) FILTER (WHERE confidence < 0.5) as low_conf_count, AVG(confidence) as avg_confidence, STDDEV(confidence) as stddev_confidence FROM profiles WHERE confidence IS NOT NULL;
CREATE MATERIALIZED VIEW mv_kpi_user_experience AS SELECT submitted_at::date as day, AVG(clarity_overall) as avg_clarity, AVG(nps) as avg_nps, AVG(engagement) as avg_engagement, COUNT(*) as response_count FROM assessment_feedback WHERE submitted_at >= CURRENT_DATE - INTERVAL '90 days' GROUP BY submitted_at::date;
CREATE UNIQUE INDEX idx_mv_kpi_ux_day ON mv_kpi_user_experience(day);
CREATE MATERIALIZED VIEW mv_kpi_business AS SELECT COUNT(DISTINCT s.id) as total_completed_sessions, 0 as paid_users, 0.0 as free_to_paid_rate_pct, COUNT(DISTINCT s.user_id) FILTER (WHERE s.user_id IS NOT NULL) as registered_users FROM assessment_sessions s WHERE s.status = 'completed';
CREATE MATERIALIZED VIEW mv_kpi_followup AS SELECT 0 as followup_sent, 0 as followup_completed, 0.0 as followup_completion_rate WHERE false;
CREATE MATERIALIZED VIEW mv_kpi_behavioral_impact AS SELECT 0 as reported_changes, 0 as total_followups, 0.0 as change_report_rate WHERE false;
CREATE MATERIALIZED VIEW mv_kpi_trajectory_alignment AS SELECT NULL::numeric as trajectory_correlation, 0 as trajectory_samples WHERE false;

-- Grant access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Refresh
REFRESH MATERIALIZED VIEW mv_kpi_sessions;
REFRESH MATERIALIZED VIEW mv_kpi_item_flags;
REFRESH MATERIALIZED VIEW mv_kpi_feedback;
REFRESH MATERIALIZED VIEW mv_kpi_scoring;
REFRESH MATERIALIZED VIEW mv_kpi_engagement;
REFRESH MATERIALIZED VIEW mv_kpi_item_flow;
REFRESH MATERIALIZED VIEW mv_kpi_item_clarity;
REFRESH MATERIALIZED VIEW mv_kpi_response_process;
REFRESH MATERIALIZED VIEW mv_kpi_construct_coverage;
REFRESH MATERIALIZED VIEW mv_kpi_fairness_dif;
REFRESH MATERIALIZED VIEW mv_kpi_calibration;
REFRESH MATERIALIZED VIEW mv_kpi_confidence_spread;
REFRESH MATERIALIZED VIEW mv_kpi_user_experience;
REFRESH MATERIALIZED VIEW mv_kpi_business;