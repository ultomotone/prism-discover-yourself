-- up
create or replace function public.find_broken_sessions_sql(p_days int default 365, p_limit int default 200)
returns table(session_id uuid)
language sql
as $$
  with recent as (
    select s.id as session_id
    from public.assessment_sessions s
    where s.started_at >= now() - (p_days || ' days')::interval
  ),
  t as (
    select session_id, count(*) as type_ct,
           round(avg(share)::numeric, 2) as avg_share,
           min(fit) as min_fit, max(fit) as max_fit
    from public.scoring_results_types
    where results_version = 'v2' and session_id in (select session_id from recent)
    group by session_id
  ),
  f as (
    select session_id, count(*) as func_ct
    from public.scoring_results_functions
    where results_version = 'v2' and session_id in (select session_id from recent)
    group by session_id
  ),
  st as (
    select session_id, count(*) as state_ct
    from public.scoring_results_state
    where results_version = 'v2' and session_id in (select session_id from recent)
    group by session_id
  ),
  broken as (
    select r.session_id
    from recent r
    left join t on t.session_id = r.session_id
    left join f on f.session_id = r.session_id
    left join st on st.session_id = r.session_id
    where
      coalesce(t.type_ct, 0) < 16
      or coalesce(f.func_ct, 0) < 8
      or coalesce(st.state_ct, 0) < 1
      or (t.type_ct = 16 and abs(t.avg_share - 6.25) < 0.1)
      or (t.type_ct = 16 and t.min_fit = t.max_fit)
  )
  select session_id from broken limit p_limit;
$$;

-- down
drop function if exists public.find_broken_sessions_sql(int, int);
