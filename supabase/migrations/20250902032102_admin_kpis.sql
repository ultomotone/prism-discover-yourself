-- Timezone helper: work in ET for business logic
-- Use AT TIME ZONE so predicates match ET “last 30 days”
create or replace view admin_base_last_30d as
select
  s.id as session_id,
  s.user_id,
  s.device,
  s.status,
  (s.started_at  at time zone 'UTC') at time zone 'America/New_York' as started_at_et,
  (s.completed_at at time zone 'UTC') at time zone 'America/New_York' as completed_at_et,
  extract(epoch from (s.completed_at - s.started_at)) as duration_sec,
  p.validity_pass,
  jsonb_extract_path_text(p.fit_explainer, 'metrics', 'p1')::numeric        as top1_fit,
  jsonb_extract_path_text(p.fit_explainer, 'metrics', 'gap_to_second')::numeric as top_gap,
  jsonb_extract_path_text(p.fit_explainer, 'metrics', 'confidence_margin')::numeric as confidence_margin,
  jsonb_extract_path_text(p.validity, 'inconsistency')::numeric             as inconsistency_mean,
  jsonb_extract_path_text(p.validity, 'sd_index')::numeric                  as sd_index,
  nullif(trim(p.overlay_label), '') as overlay_label,
  p.primary_type
from assessment_sessions s
left join profiles p on p.session_id = s.id
where (s.started_at at time zone 'America/New_York') >= (now() at time zone 'America/New_York') - interval '30 days';

create or replace view admin_kpis_last_30d as
with base as (select * from admin_base_last_30d),
dupes as (
  select session_id, user_id,
         row_number() over (partition by user_id order by started_at_et) as rn
  from base
)
select
  count(*) filter (where completed_at_et is not null)                                        as completions,
  round(100.0 * count(*) filter (where completed_at_et is not null) / nullif(count(*),0),1) as completion_rate_pct,
  round(percentile_cont(0.5) within group (order by duration_sec) / 60.0, 1)                as median_duration_min,
  round(100.0 * count(*) filter (where completed_at_et is not null and duration_sec <  12*60)
        / nullif(count(*) filter (where completed_at_et is not null),0), 1)                 as speeders_pct,
  round(100.0 * count(*) filter (where completed_at_et is not null and duration_sec >  60*60)
        / nullif(count(*) filter (where completed_at_et is not null),0), 1)                 as stallers_pct,
  round(100.0 * count(*) filter (where rn > 1) / nullif(count(*),0), 1)                     as duplicates_pct,
  round(100.0 * avg(case when validity_pass is true then 1 else 0 end),1)                   as validity_pass_rate_pct,
  round(percentile_cont(0.5) within group (order by top1_fit)       ,1)                      as top1_fit_median,
  round(percentile_cont(0.5) within group (order by top_gap)        ,1)                      as top_gap_median,
  round(percentile_cont(0.5) within group (order by confidence_margin),1)                    as confidence_margin_median,
  round(100.0 * count(*) filter (where top_gap < 3) / nullif(count(*),0),1)                 as close_calls_pct,
  round(avg(inconsistency_mean),2)                                                           as inconsistency_mean,
  round(avg(sd_index),2)                                                                     as sd_index_mean
from base
left join dupes using (session_id);

create or replace view admin_confidence_dist_last_30d as
with base as (select * from admin_base_last_30d)
select bucket, count(*) as n
from (
  select case
           when confidence_margin is null then 'Unknown'
           when confidence_margin >= 20 then 'High'
           when confidence_margin >= 10 then 'Moderate'
           else 'Low'
         end as bucket
  from base
) b
group by bucket
order by n desc;

create or replace view admin_overlay_dist_last_30d as
with base as (select * from admin_base_last_30d)
select coalesce(overlay_label, '–') as overlay, count(*) as n
from base
group by 1
order by n desc;

create or replace view admin_throughput_last_14d as
with base as (
  select * from admin_base_last_30d
  where completed_at_et >= (now() at time zone 'America/New_York') - interval '14 days'
    and completed_at_et is not null
)
select to_char(date_trunc('day', completed_at_et)::date, 'MM/DD') as day_label,
       count(*) as completions
from base
group by 1
order by min(date_trunc('day', completed_at_et));

create or replace view admin_latest_assessments as
with base as (
  select * from admin_base_last_30d where completed_at_et is not null
)
select session_id, user_id, top1_fit, top_gap, confidence_margin, overlay_label, completed_at_et
from base
order by completed_at_et desc
limit 25;

-- Optional type dist if you have a column
create or replace view admin_type_dist_last_30d as
with base as (select * from admin_base_last_30d)
select coalesce(nullif(primary_type,''), 'Unknown') as primary_type, count(*) as n
from base
group by 1
order by n desc;
