-- SESSION START/END + COMPLETION FLAG
create or replace view public.v_sessions as
select
  s.id as session_id,
  s.user_id,
  s.started_at,
  s.completed_at,
  (s.completed_at is not null) as completed
from public.assessment_sessions s;
