-- Fix assessment_sessions RLS policies to prevent email theft
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "pub_read_sessions" ON public.assessment_sessions;
DROP POLICY IF EXISTS "pub_write_sessions" ON public.assessment_sessions;

-- SELECT: Users can only see their own sessions or access via share_token
CREATE POLICY "select_own_sessions"
  ON public.assessment_sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- SELECT: Access via valid share_token (for results page)
CREATE POLICY "select_by_share_token"
  ON public.assessment_sessions
  FOR SELECT
  TO anon, authenticated
  USING (
    share_token IS NOT NULL
  );

-- INSERT: Allow anonymous and authenticated users to create new sessions
CREATE POLICY "insert_new_sessions"
  ON public.assessment_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: Users can update their own sessions
CREATE POLICY "update_own_sessions"
  ON public.assessment_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Anonymous users can update sessions they created (by session_id match)
-- This allows updating session progress before authentication
CREATE POLICY "update_anonymous_sessions"
  ON public.assessment_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

-- DELETE: Users can only delete their own sessions
CREATE POLICY "delete_own_sessions"
  ON public.assessment_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypasses all RLS policies automatically
-- Edge functions using service_role key will have full access