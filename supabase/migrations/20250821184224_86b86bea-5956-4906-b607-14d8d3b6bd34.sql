-- Create a test session at question 247 for testing the completion flow
INSERT INTO assessment_sessions (
  id,
  completed_questions,
  total_questions,
  status,
  share_token,
  created_at
) VALUES (
  'test-247-session-' || gen_random_uuid()::text,
  247,
  248,
  'in_progress',
  gen_random_uuid(),
  now()
) RETURNING id, share_token;