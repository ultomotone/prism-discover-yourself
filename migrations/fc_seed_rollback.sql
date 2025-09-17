-- IR-07B: FC Infrastructure Seeding Rollback
-- Removes all v1.2 FC infrastructure safely
-- Run this if seeding needs to be undone

-- Step 1: Remove all fc_options for v1.2 blocks
DELETE FROM fc_options WHERE block_id IN (
  SELECT id FROM fc_blocks WHERE version = 'v1.2'
);

-- Step 2: Remove all fc_responses for v1.2 blocks (if any exist)
DELETE FROM fc_responses WHERE block_id IN (
  SELECT id FROM fc_blocks WHERE version = 'v1.2'
);

-- Step 3: Remove all fc_scores for v1.2 
DELETE FROM fc_scores WHERE version = 'v1.2';

-- Step 4: Remove all v1.2 blocks
DELETE FROM fc_blocks WHERE version = 'v1.2';

-- Step 5: Reset version defaults back to v1.1
ALTER TABLE fc_blocks ALTER COLUMN version SET DEFAULT 'v1.1';
ALTER TABLE fc_scores ALTER COLUMN version SET DEFAULT 'v1.1';

-- Step 6: Drop indexes (if they exist)
DROP INDEX CONCURRENTLY IF EXISTS idx_fc_blocks_version_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_fc_options_block_order;  
DROP INDEX CONCURRENTLY IF EXISTS idx_fc_responses_session;
DROP INDEX CONCURRENTLY IF EXISTS idx_fc_scores_session_version;

-- Step 7: Verify rollback success
SELECT 
  'fc_blocks' as table_name,
  COUNT(*) as remaining_rows,
  COUNT(*) FILTER (WHERE version = 'v1.2') as v12_remaining
FROM fc_blocks
UNION ALL
SELECT 
  'fc_options' as table_name, 
  COUNT(*) as remaining_rows,
  0 as v12_remaining
FROM fc_options;