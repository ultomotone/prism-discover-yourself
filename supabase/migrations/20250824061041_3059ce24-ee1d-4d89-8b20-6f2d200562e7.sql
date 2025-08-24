-- Delete test session and all associated data
-- First delete profiles
DELETE FROM profiles WHERE session_id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Delete assessment responses  
DELETE FROM assessment_responses WHERE session_id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Delete the session itself
DELETE FROM assessment_sessions WHERE id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Enable real-time for key tables (skip if already exists)
DO $$
BEGIN
    -- Set replica identity for tables
    ALTER TABLE profiles REPLICA IDENTITY FULL;
    ALTER TABLE assessment_sessions REPLICA IDENTITY FULL; 
    ALTER TABLE dashboard_statistics REPLICA IDENTITY FULL;
EXCEPTION WHEN others THEN
    -- Continue if already set
    NULL;
END $$;

-- Add tables to realtime publication (only if not already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE assessment_sessions;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_statistics;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;