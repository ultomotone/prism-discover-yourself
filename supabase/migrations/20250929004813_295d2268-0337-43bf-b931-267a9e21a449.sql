-- Security Audit and Lockdown Migration
-- Fix Security Advisor errors while preserving anonymous assessment flow

-- AUDIT STEP 1: Check RLS status (for logging)
DO $audit$ 
DECLARE
    audit_result RECORD;
BEGIN
    RAISE NOTICE 'AUDIT: Tables without RLS enabled:';
    FOR audit_result IN 
        SELECT schemaname, tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname='public' AND rowsecurity = false
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  - %.%: RLS %', audit_result.schemaname, audit_result.tablename, 
            CASE WHEN audit_result.rowsecurity THEN 'ON' ELSE 'OFF' END;
    END LOOP;
END $audit$;

-- STEP 1: Enable RLS on all sensitive tables (idempotent)
ALTER TABLE public.scoring_results          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_results_state    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_configs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_model        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fn_logs                  ENABLE ROW LEVEL SECURITY;

-- Keep content tables readable by anyone
ALTER TABLE public.kb_definitions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_types                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.type_prototypes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_mapping          ENABLE ROW LEVEL SECURITY;

-- Assessment intake tables (anonymous write path)
ALTER TABLE public.assessment_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_responses             ENABLE ROW LEVEL SECURITY;

-- STEP 2: Revoke dangerous global writes and restore safe reads
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Keep SELECT broadly available (read-mostly app)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- STEP 3: Create secure policies

-- Drop all existing permissive policies first
DROP POLICY IF EXISTS allow_all_assessment_questions ON public.assessment_questions;
DROP POLICY IF EXISTS allow_all_assessment_responses ON public.assessment_responses;
DROP POLICY IF EXISTS allow_all_assessment_scoring_key ON public.assessment_scoring_key;
DROP POLICY IF EXISTS allow_all_assessment_sessions ON public.assessment_sessions;
DROP POLICY IF EXISTS allow_all_calibration_model ON public.calibration_model;
DROP POLICY IF EXISTS allow_all_country_mapping ON public.country_mapping;
DROP POLICY IF EXISTS allow_all_fc_blocks ON public.fc_blocks;
DROP POLICY IF EXISTS allow_all_fc_options ON public.fc_options;
DROP POLICY IF EXISTS allow_all_fc_responses ON public.fc_responses;
DROP POLICY IF EXISTS allow_all_kb_definitions ON public.kb_definitions;
DROP POLICY IF EXISTS allow_all_kb_types ON public.kb_types;
DROP POLICY IF EXISTS allow_all_newsletter_signups ON public.newsletter_signups;
DROP POLICY IF EXISTS allow_all_profiles ON public.profiles;
DROP POLICY IF EXISTS allow_all_scoring_config ON public.scoring_config;
DROP POLICY IF EXISTS allow_all_scoring_results ON public.scoring_results;
DROP POLICY IF EXISTS allow_all_scoring_results_functions ON public.scoring_results_functions;
DROP POLICY IF EXISTS allow_all_scoring_results_state ON public.scoring_results_state;
DROP POLICY IF EXISTS allow_all_scoring_results_types ON public.scoring_results_types;
DROP POLICY IF EXISTS allow_all_type_prototypes ON public.type_prototypes;

-- Public content: SELECT for everyone
CREATE POLICY pub_read_kb_def ON public.kb_definitions FOR SELECT USING (true);
CREATE POLICY pub_read_kb_types ON public.kb_types FOR SELECT USING (true);
CREATE POLICY pub_read_types ON public.type_prototypes FOR SELECT USING (true);
CREATE POLICY pub_read_country ON public.country_mapping FOR SELECT USING (true);

-- Assessment questions and keys: read-only for all
CREATE POLICY pub_read_questions ON public.assessment_questions FOR SELECT USING (true);
CREATE POLICY pub_read_scoring_key ON public.assessment_scoring_key FOR SELECT USING (true);
CREATE POLICY pub_read_fc_blocks ON public.fc_blocks FOR SELECT USING (true);
CREATE POLICY pub_read_fc_options ON public.fc_options FOR SELECT USING (true);

-- Scoring config: read for all, write only service role
CREATE POLICY pub_read_scoring_config ON public.scoring_config FOR SELECT USING (true);
CREATE POLICY write_scoring_config_sr ON public.scoring_config
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

-- Results (canonical): SELECT for all; writes only by service role
CREATE POLICY read_results ON public.scoring_results FOR SELECT USING (true);
CREATE POLICY write_results_sr ON public.scoring_results
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

-- Legacy result tables: read ok, write only by service role
CREATE POLICY read_profiles ON public.profiles FOR SELECT USING (true);
CREATE POLICY write_profiles_sr ON public.profiles
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

CREATE POLICY read_scoring_results_types ON public.scoring_results_types FOR SELECT USING (true);
CREATE POLICY write_scoring_results_types_sr ON public.scoring_results_types
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

CREATE POLICY read_scoring_results_functions ON public.scoring_results_functions FOR SELECT USING (true);
CREATE POLICY write_scoring_results_functions_sr ON public.scoring_results_functions
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

CREATE POLICY read_scoring_results_state ON public.scoring_results_state FOR SELECT USING (true);
CREATE POLICY write_scoring_results_state_sr ON public.scoring_results_state
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

-- Configs & calibration: read for all, write only service role
CREATE POLICY read_scoring_configs ON public.scoring_configs FOR SELECT USING (true);
CREATE POLICY write_scoring_configs_sr ON public.scoring_configs
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

CREATE POLICY read_calibration ON public.calibration_model FOR SELECT USING (true);
CREATE POLICY write_calibration_sr ON public.calibration_model
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

-- Logs: write only by service role; revoke public read access
REVOKE SELECT ON public.fn_logs FROM anon, authenticated;
CREATE POLICY write_logs_sr ON public.fn_logs
FOR ALL TO public
USING ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role');

-- Assessment intake: keep anonymous-friendly for now
CREATE POLICY pub_read_sessions ON public.assessment_sessions FOR SELECT USING (true);
CREATE POLICY pub_write_sessions ON public.assessment_sessions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY pub_read_responses ON public.assessment_responses FOR SELECT USING (true);
CREATE POLICY pub_write_responses ON public.assessment_responses FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY pub_read_fc ON public.fc_responses FOR SELECT USING (true);
CREATE POLICY pub_write_fc ON public.fc_responses FOR ALL USING (true) WITH CHECK (true);

-- Newsletter signups: allow public writes
CREATE POLICY pub_read_newsletter ON public.newsletter_signups FOR SELECT USING (true);
CREATE POLICY pub_write_newsletter ON public.newsletter_signups FOR ALL USING (true) WITH CHECK (true);

-- AUDIT STEP 2: Final verification
DO $verify$ 
DECLARE
    verify_result RECORD;
    policy_count INTEGER;
BEGIN  
    -- Count policies created
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    RAISE NOTICE 'VERIFICATION: Created % RLS policies in public schema', policy_count;
    
    -- Check critical tables have proper RLS
    FOR verify_result IN 
        SELECT tablename, rowsecurity
        FROM pg_tables 
        WHERE schemaname='public' 
        AND tablename IN ('scoring_results', 'profiles', 'scoring_config', 'fn_logs')
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  - %: RLS %', verify_result.tablename, 
            CASE WHEN verify_result.rowsecurity THEN 'ENABLED ✅' ELSE 'DISABLED ❌' END;
    END LOOP;
END $verify$;