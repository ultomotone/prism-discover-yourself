create or replace view public.v_sessions as
select
  r.session_id,
  coalesce(p.user_id, s.user_id) as user_id,
  min(r.created_at) as started_at,
  max(r.created_at) as last_event_at,
  extract(epoch from (max(r.created_at) - min(r.created_at)))::int as duration_sec,
  exists (select 1 from public.profiles p2 where p2.session_id = r.session_id) as completed
from public.assessment_responses r
left join public.profiles p on p.session_id = r.session_id
left join public.assessment_sessions s on s.id = r.session_id
group by r.session_id, coalesce(p.user_id, s.user_id);
