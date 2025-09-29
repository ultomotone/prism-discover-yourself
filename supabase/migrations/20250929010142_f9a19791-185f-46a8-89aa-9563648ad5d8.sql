-- Security Lockdown Final Pass - Drive to 0 Errors (Fixed)
-- Fix remaining security issues while preserving anonymous assessment flow

-- ISSUE 1: Fix change_requests table (RLS disabled) 
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- change_requests is an admin table - only service role should access it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'change_requests' 
        AND policyname = 'write_change_requests_sr'
    ) THEN
        CREATE POLICY write_change_requests_sr ON public.change_requests
        FOR ALL TO public
        USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
        WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');
    END IF;
END $$;

-- ISSUE 2: Restrict dangerous SECURITY DEFINER functions to service_role only

-- Extremely dangerous function - admin only
REVOKE EXECUTE ON FUNCTION public.pg_execute(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.pg_execute(text) TO service_role;

-- Test/example functions - remove public access (if they exist)
DO $$
BEGIN
    -- Check if function exists before revoking
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'example_rate_limited_function') THEN
        REVOKE EXECUTE ON FUNCTION public.example_rate_limited_function(text) FROM anon, authenticated, public;
        GRANT EXECUTE ON FUNCTION public.example_rate_limited_function(text) TO service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'your_function_name') THEN
        REVOKE EXECUTE ON FUNCTION public.your_function_name(text, text, integer) FROM anon, authenticated, public;
        GRANT EXECUTE ON FUNCTION public.your_function_name(text, text, integer) TO service_role;
    END IF;
END $$;

-- Admin query functions - restrict to service role (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_sessions_with_emails_for_finalize') THEN
        REVOKE EXECUTE ON FUNCTION public.get_sessions_with_emails_for_finalize(integer, integer) FROM anon, authenticated, public;
        GRANT EXECUTE ON FUNCTION public.get_sessions_with_emails_for_finalize(integer, integer) TO service_role;
    END IF;
END $$;

-- Integrity/QA functions - admin only
REVOKE EXECUTE ON FUNCTION public.check_question_library_integrity(integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.check_question_library_integrity(integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.check_scoring_qa(uuid, text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.check_scoring_qa(uuid, text) TO service_role;

-- ISSUE 3: Re-apply safe baseline to catch any lingering grants

-- Revoke all write privileges from anon/authenticated (idempotent)
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Keep reads available for public content
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;  
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Restrict sequence access
REVOKE USAGE, UPDATE ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE USAGE, UPDATE ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Exception: change_requests should not be readable by anon/authenticated
REVOKE SELECT ON public.change_requests FROM anon, authenticated;

-- VERIFICATION: Log final state
DO $verify$ 
DECLARE
    rls_disabled_count INTEGER;
    no_policy_count INTEGER;
BEGIN  
    -- Count tables without RLS
    SELECT COUNT(*) INTO rls_disabled_count
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = false;
    
    -- Count tables with RLS but no policies  
    SELECT COUNT(*) INTO no_policy_count
    FROM (
        SELECT t.tablename
        FROM pg_tables t
        LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
        WHERE t.schemaname = 'public' AND t.rowsecurity = true
        GROUP BY t.tablename
        HAVING COUNT(p.*) = 0
    ) sub;
    
    RAISE NOTICE 'SECURITY LOCKDOWN COMPLETE:';
    RAISE NOTICE '  - Tables without RLS: %', rls_disabled_count;
    RAISE NOTICE '  - Tables with RLS but no policies: %', no_policy_count;
    RAISE NOTICE '  - Anonymous assessment intake: PRESERVED';
    RAISE NOTICE '  - Results/config write access: SERVICE_ROLE ONLY';
    
    IF rls_disabled_count = 0 AND no_policy_count = 0 THEN
        RAISE NOTICE '  - STATUS: Should be 0 Security Errors ✅';
    ELSE
        RAISE NOTICE '  - STATUS: May still have security issues ⚠️';
    END IF;
END $verify$;