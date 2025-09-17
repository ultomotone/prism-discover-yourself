-- STAGING PRECHECKS SQL
-- Verify staging environment is drift-free and ready for v1.2.1 promotion
-- Run these checks before applying version alignment changes

-- =============================================================================
-- CHECK A: Verify scoring_config.results_version state
-- =============================================================================
SELECT 
  'A.1 - Current results_version' as check_name,
  key,
  value,
  updated_at,
  CASE 
    WHEN key = 'results_version' AND value = '"v1.2.1"'::jsonb THEN 'PASS - Already aligned'
    WHEN key = 'results_version' AND value != '"v1.2.1"'::jsonb THEN 'FAIL - Needs update to v1.2.1'
    WHEN key = 'results_version' THEN 'UNKNOWN - Unexpected value format'
    ELSE 'MISSING - results_version key not found'
  END as status
FROM scoring_config 
WHERE key = 'results_version'
UNION ALL
SELECT 
  'A.2 - results_version exists',
  COALESCE(key, 'MISSING'),
  COALESCE(value::text, 'NULL'),
  COALESCE(updated_at, NULL),
  CASE 
    WHEN EXISTS(SELECT 1 FROM scoring_config WHERE key = 'results_version') THEN 'PASS'
    ELSE 'FAIL - Key missing'
  END
FROM (SELECT NULL::text as key, NULL::jsonb as value, NULL::timestamp as updated_at) t
WHERE NOT EXISTS(SELECT 1 FROM scoring_config WHERE key = 'results_version');

-- =============================================================================
-- CHECK B: RPC get_profile_by_session validation
-- =============================================================================
SELECT 
  'B.1 - RPC function exists' as check_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  CASE p.prosecdef 
    WHEN true THEN 'SECURITY DEFINER' 
    ELSE 'SECURITY INVOKER' 
  END as security_type,
  CASE 
    WHEN p.proname = 'get_profile_by_session' AND p.prosecdef = true 
      AND pg_get_function_arguments(p.oid) LIKE '%p_session_id%' 
      AND pg_get_function_arguments(p.oid) LIKE '%p_share_token%'
    THEN 'PASS'
    WHEN p.proname = 'get_profile_by_session' AND p.prosecdef != true
    THEN 'FAIL - Not SECURITY DEFINER'
    WHEN p.proname = 'get_profile_by_session'
    THEN 'FAIL - Missing required arguments'
    ELSE 'FAIL - Function missing'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'get_profile_by_session'
UNION ALL
SELECT 
  'B.2 - RPC function missing check',
  'get_profile_by_session',
  'N/A',
  'N/A',
  'FAIL - Function does not exist'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'get_profile_by_session'
);

-- =============================================================================
-- CHECK C: RLS Policies Validation
-- =============================================================================
-- Check profiles table RLS
SELECT 
  'C.1 - Profiles RLS enabled' as check_name,
  schemaname,
  tablename,
  rowsecurity::text as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN 'PASS - RLS enabled'
    ELSE 'FAIL - RLS disabled (public access)'
  END as status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check profiles RLS policies
SELECT 
  'C.2 - Profiles RLS policies' as check_name,
  schemaname,
  tablename,
  COUNT(*)::text as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS - Has RLS policies'
    ELSE 'FAIL - No RLS policies (allows anonymous access)'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
GROUP BY schemaname, tablename
UNION ALL
SELECT 
  'C.3 - Profiles no policies check',
  'public',
  'profiles',
  '0',
  'FAIL - No RLS policies found'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'profiles'
);

-- =============================================================================
-- CHECK D: assessment_sessions.share_token validation
-- =============================================================================
-- Check share_token column exists and has default
SELECT 
  'D.1 - share_token column' as check_name,
  column_name,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'share_token' AND is_nullable = 'NO' AND column_default IS NOT NULL
    THEN 'PASS - Column exists with default'
    WHEN column_name = 'share_token' AND is_nullable = 'YES'
    THEN 'WARN - Column nullable'
    WHEN column_name = 'share_token' AND column_default IS NULL
    THEN 'FAIL - No default value'
    ELSE 'FAIL - Column missing'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'assessment_sessions' AND column_name = 'share_token'
UNION ALL
SELECT 
  'D.2 - share_token missing check',
  'share_token',
  'MISSING',
  'MISSING',
  'FAIL - Column does not exist'
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'assessment_sessions' AND column_name = 'share_token'
);

-- Count NULL share_tokens in recent sessions
SELECT 
  'D.3 - share_token NULL count' as check_name,
  'last_7_days' as period,
  COUNT(CASE WHEN share_token IS NULL THEN 1 END)::text as null_count,
  COUNT(*)::text as total_sessions,
  CASE 
    WHEN COUNT(CASE WHEN share_token IS NULL THEN 1 END) = 0 THEN 'PASS - No NULL tokens'
    WHEN COUNT(CASE WHEN share_token IS NULL THEN 1 END) <= 5 THEN 'WARN - Few NULL tokens'
    ELSE 'FAIL - Many NULL tokens'
  END as status
FROM assessment_sessions 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- =============================================================================
-- CHECK E: fc_scores.version distribution (last 7 days)
-- =============================================================================
SELECT 
  'E.1 - FC scores version dist' as check_name,
  version,
  COUNT(*)::text as session_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1)::text || '%' as percentage,
  CASE 
    WHEN version = 'v1.2' THEN 'PASS - Target version'
    WHEN version LIKE 'v1.%' THEN 'WARN - Legacy version'
    ELSE 'FAIL - Unknown version'
  END as status
FROM fc_scores 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY version
ORDER BY COUNT(*) DESC;

-- Check for missing fc_scores
SELECT 
  'E.2 - Sessions missing FC scores' as check_name,
  'last_7_days' as period,
  COUNT(s.id)::text as sessions_without_fc,
  CASE 
    WHEN COUNT(s.id) = 0 THEN 'PASS - All sessions have FC scores'
    WHEN COUNT(s.id) <= 10 THEN 'WARN - Few sessions missing FC'
    ELSE 'FAIL - Many sessions missing FC scores'
  END as status,
  'Target: All completed sessions should have fc_scores' as target
FROM assessment_sessions s
LEFT JOIN fc_scores fc ON fc.session_id = s.id
WHERE s.created_at >= NOW() - INTERVAL '7 days'
  AND s.status = 'completed'
  AND fc.session_id IS NULL;

-- =============================================================================
-- CHECK F: Legacy FC artifacts detection
-- =============================================================================
-- Check for per-question FC map usage in assessment_scoring_key
SELECT 
  'F.1 - Legacy FC map usage' as check_name,
  COUNT(CASE WHEN fc_map IS NOT NULL THEN 1 END)::text as questions_with_fc_map,
  COUNT(*)::text as total_questions,
  CASE 
    WHEN COUNT(CASE WHEN fc_map IS NOT NULL THEN 1 END) = 0 THEN 'PASS - No legacy FC maps'
    ELSE 'WARN - Legacy FC maps present'
  END as status
FROM assessment_scoring_key;

-- Check for fc_map usage in assessment_questions
SELECT 
  'F.2 - Assessment questions FC map' as check_name,
  COUNT(CASE WHEN fc_map IS NOT NULL THEN 1 END)::text as questions_with_fc_map,
  COUNT(*)::text as total_questions,
  CASE 
    WHEN COUNT(CASE WHEN fc_map IS NOT NULL THEN 1 END) = 0 THEN 'PASS - No legacy FC maps'
    ELSE 'WARN - Legacy FC maps in questions'
  END as status
FROM assessment_questions;

-- =============================================================================
-- SUMMARY CHECK: Overall readiness
-- =============================================================================
SELECT 
  'SUMMARY - Staging Readiness' as check_name,
  'overall' as component,
  'See individual checks above' as details,
  CASE 
    WHEN EXISTS(SELECT 1 FROM scoring_config WHERE key = 'results_version' AND value = '"v1.2.1"'::jsonb)
      AND EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
                 WHERE n.nspname = 'public' AND p.proname = 'get_profile_by_session' AND p.prosecdef = true)
    THEN 'READY - Core components aligned'
    ELSE 'NOT READY - Check failures above'
  END as status;