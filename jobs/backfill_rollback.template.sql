-- BF-01 Backfill Rollback Template
-- Generated: 2025-09-17T08:00:00Z
-- Environment: Staging
-- Rollback Method: Delete by version and timestamp filters

-- ROLLBACK STEP 1: Remove FC Scores created during backfill
-- Removes all fc_scores rows with version='v1.2' created during backfill window
DELETE FROM public.fc_scores 
WHERE version = 'v1.2' 
  AND created_at >= '2025-09-17T08:00:00Z'
  AND session_id IN (
    -- Only sessions that were part of backfill operation
    SELECT DISTINCT session_id 
    FROM public.assessment_sessions 
    WHERE status = 'completed' 
      AND created_at >= '2025-08-01'
  );

-- ROLLBACK STEP 2: Remove Profiles created during backfill (if needed)
-- Only removes profiles created during backfill, not pre-existing ones
DELETE FROM public.profiles 
WHERE results_version = 'v1.2.1' 
  AND created_at >= '2025-09-17T08:00:00Z'
  AND session_id IN (
    -- Only sessions that were missing profiles before backfill
    '618c5ea6-aeda-4084-9156-0aac9643afd3',
    '070d9bf2-516f-44ee-87fc-017c7db9d29c'
    -- Additional sessions would be listed here based on backfill execution
  );

-- VERIFICATION QUERIES
-- Run these to verify rollback success:

-- Check fc_scores removal
SELECT COUNT(*) as remaining_fc_scores 
FROM public.fc_scores 
WHERE version = 'v1.2' 
  AND created_at >= '2025-09-17T08:00:00Z';
-- Expected: 0

-- Check profiles removal  
SELECT COUNT(*) as remaining_backfill_profiles
FROM public.profiles 
WHERE results_version = 'v1.2.1' 
  AND created_at >= '2025-09-17T08:00:00Z';
-- Expected: 0

-- Verify system state restored to pre-backfill
SELECT 
  COUNT(CASE WHEN p.session_id IS NULL THEN 1 END) as sessions_missing_profiles,
  COUNT(CASE WHEN fc.session_id IS NULL THEN 1 END) as sessions_missing_fc_scores
FROM public.assessment_sessions s
LEFT JOIN public.profiles p ON p.session_id = s.id
LEFT JOIN public.fc_scores fc ON fc.session_id = s.id AND fc.version = 'v1.2'
WHERE s.status = 'completed' 
  AND s.created_at >= '2025-08-01';
-- Expected: Back to pre-backfill counts (13 missing profiles, 39 missing fc_scores)