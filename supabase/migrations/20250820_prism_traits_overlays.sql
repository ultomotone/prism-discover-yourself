-- Profiles: add trait + overlay fields
alter table public.profiles
  add column if not exists neuro_mean numeric,
  add column if not exists neuro_z numeric,
  add column if not exists overlay_neuro text check (overlay_neuro in ('+','–','0')),
  add column if not exists overlay_state text check (overlay_state in ('+','–','0')),
  add column if not exists state_index numeric,
  add column if not exists trait_scores jsonb;

-- Back-compat alias: keep 'overlay' column but treat as overlay_neuro at the app layer.

-- Views: expose new fields
drop view if exists public.v_latest_assessments_v11 cascade;
create view public.v_latest_assessments_v11 as
select
  p.created_at as when_ts,
  p.type_code,
  p.overlay_neuro as overlay,        -- legacy alias
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
  where r.session_id = p.session_id and r.question_id::text = 'country'
  order by r.created_at desc
  limit 1
) as ar_country on true
where coalesce(p.results_version,'v1.1') like 'v1.%'
order by when_ts desc;

drop view if exists public.v_profiles_ext cascade;
create view public.v_profiles_ext as
select
  p.*,
  coalesce(p.overlay_neuro, p.overlay) as overlay_compat
from public.profiles p;

-- KPI overview (30d)
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
  100.0*avg((confidence='High')::int + (confidence='Moderate')::int)::numeric / nullif(count(*),0) as hi_mod_conf_pct,
  100.0*avg((confidence='High')::int)::numeric / nullif(count(*),0) as high_conf_pct,
  100.0*avg((fit_band='High')::int)::numeric / nullif(count(*),0) as high_band_pct,
  100.0*avg((fit_band='Low')::int)::numeric / nullif(count(*),0) as low_band_pct,
  100.0*avg((overlay_state='+' )::int)::numeric / nullif(count(*),0) as pct_state_plus
from w;

-- RLS: allow anon SELECT on safe views
grant select on public.v_latest_assessments_v11, public.v_kpi_overview_30d_v11, public.v_profiles_ext
  to anon, authenticated;

-- If you enforce RLS on tables, ensure views don’t expose PII.
