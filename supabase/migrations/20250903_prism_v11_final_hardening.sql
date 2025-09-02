-- Final hardening: materialized analytics views and performance indexes

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
