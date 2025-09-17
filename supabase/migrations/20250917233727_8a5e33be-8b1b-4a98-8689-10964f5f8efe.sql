-- Create RPC function to securely fetch user sessions with profiles for dashboard
CREATE OR REPLACE FUNCTION public.get_user_sessions_with_profiles(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_sessions jsonb;
begin
  -- Check if the user is requesting their own sessions
  if p_user_id != auth.uid() then
    return jsonb_build_object(
      'error', 'Access denied - can only view your own sessions',
      'code', 'ACCESS_DENIED'
    );
  end if;

  -- Fetch sessions with associated profiles
  select jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'status', s.status,
      'started_at', s.started_at,
      'completed_at', s.completed_at,
      'completed_questions', s.completed_questions,
      'total_questions', s.total_questions,
      'profile', case 
        when p.session_id is not null then 
          jsonb_build_object(
            'type_code', p.type_code,
            'confidence', p.confidence,
            'fit_band', p.fit_band,
            'overlay', p.overlay
          )
        else null
      end
    ) order by s.started_at desc
  ) into v_sessions
  from public.assessment_sessions s
  left join public.profiles p on p.session_id = s.id
  where s.user_id = p_user_id;

  return jsonb_build_object(
    'success', true,
    'sessions', coalesce(v_sessions, '[]'::jsonb)
  );
exception
  when others then
    return jsonb_build_object(
      'error', SQLERRM,
      'code', 'INTERNAL_ERROR'
    );
end;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_sessions_with_profiles(uuid) TO authenticated;