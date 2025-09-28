-- Completely disable RLS and allow unrestricted access to all tables
-- This removes all authentication barriers for frontend, edge functions, and scoring

-- First, drop all existing RLS policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all public tables
ALTER TABLE IF EXISTS public.assessment_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assessment_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assessment_scoring_key DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assessment_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calibration_model DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.change_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.country_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fc_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fc_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fc_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fn_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kb_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kb_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.newsletter_signups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rate_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scoring_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scoring_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.type_prototypes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon and authenticated roles on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Ensure service_role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create permissive policies for any tables that might need them (as fallback)
-- These allow all operations for everyone

-- Assessment Questions (public read access)
CREATE POLICY "allow_all_assessment_questions" ON public.assessment_questions FOR ALL USING (true) WITH CHECK (true);

-- Assessment Sessions (full access)
CREATE POLICY "allow_all_assessment_sessions" ON public.assessment_sessions FOR ALL USING (true) WITH CHECK (true);

-- Assessment Responses (full access)
CREATE POLICY "allow_all_assessment_responses" ON public.assessment_responses FOR ALL USING (true) WITH CHECK (true);

-- Assessment Scoring Key (full access)
CREATE POLICY "allow_all_assessment_scoring_key" ON public.assessment_scoring_key FOR ALL USING (true) WITH CHECK (true);

-- Scoring Config (full access)
CREATE POLICY "allow_all_scoring_config" ON public.scoring_config FOR ALL USING (true) WITH CHECK (true);

-- FC Tables (full access)
CREATE POLICY "allow_all_fc_blocks" ON public.fc_blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_fc_options" ON public.fc_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_fc_responses" ON public.fc_responses FOR ALL USING (true) WITH CHECK (true);

-- Other core tables
CREATE POLICY "allow_all_calibration_model" ON public.calibration_model FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_type_prototypes" ON public.type_prototypes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_kb_definitions" ON public.kb_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_kb_types" ON public.kb_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_country_mapping" ON public.country_mapping FOR ALL USING (true) WITH CHECK (true);

-- Newsletter signups
CREATE POLICY "allow_all_newsletter_signups" ON public.newsletter_signups FOR ALL USING (true) WITH CHECK (true);

-- Users table
CREATE POLICY "allow_all_users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS but with permissive policies (allows everything)
ALTER TABLE IF EXISTS public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assessment_scoring_key ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calibration_model ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fc_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fc_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fc_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kb_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kb_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.type_prototypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.country_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.newsletter_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;