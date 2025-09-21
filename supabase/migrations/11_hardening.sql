-- 11_hardening.sql
set search_path = public;

-- Ownership (adjust owner role if needed)
alter function public.get_profile_by_session(uuid, text) owner to postgres;
-- add others as applicable:
-- alter function public.get_results_v2(uuid, text) owner to postgres;

-- Revoke table access for anon (only RPC/view access via RLS)
revoke all on public.profiles from anon;
revoke all on public.assessment_sessions from anon;

-- Confirm anon has EXECUTE only on blessed functions (example)
-- grant execute on function public.get_profile_by_session(uuid, text) to anon;

-- Optional: pg_cron weekly analyze
-- select cron.schedule('weekly_analyze', 'UTC', 'SUN 03:15', $$ANALYZE public.assessment_sessions; ANALYZE public.profiles;$$);
