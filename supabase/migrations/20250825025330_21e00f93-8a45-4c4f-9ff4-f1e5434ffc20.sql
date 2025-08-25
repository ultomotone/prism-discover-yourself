-- Create view for incomplete sessions to fix 400 error
create or replace view public.v_incomplete_sessions as
select
  id,
  created_at,
  user_id,
  email,
  completed_at,
  completed_questions,
  total_questions,
  status
from public.assessment_sessions
where status = 'in_progress'
   and completed_questions > 0;

-- Make it readable like other analytics views
grant select on public.v_incomplete_sessions to anon, authenticated;