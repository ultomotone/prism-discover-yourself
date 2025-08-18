-- Add columns to profiles for retest tracking
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS person_key text,             -- hashed email (normalized)
  ADD COLUMN IF NOT EXISTS email_mask text,             -- "d***@domain.com" for UI
  ADD COLUMN IF NOT EXISTS run_index int,               -- 1 = first test, 2 = retest, ...
  ADD COLUMN IF NOT EXISTS prev_session_id text,        -- previous run (if any)
  ADD COLUMN IF NOT EXISTS baseline_session_id text,    -- the very first run
  ADD COLUMN IF NOT EXISTS deltas jsonb;                -- diffs vs previous: strengths/dims/overlay/type

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_person_key ON profiles(person_key, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Store configuration for email question ID and hash salt
INSERT INTO scoring_config(key, value) VALUES
('dashboard_email_qid', jsonb_build_object('id', 1)),
('dashboard_country_qid', jsonb_build_object('id', 123)),
('hash_salt', jsonb_build_object('value', 'PRISM_RETEST_SALT_2025_CHANGE_ME_IN_PRODUCTION')),
('state_qids', jsonb_build_object(
  'stress', 201,
  'mood', 202, 
  'sleep', 203,
  'time', 204,
  'focus', 205
))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;