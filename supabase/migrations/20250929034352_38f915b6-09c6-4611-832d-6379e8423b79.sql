-- Update the retake allowance function to enforce 30-day restriction
CREATE OR REPLACE FUNCTION public.can_start_new_session(p_user uuid, p_email text, p_max_per_window integer DEFAULT 1, p_window_days integer DEFAULT 30)
RETURNS TABLE(allowed boolean, recent_count integer, next_eligible_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  cnt int := 0;
  last_completed timestamptz;
begin
  -- Check for completed assessments in the last 30 days
  if p_user is not null then
    select count(*)::int, max(completed_at) into cnt, last_completed
    from public.assessment_sessions
    where user_id = p_user
      and status = 'completed'
      and completed_at >= now() - make_interval(days => p_window_days);
  elsif p_email is not null then
    select count(*)::int, max(completed_at) into cnt, last_completed
    from public.assessment_sessions
    where email = p_email
      and status = 'completed'
      and completed_at >= now() - make_interval(days => p_window_days);
  else
    -- No identifier → allow (client should avoid calling without at least one)
    return query select true, 0, null::timestamptz;
    return;
  end if;

  if cnt < p_max_per_window then
    return query select true, cnt, null::timestamptz;
  else
    -- Next eligible = 30 days from last completion
    return query select false, cnt, last_completed + make_interval(days => p_window_days);
  end if;
end;
$$;