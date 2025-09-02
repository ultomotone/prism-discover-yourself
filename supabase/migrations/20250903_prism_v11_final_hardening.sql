-- Final hardening: materialized analytics views and performance indexes

-- Ensure profile columns for v1.1 scoring exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS results_version text,
  ADD COLUMN IF NOT EXISTS score_fit_raw numeric,
  ADD COLUMN IF NOT EXISTS score_fit_calibrated numeric,
  ADD COLUMN IF NOT EXISTS fit_band text,
  ADD COLUMN IF NOT EXISTS top_gap numeric,
  ADD COLUMN IF NOT EXISTS invalid_combo_flag boolean;

-- Unique index on profiles.session_id for idempotent upserts
CREATE UNIQUE INDEX IF NOT EXISTS profiles_session_id_uidx ON public.profiles(session_id);

-- SESSION START/END + DURATION + COMPLETION FLAG
CREATE OR REPLACE VIEW public.v_sessions AS
WITH resp AS (
  SELECT
    ar.session_id,
    COUNT(*)            AS response_count,
    MIN(ar.created_at)  AS first_answer_at,
    MAX(ar.created_at)  AS last_answer_at
  FROM public.assessment_responses ar
  GROUP BY ar.session_id
)
SELECT
  s.id                                 AS session_id,
  COALESCE(s.user_id, p.user_id)       AS user_id,
  s.email,
  s.status,
  s.started_at,
  s.completed_at,
  (s.status = 'completed')             AS is_completed,
  (EXTRACT(EPOCH FROM (
     COALESCE(s.completed_at, r.last_answer_at, now()) - s.started_at
   )) * 1000)::bigint                  AS duration_ms,
  COALESCE(r.response_count, 0)        AS response_count,
  p.type_code,
  p.results_version,
  p.score_fit_calibrated               AS fit_calibrated,
  p.fit_band,
  p.close_call
FROM public.assessment_sessions s
LEFT JOIN resp r            ON r.session_id = s.id
LEFT JOIN public.profiles p ON p.session_id = s.id;

-- Materialized views for heavy analytics
create materialized view if not exists mv_latest_assessments_v11 as
select * from v_latest_assessments_v11;

create materialized view if not exists mv_kpi_overview_30d_v11 as
select * from v_kpi_overview_30d_v11;

-- Indexes to improve query performance
create index if not exists idx_profiles_created_at on profiles(created_at desc);
create index if not exists idx_profiles_type_code on profiles(type_code);
create index if not exists idx_profiles_results_version on profiles(results_version);
create index if not exists idx_assessment_sessions_status_started on assessment_sessions(status, started_at desc);

-- JSONB GIN indexes for profile fields
create index if not exists idx_profiles_top_3_fits on profiles using gin((top_3_fits));
create index if not exists idx_profiles_type_scores on profiles using gin((type_scores));

-- Scheduled refresh of materialized views handled externally (e.g., pg_cron or edge function)

-- Dashboard view grants
GRANT SELECT ON public.v_latest_assessments_v11, public.v_kpi_overview_30d_v11, public.v_sessions TO anon;
