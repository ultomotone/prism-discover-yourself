-- ============================================================================
-- Performance Indexes for Analytics MVs
-- ============================================================================

-- Sessions funnel indexes
CREATE INDEX IF NOT EXISTS ix_sessions_started_at ON assessment_sessions(started_at);
CREATE INDEX IF NOT EXISTS ix_sessions_status ON assessment_sessions(status);
CREATE INDEX IF NOT EXISTS ix_sessions_completed_at ON assessment_sessions(completed_at);

-- Responses (timing + joins)
CREATE INDEX IF NOT EXISTS ix_responses_qid ON assessment_responses(question_id);
CREATE INDEX IF NOT EXISTS ix_responses_session ON assessment_responses(session_id);
CREATE INDEX IF NOT EXISTS ix_responses_time_notnull ON assessment_responses(response_time_ms)
  WHERE response_time_ms IS NOT NULL;

-- Item flags
CREATE INDEX IF NOT EXISTS ix_flags_qid ON assessment_item_flags(question_id);
CREATE INDEX IF NOT EXISTS ix_flags_session ON assessment_item_flags(session_id);

-- Questions
CREATE INDEX IF NOT EXISTS ix_questions_status ON assessment_questions(clarity_status);
CREATE INDEX IF NOT EXISTS ix_questions_version ON assessment_questions(question_version);

-- Profiles (scoring health) - using JSONB operators
CREATE INDEX IF NOT EXISTS ix_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS ix_profiles_top_gap ON profiles((payload->>'top_gap'));
CREATE INDEX IF NOT EXISTS ix_profiles_conf_cal ON profiles(conf_calibrated);
CREATE INDEX IF NOT EXISTS ix_profiles_validity ON profiles(validity_status);

-- ============================================================================
-- Add A/B Testing Support to Questions
-- ============================================================================

ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS construct_tag TEXT,
  ADD COLUMN IF NOT EXISTS variant_label TEXT;

-- ============================================================================
-- Auto-Triage Function for Confusing Items
-- ============================================================================

CREATE OR REPLACE FUNCTION triage_confusing_items() 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mark items as needing review if flag_rate > 5% or p90 > 12s
  UPDATE assessment_questions q
  SET clarity_status = 'review'
  FROM mv_kpi_item_flags f
  LEFT JOIN mv_kpi_item_timing t ON t.question_id = f.question_id
  WHERE q.id = f.question_id
    AND q.clarity_status = 'ok'
    AND (f.flag_rate > 0.05 OR COALESCE(t.p90_ms, 0) > 12000);
END $$;

-- ============================================================================
-- KPI Alerts Function
-- ============================================================================

CREATE OR REPLACE FUNCTION kpi_alerts() 
RETURNS TABLE(msg text) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH latest_scoring AS (
    SELECT *
    FROM mv_kpi_scoring
    WHERE day >= now() - interval '1 day'
    ORDER BY day DESC
    LIMIT 1
  ),
  latest_sessions AS (
    SELECT *
    FROM mv_kpi_sessions
    WHERE day >= now() - interval '1 day'
    ORDER BY day DESC
    LIMIT 1
  )
  SELECT
    CASE
      WHEN ls.avg_conf_cal < 0.6 THEN '⚠️ Confidence calibration < 0.60'
      WHEN lses.sessions_completed > 0 AND (ls.invalid_ct::float / lses.sessions_completed) > 0.25 
        THEN '⚠️ Close-calls > 25%'
      ELSE NULL
    END AS msg
  FROM latest_scoring ls
  CROSS JOIN latest_sessions lses
  WHERE 1=1
$$;

-- ============================================================================
-- Scheduled Refreshes via pg_cron
-- ============================================================================

-- Fast MVs: every 10 minutes
SELECT cron.schedule(
  'mv_kpi_fast_10min',
  '*/10 * * * *',
  $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_sessions;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_flags;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_feedback;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_scoring;
  $$
);

-- Item timing: every 30 minutes
SELECT cron.schedule(
  'mv_kpi_timing_30min',
  '*/30 * * * *',
  $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_timing;
  $$
);

-- Item discrimination: hourly (heavier calculation)
SELECT cron.schedule(
  'mv_kpi_discrimination_hourly',
  '5 * * * *',
  $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_item_discrimination;
  $$
);

-- Nightly triage of confusing items
SELECT cron.schedule(
  'triage_items_nightly',
  '0 2 * * *',
  $$
    SELECT triage_confusing_items();
  $$
);

-- ============================================================================
-- RPC for Consolidated KPI Fetch
-- ============================================================================

CREATE OR REPLACE FUNCTION get_assessment_kpis(
  start_date date DEFAULT (CURRENT_DATE - interval '7 days')::date,
  end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'sessions', (
      SELECT COALESCE(jsonb_agg(row_to_json(s)), '[]'::jsonb)
      FROM (
        SELECT * FROM mv_kpi_sessions
        WHERE day >= start_date AND day <= end_date
        ORDER BY day ASC
      ) s
    ),
    'itemFlags', (
      SELECT COALESCE(jsonb_agg(row_to_json(f)), '[]'::jsonb)
      FROM (
        SELECT * FROM mv_kpi_item_flags
        ORDER BY flag_rate DESC NULLS LAST
        LIMIT 20
      ) f
    ),
    'feedback', (
      SELECT COALESCE(jsonb_agg(row_to_json(fb)), '[]'::jsonb)
      FROM (
        SELECT * FROM mv_kpi_feedback
        WHERE day >= start_date AND day <= end_date
        ORDER BY day ASC
      ) fb
    ),
    'scoring', (
      SELECT COALESCE(jsonb_agg(row_to_json(sc)), '[]'::jsonb)
      FROM (
        SELECT * FROM mv_kpi_scoring
        WHERE day >= start_date AND day <= end_date
        ORDER BY day ASC
      ) sc
    ),
    'alerts', (
      SELECT COALESCE(jsonb_agg(msg), '[]'::jsonb)
      FROM kpi_alerts()
      WHERE msg IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END $$;