-- Add unique indexes for multi-row MVs only
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_reliability_type 
  ON mv_kpi_reliability(metric_type);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_user_experience_day 
  ON mv_kpi_user_experience(day);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_response_process_day 
  ON mv_kpi_response_process(day);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_item_flow_qid 
  ON mv_kpi_item_flow(question_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_item_clarity_qid 
  ON mv_kpi_item_clarity(question_id);

-- Now refresh all MVs (concurrent where we have indexes, regular otherwise)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_sessions;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scoring;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_feedback;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_engagement;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_flags;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_clarity;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_flow;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_response_process;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability;

-- Non-concurrent refresh for single-row MVs
REFRESH MATERIALIZED VIEW mv_kpi_user_experience;
REFRESH MATERIALIZED VIEW mv_kpi_cfa;
REFRESH MATERIALIZED VIEW mv_kpi_construct_coverage;
REFRESH MATERIALIZED VIEW mv_kpi_fairness_dif;
REFRESH MATERIALIZED VIEW mv_kpi_calibration;
REFRESH MATERIALIZED VIEW mv_kpi_classification_stability;
REFRESH MATERIALIZED VIEW mv_kpi_confidence_spread;
REFRESH MATERIALIZED VIEW mv_kpi_business;
REFRESH MATERIALIZED VIEW mv_kpi_followup;
REFRESH MATERIALIZED VIEW mv_kpi_behavioral_impact;
REFRESH MATERIALIZED VIEW mv_kpi_trajectory_alignment;