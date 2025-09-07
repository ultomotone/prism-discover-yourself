-- up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_session_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_session_id_fkey
      FOREIGN KEY (session_id)
      REFERENCES public.assessment_sessions(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_session_id_key'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_session_id_key UNIQUE (session_id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_session_q ON public.assessment_responses (session_id, question_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON public.assessment_sessions (user_id, status);

-- down
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_session_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_session_id_key;
DROP INDEX IF EXISTS idx_profiles_created_at;
DROP INDEX IF EXISTS idx_responses_session_q;
DROP INDEX IF EXISTS idx_sessions_user_status;
