-- Drop the insecure policy that allows anyone to read all profiles
drop policy if exists "read_profiles" on public.profiles;

-- Create secure policy: authenticated users can only see profiles from their own sessions
create policy "select_own_profiles"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.assessment_sessions
      where assessment_sessions.id = profiles.session_id
        and assessment_sessions.user_id = auth.uid()
    )
  );

-- Keep the service_role policy for edge functions
-- (write_profiles_sr already exists and handles all operations for service role)

-- Note: Anonymous users will need to use edge functions (with service_role)
-- to access their results via share tokens. Direct database access is now restricted.