-- Drop the overly permissive policy that allows public read access
-- This policy was allowing anyone to read all sessions (including emails) 
-- just because share_token is not null (which is always true since it has a default)
drop policy if exists "select_by_share_token" on public.assessment_sessions;

-- Keep the secure policy that only allows users to see their own sessions
-- The select_own_sessions policy remains: (auth.uid() = user_id)

-- Note: Edge functions using service_role will still have full access to query sessions
-- Anonymous users will need to track their session_id in local storage and use 
-- edge functions (with service_role) when they need to retrieve session data