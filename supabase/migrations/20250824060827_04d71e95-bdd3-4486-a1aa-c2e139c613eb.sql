-- Delete test session and all associated data
-- First delete profiles
DELETE FROM profiles WHERE session_id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Delete assessment responses
DELETE FROM assessment_responses WHERE session_id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Delete the session itself
DELETE FROM assessment_sessions WHERE id = 'c6970644-8b35-4128-b5c4-53dd292141a9';

-- Enable real-time for key tables used in dashboard and admin
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE assessment_sessions REPLICA IDENTITY FULL;
ALTER TABLE assessment_responses REPLICA IDENTITY FULL;
ALTER TABLE dashboard_statistics REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE assessment_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE assessment_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_statistics;