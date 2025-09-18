-- Fix RLS on profiles and align scoring config
BEGIN;

-- 1) Ensure RLS is ON for profiles and allow service-role to manage rows
-- Keep RLS on (no-op if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Service-role policy: allow all actions from Edge Functions using the service role
DROP POLICY IF EXISTS "svc_manage_profiles" ON public.profiles;

CREATE POLICY "svc_manage_profiles"
ON public.profiles
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2) Align scoring results version
UPDATE public.scoring_config
SET value = '"v1.2.1"'::jsonb
WHERE key = 'results_version' 
AND value IS DISTINCT FROM '"v1.2.1"'::jsonb;

-- Insert if doesn't exist
INSERT INTO public.scoring_config (key, value)
SELECT 'results_version', '"v1.2.1"'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.scoring_config WHERE key = 'results_version'
);

COMMIT;