-- Security Verification Queries
-- Run these to verify the security lockdown worked correctly

-- 1. Verify RLS is enabled on critical tables
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'scoring_results', 'profiles', 'scoring_config', 'scoring_configs',
  'calibration_model', 'fn_logs', 'assessment_sessions', 'assessment_responses'
)
ORDER BY tablename;

-- 2. Check service role write protection on sensitive tables
SELECT 
  schemaname, tablename, policyname, cmd,
  CASE 
    WHEN qual LIKE '%service_role%' THEN '✅ SERVICE_ROLE_ONLY'
    WHEN qual = 'true' THEN '⚠️ OPEN_ACCESS'
    ELSE '🔍 CUSTOM_LOGIC'
  END as access_level
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('scoring_results', 'profiles', 'scoring_config', 'fn_logs')
AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
ORDER BY tablename, cmd;

-- 3. Verify anonymous assessment path still works
SELECT 
  tablename,
  COUNT(*) FILTER (WHERE cmd = 'SELECT') as read_policies,
  COUNT(*) FILTER (WHERE cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')) as write_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('assessment_sessions', 'assessment_responses', 'fc_responses')
GROUP BY tablename
ORDER BY tablename;

-- 4. Check table grants (should be SELECT only for anon/authenticated)
SELECT 
  table_name,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name IN ('scoring_results', 'assessment_sessions', 'scoring_config')
AND grantee IN ('anon', 'authenticated')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;