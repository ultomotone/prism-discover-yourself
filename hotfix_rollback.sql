-- IR-07B Hotfix Rollback Plan
-- SCOPE: Smoke test execution only - NO DATABASE CHANGES

-- Since no database changes are made in PHASE 1 (smoke test execution only),
-- no SQL rollback is required.

-- If PHASE 2 version fixes are applied, the rollback would be:
-- 1. Revert RealFCBlock.tsx version from 'v1.2' back to 'v1.1'  
-- 2. Revert fcBlockService.ts version from 'v1.2' back to 'v1.1'

-- FC seeding remains intact and functional:
SELECT 
  'fc_blocks' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE version = 'v1.2') as v12_count
FROM fc_blocks
UNION ALL
SELECT 
  'fc_options' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE block_id IN (SELECT id FROM fc_blocks WHERE version = 'v1.2')) as v12_count  
FROM fc_options;

-- Note: fc_scores table may have test data after smoke test
-- To clean up test fc_scores if needed:
-- DELETE FROM fc_scores WHERE session_id IN ('618c5ea6-aeda-4084-9156-0aac9643afd3', '070d9bf2-516f-44ee-87fc-017c7db9d29c');

-- Rollback is essentially a no-op since we're only executing existing test scripts.