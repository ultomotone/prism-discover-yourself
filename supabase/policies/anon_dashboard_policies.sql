-- Example: allow SELECT on safe views for anon
grant usage on schema public to anon;
grant select on public.v_latest_assessments_v11, public.v_kpi_overview_30d_v11, public.v_recent_assessments_safe to anon;
grant execute on function public.get_recent_assessments_safe() to anon;

-- If you have RLS ON views (rare), use SECURITY INVOKER functions instead; but views above should be safe.
