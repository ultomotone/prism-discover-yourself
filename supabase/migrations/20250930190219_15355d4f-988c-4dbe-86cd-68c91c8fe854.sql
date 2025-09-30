-- Add unique indexes to materialized views for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_sessions_day 
  ON mv_kpi_sessions (day);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_feedback_day 
  ON mv_kpi_feedback (day);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_scoring_day 
  ON mv_kpi_scoring (day);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpi_item_flags_qid 
  ON mv_kpi_item_flags (question_id);

-- Now refresh all views non-concurrently (doesn't need unique indexes)
REFRESH MATERIALIZED VIEW mv_kpi_sessions;
REFRESH MATERIALIZED VIEW mv_kpi_feedback;
REFRESH MATERIALIZED VIEW mv_kpi_scoring;
REFRESH MATERIALIZED VIEW mv_kpi_item_flags;