drop policy if exists anon_select_latest on public.v_latest_assessments_v11;
drop policy if exists anon_select_kpi on public.v_kpi_overview_30d_v11;
drop view if exists public.v_latest_assessments_v11 cascade;
drop view if exists public.v_kpi_overview_30d_v11 cascade;
