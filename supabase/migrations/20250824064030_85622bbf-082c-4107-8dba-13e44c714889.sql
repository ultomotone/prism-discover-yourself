-- Create RPC function for idempotent assessment response saving
create or replace function public.save_assessment_response(
  p_session_id uuid,
  p_question_id int,
  p_answer jsonb,
  p_source text default 'web'
) returns void
language plpgsql
security definer
as $$
begin
  -- Allow only if session exists and is in_progress or completed
  if not exists (
    select 1 from assessment_sessions s
    where s.id = p_session_id and s.status in ('in_progress','completed')
  ) then
    raise exception 'invalid session';
  end if;

  -- Idempotent upsert with proper answer handling
  insert into assessment_responses (
    session_id, 
    question_id, 
    answer_value,
    answer_numeric,
    answer_array,
    answer_object,
    question_text,
    question_type,
    question_section,
    created_at
  )
  select 
    p_session_id,
    p_question_id,
    case 
      when jsonb_typeof(p_answer->'answer_value') = 'string' then p_answer->>'answer_value'
      else null 
    end,
    case 
      when jsonb_typeof(p_answer->'answer_numeric') = 'number' then (p_answer->>'answer_numeric')::integer
      else null 
    end,
    case 
      when jsonb_typeof(p_answer->'answer_array') = 'array' then 
        array(select jsonb_array_elements_text(p_answer->'answer_array'))
      else null 
    end,
    case 
      when jsonb_typeof(p_answer->'answer_object') = 'object' then p_answer->'answer_object'
      else null 
    end,
    coalesce(p_answer->>'question_text', ''),
    coalesce(p_answer->>'question_type', ''),
    coalesce(p_answer->>'question_section', ''),
    now()
  on conflict (session_id, question_id)
  do update set 
    answer_value = excluded.answer_value,
    answer_numeric = excluded.answer_numeric,
    answer_array = excluded.answer_array,
    answer_object = excluded.answer_object,
    updated_at = now();
end $$;

-- Grant proper permissions
revoke all on function public.save_assessment_response(uuid,int,jsonb,text) from anon, authenticated;
grant execute on function public.save_assessment_response(uuid,int,jsonb,text) to anon;