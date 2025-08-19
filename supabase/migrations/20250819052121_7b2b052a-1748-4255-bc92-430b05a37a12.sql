-- Add session classification fields to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS session_kind text CHECK (session_kind IN ('initial','redo','retest')) DEFAULT 'initial',
  ADD COLUMN IF NOT EXISTS parent_session_id uuid,
  ADD COLUMN IF NOT EXISTS gap_minutes int,
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS ua_hash text;

-- Update assessment_sessions table structure
ALTER TABLE assessment_sessions
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('in_progress','completed','abandoned')) DEFAULT 'in_progress',
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS ua_hash text;

-- Ensure only one active session per email
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_session_per_email
  ON assessment_sessions (email)
  WHERE status = 'in_progress';

-- Create view for chronological session analysis  
CREATE OR REPLACE VIEW v_user_sessions_chrono AS
SELECT
  email,
  user_id,
  id AS session_id,
  started_at,
  LAG(id) OVER (PARTITION BY email ORDER BY started_at) AS prev_session_id,
  EXTRACT(epoch FROM (started_at - LAG(started_at) OVER (PARTITION BY email ORDER BY started_at))) / 60.0 AS gap_minutes
FROM assessment_sessions
WHERE status = 'completed'
ORDER BY email, started_at;

-- Create function to check for recent completions
CREATE OR REPLACE FUNCTION check_recent_completion(user_email text, threshold_days int DEFAULT 30)
RETURNS TABLE(
  has_recent_completion boolean,
  last_completion_date timestamptz,
  days_since_completion numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN last_completed.started_at IS NOT NULL 
         AND last_completed.started_at > (NOW() - INTERVAL '1 day' * threshold_days)
         THEN true 
         ELSE false 
    END as has_recent_completion,
    last_completed.started_at as last_completion_date,
    EXTRACT(epoch FROM (NOW() - last_completed.started_at)) / 86400.0 as days_since_completion
  FROM (
    SELECT started_at
    FROM assessment_sessions 
    WHERE email = user_email 
      AND status = 'completed'
    ORDER BY started_at DESC 
    LIMIT 1
  ) last_completed;
END;
$$ LANGUAGE plpgsql STABLE;