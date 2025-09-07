-- up
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_session_id_key UNIQUE (session_id);

-- down
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_session_id_fkey;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_session_id_key;
