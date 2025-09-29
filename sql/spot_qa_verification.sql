-- Spot QA Verification Queries for Scoring Migration
-- Run these to verify unified scoring_results integrity

-- 1. Compare unified vs legacy data for consistency
WITH session_comparison AS (
  SELECT 
    r.session_id,
    r.type_code as unified_type,
    p.type_code as legacy_type,
    r.confidence as unified_confidence,
    p.confidence as legacy_confidence,
    r.scoring_version,
    r.computed_at as unified_computed,
    p.computed_at as legacy_computed
  FROM scoring_results r
  LEFT JOIN profiles p ON p.session_id = r.session_id
  WHERE r.computed_at >= now() - interval '1 day'
  LIMIT 10
)
SELECT 
  session_id,
  CASE 
    WHEN unified_type = legacy_type THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as type_consistency,
  CASE 
    WHEN ABS(COALESCE(unified_confidence, 0) - COALESCE(legacy_confidence, 0)) < 0.01 THEN '✅ MATCH'
    ELSE '❌ MISMATCH' 
  END as confidence_consistency,
  unified_type,
  legacy_type,
  scoring_version
FROM session_comparison;

-- 2. Payload structure validation
SELECT 
  session_id,
  scoring_version,
  CASE 
    WHEN payload ? 'profile' AND payload ? 'types' AND payload ? 'functions' THEN '✅ COMPLETE'
    ELSE '❌ INCOMPLETE'
  END as payload_structure,
  (payload->'profile'->>'type_code') as payload_type_code,
  type_code as convenience_type_code,
  computed_at
FROM scoring_results 
WHERE computed_at >= now() - interval '1 hour'
ORDER BY computed_at DESC
LIMIT 5;

-- 3. Performance metrics - session counts by table
SELECT 
  'unified_scoring_results' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT scoring_version) as version_count,
  MAX(computed_at) as latest_computed
FROM scoring_results
UNION ALL
SELECT 
  'legacy_profiles' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT scoring_version) as version_count,
  MAX(computed_at) as latest_computed  
FROM profiles
UNION ALL
SELECT 
  'legacy_types' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT results_version) as version_count,
  MAX(created_at) as latest_computed
FROM scoring_results_types;

-- 4. Missing unified results (should be empty after backfill)
SELECT 
  s.id as session_id,
  s.status,
  s.completed_at,
  CASE WHEN p.session_id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile,
  CASE WHEN r.session_id IS NOT NULL THEN '✅' ELSE '❌' END as has_unified
FROM assessment_sessions s
LEFT JOIN profiles p ON p.session_id = s.id  
LEFT JOIN scoring_results r ON r.session_id = s.id
WHERE s.status = 'completed'
  AND s.completed_at >= now() - interval '7 days'
  AND r.session_id IS NULL
ORDER BY s.completed_at DESC
LIMIT 10;

-- 5. Version distribution analysis  
SELECT 
  scoring_version,
  COUNT(*) as session_count,
  MIN(computed_at) as first_computed,
  MAX(computed_at) as last_computed,
  COUNT(DISTINCT type_code) as unique_types
FROM scoring_results 
GROUP BY scoring_version
ORDER BY last_computed DESC;