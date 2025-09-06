-- SESSION START/END + COMPLETION FLAG
create or replace view public.v_sessions as
select
  s.id as session_id,
  coalesce(p.user_id, s.user_id) as user_id,
  s.started_at,
  s.completed_at,
  (s.completed_at is not null) as completed
from public.assessment_sessions s
left join public.profiles p on p.session_id = s.id
group by s.id, coalesce(p.user_id, s.user_id), s.started_at, s.completed_at;
