-- Test finalizeAssessment function directly in production
-- This is a read-only verification of current function behavior

-- First, let's verify the current session state
SELECT 
  s.id as session_id,
  s.status,
  s.completed_questions,
  s.share_token,
  s.finalized_at,
  CASE WHEN p.session_id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as profile_status
FROM assessment_sessions s
LEFT JOIN profiles p ON p.session_id = s.id
WHERE s.id = '618c5ea6-aeda-4084-9156-0aac9643afd3';