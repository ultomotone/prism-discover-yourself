-- Add unique constraint for upsert in psychometrics_retest_pairs
-- This allows ON CONFLICT to work properly in compute-retest edge function

-- Drop existing primary key if it exists
ALTER TABLE psychometrics_retest_pairs DROP CONSTRAINT IF EXISTS psychometrics_retest_pairs_pkey;

-- Add composite primary key on the combination that makes each record unique
ALTER TABLE psychometrics_retest_pairs 
  ADD PRIMARY KEY (user_id, first_session_id, second_session_id, scale_code);