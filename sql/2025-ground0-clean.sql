-- Views: re-provision minimal, PII-safe
drop view if exists public.v_latest_assessments_v11 cascade;
create view public.v_latest_assessments_v11 as
select
  p.created_at as when_ts,
  p.type_code,
  coalesce(p.overlay_neuro, p.overlay) as overlay, -- legacy alias
  p.overlay_state,
  p.score_fit_calibrated as fit_value,
  (p.type_scores->(p.top_types->>0)->>'share_pct')::numeric as share_pct,
  p.fit_band,
  p.results_version as version,
  coalesce(ar_country.answer_value, '—') as country,
  p.session_id
from public.profiles p
left join lateral (
  select answer_value
  from public.assessment_responses r
  where r.session_id = p.session_id
    and (r.question_id::text = 'country' or r.question_id::text ilike '%country%')
  order by r.created_at desc
  limit 1
) as ar_country on true
where coalesce(p.results_version,'v1.1') like 'v1.%'
order by when_ts desc;

drop view if exists public.v_kpi_overview_30d_v11 cascade;
create view public.v_kpi_overview_30d_v11 as
with w as (
  select *
  from public.profiles
  where created_at >= now() - interval '30 days'
    and coalesce(results_version,'v1.1') like 'v1.%'
)
select
  count(*)::int as assessments_30d,
  avg(score_fit_calibrated)::numeric(5,2) as avg_fit_score,
  100.0*avg((confidence in ('High','Moderate'))::int)::numeric / nullif(count(*),0) as hi_mod_conf_pct,
  100.0*avg((fit_band='High')::int)::numeric / nullif(count(*),0) as high_band_pct,
  100.0*avg((fit_band='Low')::int)::numeric / nullif(count(*),0) as low_band_pct
from w;

-- Traits/overlays defaults (idempotent)
insert into public.scoring_config(key, value) values
('neuro_norms', '{"mean":3,"sd":1}'),
('overlay_neuro_cut', '0.50'),
('overlay_state_weights', '{"stress":0.35,"time":0.25,"sleep":-0.20,"focus":-0.20}')
on conflict (key) do update set value=excluded.value;

-- Grants/RLS for anon
revoke all on schema public from anon;
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

grant usage on schema public to anon;
grant select on public.v_latest_assessments_v11, public.v_kpi_overview_30d_v11 to anon;

alter view public.v_latest_assessments_v11 set (security_invoker = true);
alter view public.v_kpi_overview_30d_v11 set (security_invoker = true);

drop policy if exists anon_select_latest on public.v_latest_assessments_v11;
create policy anon_select_latest on public.v_latest_assessments_v11
  for select using (true);

drop policy if exists anon_select_kpi on public.v_kpi_overview_30d_v11;
create policy anon_select_kpi on public.v_kpi_overview_30d_v11
  for select using (true);
