-- 20250907_recent_assessments_safe_rpc.sql
-- up
CREATE OR REPLACE FUNCTION public.get_recent_assessments_safe()
RETURNS SETOF public.v_recent_assessments_safe_v2
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $func$
  SELECT * FROM public.v_recent_assessments_safe_v2;
$func$;

REVOKE ALL ON FUNCTION public.get_recent_assessments_safe() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recent_assessments_safe() TO anon, authenticated;

-- down
DROP FUNCTION IF EXISTS public.get_recent_assessments_safe();
