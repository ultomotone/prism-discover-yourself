-- 1) Add share_token to assessment_sessions with backfill and constraint
ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS share_token text;

-- Backfill existing rows
UPDATE public.assessment_sessions 
SET share_token = gen_random_uuid()::text 
WHERE share_token IS NULL;

-- Enforce NOT NULL going forward
ALTER TABLE public.assessment_sessions 
ALTER COLUMN share_token SET NOT NULL;

-- Optional: ensure tokens are unique for security
CREATE UNIQUE INDEX IF NOT EXISTS idx_assessment_sessions_share_token 
ON public.assessment_sessions(share_token);

-- 2) Remove overly permissive anonymous SELECT policy on profiles
DROP POLICY IF EXISTS "Anonymous can view profiles by session" ON public.profiles;

-- 3) Secure RPC to fetch a profile by session with token validation
CREATE OR REPLACE FUNCTION public.get_profile_by_session(
  p_session_id uuid,
  p_share_token text
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  result public.profiles%ROWTYPE;
BEGIN
  SELECT p.* INTO result
  FROM public.profiles p
  JOIN public.assessment_sessions s 
    ON s.id = p.session_id
  WHERE p.session_id = p_session_id
    AND s.share_token = p_share_token
    AND s.status = 'completed'
  LIMIT 1;

  RETURN result;
END;
$$;