-- Drop empty exploded tables (Phase 2 migration complete)
DROP TABLE IF EXISTS public.scoring_results_types CASCADE;
DROP TABLE IF EXISTS public.scoring_results_functions CASCADE;
DROP TABLE IF EXISTS public.scoring_results_state CASCADE;

-- Drop staging/backup tables
DROP TABLE IF EXISTS public.assessment_scoring_key_backup CASCADE;
DROP TABLE IF EXISTS public.assessment_scoring_key_staging CASCADE;

-- Drop unused views
DROP VIEW IF EXISTS public.v_normalized_responses CASCADE;
DROP VIEW IF EXISTS public.v_results_min CASCADE;
DROP VIEW IF EXISTS public.v_results_missing_new_fields CASCADE;
DROP VIEW IF EXISTS public.v_session_answer_counts CASCADE;
DROP VIEW IF EXISTS public.v_sessions_for_recompute CASCADE;