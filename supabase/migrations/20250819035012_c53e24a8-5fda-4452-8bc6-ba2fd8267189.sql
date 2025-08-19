-- Remove public read access to sensitive profiles data
-- Keep user-specific access policies intact
DROP POLICY IF EXISTS "Public can view profiles for dashboard statistics" ON public.profiles;

-- No further changes; INSERT/UPDATE/SELECT (own) policies remain
