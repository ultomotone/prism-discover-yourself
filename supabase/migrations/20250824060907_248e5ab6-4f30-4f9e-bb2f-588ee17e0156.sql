-- Delete test session and all associated data (retry in case previous didn't complete)
-- First delete profiles
DELETE FROM profiles WHERE session_id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Delete assessment responses  
DELETE FROM assessment_responses WHERE session_id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Delete the session itself
DELETE FROM assessment_sessions WHERE id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Enable real-time for key tables (skip assessment_responses since it's already added)
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE assessment_sessions REPLICA IDENTITY FULL; 
ALTER TABLE dashboard_statistics REPLICA IDENTITY FULL;

-- Add tables to realtime publication (skip assessment_responses)
DO $$
BEGIN
  -- Only add if not already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'assessment_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE assessment_sessions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'dashboard_statistics'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_statistics;
  END IF;
END $$;