-- Fix newsletter_signups table to prevent email harvesting
-- Drop the insecure policies that allow public read/write access
drop policy if exists "pub_read_newsletter" on public.newsletter_signups;
drop policy if exists "pub_write_newsletter" on public.newsletter_signups;

-- Allow anonymous users to INSERT their own email (for newsletter signup)
-- but prevent them from reading or modifying existing entries
create policy "allow_insert_newsletter"
  on public.newsletter_signups
  for insert
  to anon, authenticated
  with check (true);

-- Only service role (edge functions) can read/update/delete newsletter entries
create policy "service_role_full_access_newsletter"
  on public.newsletter_signups
  for all
  to public
  using (
    ((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'
  )
  with check (
    ((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'
  );

-- This prevents:
-- 1. Anyone from reading the email list (no more email harvesting)
-- 2. Users from modifying/deleting newsletter signups
-- 3. While still allowing new signups via INSERT