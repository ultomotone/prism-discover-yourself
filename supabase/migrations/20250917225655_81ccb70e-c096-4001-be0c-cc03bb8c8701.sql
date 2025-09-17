-- Performance indexes for auto-finalize system
CREATE INDEX IF NOT EXISTS idx_responses_sess_qid_updated
ON assessment_responses(session_id, question_id, COALESCE(updated_at, created_at) DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_248_email
ON assessment_sessions(completed_questions)
WHERE completed_questions >= 248 AND COALESCE(email,'') <> '';

-- Set base URL for SQL helper functions
SELECT set_config('app.results_base_url','https://prispersonality.com', true);