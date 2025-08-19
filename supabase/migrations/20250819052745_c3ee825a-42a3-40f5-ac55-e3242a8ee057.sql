-- 1) Remove duplicate profiles per session_id, keep most recent
WITH ranked AS (
  SELECT id, session_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC) AS rn
  FROM profiles
)
DELETE FROM profiles p
USING ranked r
WHERE p.id = r.id AND r.rn > 1;

-- 2) Enforce uniqueness on profiles.session_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'uq_profiles_session_id'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uq_profiles_session_id ON public.profiles (session_id)';
  END IF;
END$$;
