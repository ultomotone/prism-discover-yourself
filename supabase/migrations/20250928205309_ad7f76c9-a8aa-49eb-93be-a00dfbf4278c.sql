-- Drop all results/output tables while keeping input data for scoring
-- Properly categorized as tables vs views

-- Drop output views first
DROP VIEW IF EXISTS public.v_latest_assessments_v11 CASCADE;
DROP VIEW IF EXISTS public.v_kpi_overview_30d_v11 CASCADE;
DROP VIEW IF EXISTS public.v_activity_country_30d CASCADE;
DROP VIEW IF EXISTS public.v_calibration_confidence CASCADE;
DROP VIEW IF EXISTS public.assessment_questions_view CASCADE;
DROP VIEW IF EXISTS public.dashboard_statistics_latest CASCADE;
DROP VIEW IF EXISTS public.inferred_session_times CASCADE;
DROP VIEW IF EXISTS public.admin_confidence_dist_last_30d CASCADE;
DROP VIEW IF EXISTS public.admin_kpis_last_30d CASCADE;
DROP VIEW IF EXISTS public.admin_overlay_dist_last_30d CASCADE;
DROP VIEW IF EXISTS public.assessment_landscape CASCADE;
DROP VIEW IF EXISTS public.dashboard_profile_stats CASCADE;
DROP VIEW IF EXISTS public.scoring_version_status CASCADE;

-- Drop output tables
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.scoring_results CASCADE;
DROP TABLE IF EXISTS public.scoring_results_functions CASCADE;
DROP TABLE IF EXISTS public.scoring_results_state CASCADE;
DROP TABLE IF EXISTS public.scoring_results_types CASCADE;
DROP TABLE IF EXISTS public.fc_scores CASCADE;
DROP TABLE IF EXISTS public.session_method_metrics CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.dashboard_statistics CASCADE;
DROP TABLE IF EXISTS public.evidence_kpis CASCADE;
DROP TABLE IF EXISTS public.results_token_access_logs CASCADE;
DROP TABLE IF EXISTS public.results_token_events CASCADE;

-- Drop results-related functions
DROP FUNCTION IF EXISTS public.trigger_update_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS public.update_dashboard_statistics() CASCADE;
DROP FUNCTION IF EXISTS public.update_dashboard_statistics_for_date(date) CASCADE;
DROP FUNCTION IF EXISTS public.update_dashboard_statistics_range(date, date) CASCADE;
DROP FUNCTION IF EXISTS public.on_profile_insert_update_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_results_by_email(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_results_v2(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_profile_by_session_token(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_profile_by_session_token(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_profile_by_session_token(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_assessment_scores(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_scores(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.compute_profile_from_responses(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.recompute_profile(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_recompute_profile(uuid, text) CASCADE;

-- Preserved input/scoring tables:
-- assessment_sessions, assessment_responses, assessment_questions
-- assessment_scoring_key, scoring_config, scoring_configs
-- fc_blocks, fc_options, fc_responses, calibration_model  
-- type_prototypes, kb_definitions, kb_types, country_mapping