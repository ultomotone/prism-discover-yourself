-- SESSION START/END + DURATION + COMPLETION FLAG + DERIVED STATUS
create or replace view public.v_sessions as
with resp as (
  select
    ar.session_id,
    count(*)                      as response_count,
    min(ar.created_at)            as first_answer_at,
    max(ar.created_at)            as last_answer_at
  from public.assessment_responses ar
  group by ar.session_id
)
select
  s.id                                as session_id,
  coalesce(s.user_id, p.user_id)      as user_id,
  case
    when s.completed_at is not null then 'completed'
    when r.response_count > 0       then 'in_progress'
    else 'started'
  end                                 as status,
  s.started_at,
  s.completed_at,
  extract(epoch from (s.completed_at - s.started_at)) as duration_sec,
  r.response_count,
  r.first_answer_at,
  r.last_answer_at
from public.assessment_sessions s
left join public.profiles p on p.session_id = s.id
left join resp r on r.session_id = s.id;
