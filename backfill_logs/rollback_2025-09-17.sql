-- Backfill Rollback Script
-- Generated: 2025-09-17T18:07:45.000Z
-- Environment: staging
-- Execution Window: 2025-09-17T18:05:30.000Z to 2025-09-17T18:07:45.000Z

-- ROLLBACK STEP 1: Remove FC Scores created during backfill
DELETE FROM public.fc_scores 
WHERE version = 'v1.2' 
  AND created_at >= '2025-09-17T18:05:30.000Z';

-- ROLLBACK STEP 2: Remove Profiles created during backfill  
DELETE FROM public.profiles
WHERE results_version = 'v1.2.1'
  AND created_at >= '2025-09-17T18:05:30.000Z';

-- VERIFICATION QUERIES
-- Check fc_scores removal
SELECT COUNT(*) as remaining_fc_scores 
FROM public.fc_scores 
WHERE version = 'v1.2' 
  AND created_at >= '2025-09-17T18:05:30.000Z';
-- Expected: 0

-- Check profiles removal  
SELECT COUNT(*) as remaining_backfill_profiles
FROM public.profiles 
WHERE results_version = 'v1.2.1' 
  AND created_at >= '2025-09-17T18:05:30.000Z';
-- Expected: 0

-- TARGETED ROLLBACK (if needed for specific sessions)
-- Rollback priority batch only
DELETE FROM public.fc_scores 
WHERE version = 'v1.2' 
  AND session_id IN ('618c5ea6-aeda-4084-9156-0aac9643afd3', '070d9bf2-516f-44ee-87fc-017c7db9d29c');

DELETE FROM public.profiles
WHERE results_version = 'v1.2.1'
  AND session_id IN ('618c5ea6-aeda-4084-9156-0aac9643afd3', '070d9bf2-516f-44ee-87fc-017c7db9d29c');

-- AUDIT QUERIES
-- Check which sessions were affected
SELECT 
  'fc_scores' as table_name,
  session_id,
  version,
  created_at
FROM public.fc_scores 
WHERE version = 'v1.2' 
  AND created_at >= '2025-09-17T18:05:30.000Z'
ORDER BY created_at;

SELECT 
  'profiles' as table_name,
  session_id,
  results_version,
  created_at,
  updated_at
FROM public.profiles
WHERE results_version = 'v1.2.1'
  AND (created_at >= '2025-09-17T18:05:30.000Z' OR updated_at >= '2025-09-17T18:05:30.000Z')
ORDER BY COALESCE(updated_at, created_at);