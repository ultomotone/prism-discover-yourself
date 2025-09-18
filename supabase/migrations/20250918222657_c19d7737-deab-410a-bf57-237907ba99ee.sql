-- Fix conflicting unique index on scoring_results_state table
-- The table PK is (block_context, session_id, results_version).
-- Drop any stray unique index that forces (session_id, results_version) uniqueness.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'scoring_results_state_session_id_results_version_key'
  ) THEN
    EXECUTE 'DROP INDEX IF EXISTS public.scoring_results_state_session_id_results_version_key';
    RAISE NOTICE 'Dropped conflicting unique index: scoring_results_state_session_id_results_version_key';
  ELSE
    RAISE NOTICE 'No conflicting unique index found to drop';
  END IF;
END$$;