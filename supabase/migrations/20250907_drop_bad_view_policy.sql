-- 20250907_drop_bad_view_policy.sql
-- up
DROP POLICY IF EXISTS "Recent assessments safe view is publicly readable" ON public.v_recent_assessments_safe;
GRANT SELECT ON public.v_recent_assessments_safe_v2 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_assessments_safe() TO anon, authenticated;

-- down
REVOKE EXECUTE ON FUNCTION public.get_recent_assessments_safe() FROM anon, authenticated;
REVOKE SELECT ON public.v_recent_assessments_safe_v2 FROM anon, authenticated;
