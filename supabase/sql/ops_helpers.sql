-- Helper: count v2 completeness per session
create or replace function public.v2_completeness(p_session uuid)
returns table(types int, functions int, state int)
language sql stable as $$
  select
    (select count(*) from public.scoring_results_types     t where t.session_id = p_session and t.results_version = 'v2')::int as types,
    (select count(*) from public.scoring_results_functions f where f.session_id = p_session and f.results_version = 'v2')::int as functions,
    (select count(*) from public.scoring_results_state     s where s.session_id = p_session and s.results_version = 'v2')::int as state
$$;

-- Helper: sessions missing v2 rows or with placeholder zeros in last N days
create or replace function public.find_broken_sessions_sql(p_days int, p_limit int)
returns table(session_id uuid)
language sql stable as $$
  with recent as (
    select id as session_id
    from public.assessment_sessions
    where status = 'completed'
      and completed_at >= now() - (p_days || ' days')::interval
  ),
  comp as (
    select r.session_id,
      (select count(*) from public.scoring_results_types     t where t.session_id=r.session_id and t.results_version='v2') as types_ct,
      (select count(*) from public.scoring_results_functions f where f.session_id=r.session_id and f.results_version='v2') as funcs_ct,
      (select count(*) from public.scoring_results_state     s where s.session_id=r.session_id and s.results_version='v2') as state_ct
    from recent r
  )
  select session_id
  from comp
  where (types_ct <> 16 or funcs_ct <> 8 or state_ct < 1)
  limit p_limit
$$;

-- Helper: find completed sessions with no responses in last N days
create or replace function public.sessions_with_no_responses(p_days int, p_limit int)
returns table(session_id uuid)
language sql stable as $$
  select s.id as session_id
  from public.assessment_sessions s
  left join lateral (
    select 1 from public.assessment_responses r
    where r.session_id = s.id
    limit 1
  ) r1 on true
  where s.status='completed'
    and s.completed_at >= now() - (p_days || ' days')::interval
    and r1 is null
  limit p_limit
$$;

-- Permissions (adjust RLS/policy to your setup)
grant execute on function public.v2_completeness(uuid) to anon, authenticated, service_role;
grant execute on function public.find_broken_sessions_sql(int, int) to service_role;
grant execute on function public.sessions_with_no_responses(int, int) to service_role;
