-- up
BEGIN;

ALTER TABLE public.assessment_sessions
  ADD COLUMN IF NOT EXISTS share_token_expires_at timestamptz;
UPDATE public.assessment_sessions
  SET share_token_expires_at = COALESCE(share_token_expires_at, now() + interval '30 days');

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fc_source text;

CREATE OR REPLACE FUNCTION public.get_results_by_session(p_session_id uuid, t text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  headers jsonb := coalesce(current_setting('request.headers', true)::jsonb, '{}'::jsonb);
  ip text := headers->>'x-forwarded-for';
  ua text := headers->>'user-agent';
  p public.profiles%rowtype;
  s public.assessment_sessions%rowtype;
  ok boolean;
  token_hash text := encode(digest(coalesce(t,''), 'sha256'), 'hex');
BEGIN
  SELECT p.*, s.* INTO p, s
  FROM public.profiles p
  JOIN public.assessment_sessions s ON s.id = p.session_id
  WHERE s.id = p_session_id
    AND (
      (t IS NOT NULL AND p.share_token = t AND s.share_token_expires_at > now()) OR
      (t IS NULL AND auth.uid() = s.user_id)
    );
  ok := FOUND;
  INSERT INTO public.results_token_access_logs(profile_id, session_id, token_hash, success, ip, ua)
    VALUES (p.id, p_session_id, token_hash, ok, ip, ua);
  IF ok THEN
    RETURN jsonb_build_object('profile', to_jsonb(p), 'session', jsonb_build_object('id', s.id, 'status', s.status));
  END IF;
  RETURN NULL;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_results_by_session(uuid, text) TO anon, authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_owner_select ON public.profiles FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sessions_token_read ON public.assessment_sessions;
CREATE POLICY sessions_owner_select ON public.assessment_sessions FOR SELECT USING (auth.uid() = user_id);

COMMIT;

-- down
BEGIN;
DROP POLICY IF EXISTS sessions_owner_select ON public.assessment_sessions;
DROP POLICY IF EXISTS profiles_owner_select ON public.profiles;
ALTER TABLE public.assessment_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
REVOKE EXECUTE ON FUNCTION public.get_results_by_session(uuid, text) FROM anon, authenticated;
DROP FUNCTION IF EXISTS public.get_results_by_session(uuid, text);
ALTER TABLE public.profiles DROP COLUMN IF EXISTS fc_source;
ALTER TABLE public.assessment_sessions DROP COLUMN IF EXISTS share_token_expires_at;
COMMIT;
