-- Fix the get_results_by_session RPC function to handle errors properly
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
  -- Check permissions based on share token or ownership
  if get_results_by_session.t is not null then
    select exists (
      select 1
      from public.assessment_sessions s
      join public.profiles p on p.session_id = s.id
      where s.id = get_results_by_session.session_id
        and s.share_token = get_results_by_session.t
        and s.status = 'completed'
    ) into allowed;
  else
    select exists (
      select 1
      from public.assessment_sessions s
      where s.id = get_results_by_session.session_id
        and s.user_id = auth.uid()
        and s.status = 'completed'
    ) into allowed;
  end if;

  if not allowed then
    return jsonb_build_object(
      'error', 'Access denied or session not found',
      'code', 'ACCESS_DENIED'
    );
  end if;

  -- Get session data
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
  where s.id = get_results_by_session.session_id
  limit 1;

  if v_session is null then
    return jsonb_build_object(
      'error', 'Session not found',
      'code', 'SESSION_NOT_FOUND'
    );
  end if;

  -- Get profile data
  select jsonb_build_object(
    'id', p.id,
    'session_id', p.session_id,
    'type_code', p.type_code,
    'version', p.version,
    'overlay', p.overlay,
    'conf_calibrated', p.conf_calibrated,
    'score_fit_calibrated', p.score_fit_calibrated,
    'created_at', p.created_at,
    'top_types', p.top_types,
    'confidence', p.confidence,
    'fit_band', p.fit_band
  ) into v_profile
  from public.profiles p
  where p.session_id = get_results_by_session.session_id
  limit 1;

  if v_profile is null then
    return jsonb_build_object(
      'error', 'Profile not found - session may need to be rescored',
      'code', 'PROFILE_NOT_FOUND',
      'session', v_session
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'profile', v_profile, 
    'session', v_session
  );
exception
  when others then
    return jsonb_build_object(
      'error', SQLERRM,
      'code', 'INTERNAL_ERROR'
    );
end;
$function$;