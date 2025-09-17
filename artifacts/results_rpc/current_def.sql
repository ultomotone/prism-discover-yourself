-- Current get_results_by_session function definition
CREATE OR REPLACE FUNCTION public.get_results_by_session(session_id uuid, t text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  allowed boolean := false;
  v_profile_id uuid;
  v_profile jsonb;
  v_session jsonb;
begin
  if t is not null then
    select exists (
      select 1
      from public.assessment_sessions s
      join public.profiles p on p.session_id = s.id
      where s.id = session_id
        and p.share_token = t
        -- include expiry predicate here if applicable
    ) into allowed;

    if allowed then
      select p.id into v_profile_id
      from public.profiles p
      where p.session_id = session_id
      limit 1;
    end if;
  else
    select exists (
      select 1
      from public.assessment_sessions s
      where s.id = session_id
        and s.user_id = auth.uid()
    ) into allowed;

    if allowed then
      select p.id into v_profile_id
      from public.profiles p
      where p.session_id = session_id
      limit 1;
    end if;
  end if;

  if not allowed then
    raise no_data_found;
  end if;

  select jsonb_build_object(
    'id', s.id,
    'status', s.status,
    'session_type', s.session_type,
    'started_at', s.started_at,
    'completed_at', s.completed_at,
    'finalized_at', s.finalized_at,
    'total_questions', s.total_questions,
    'completed_questions', s.completed_questions
  ) into v_session
  from public.assessment_sessions s
  where s.id = session_id
  limit 1;

  if v_session is null then
    raise no_data_found;
  end if;

  select jsonb_build_object(
    'id', p.id,
    'session_id', p.session_id,
    'type_code', p.type_code,
    'top_types', p.top_types,
    'strengths', p.strengths,
    'version', p.version,
    'overlay', p.overlay,
    'conf_band', p.conf_band,
    'conf_calibrated', p.conf_calibrated,
    'score_fit_calibrated', p.score_fit_calibrated,
    'created_at', p.created_at
  ) into v_profile
  from public.profiles p
  where p.session_id = session_id
  limit 1;

  if v_profile is null then
    raise no_data_found;
  end if;

  return jsonb_build_object('profile', v_profile, 'session', v_session);
end;
$function$