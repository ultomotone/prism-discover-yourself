-- up
create table if not exists public.legacy_results_sessions (
  session_id uuid primary key,
  expires_at timestamptz not null
);
create index if not exists idx_legacy_results_expires_at on public.legacy_results_sessions(expires_at);

create or replace function public.get_results_by_session_legacy(session_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  headers jsonb := coalesce(current_setting('request.headers', true)::jsonb, '{}'::jsonb);
  ip text := headers->>'x-forwarded-for';
  ua text := headers->>'user-agent';
  p public.profiles%rowtype;
  s_status text;
  expires timestamptz;
  success boolean := false;
  token_hash text := encode(digest('legacy:' || session_id::text, 'sha256'), 'hex');
begin
  select expires_at into expires from public.legacy_results_sessions where session_id = get_results_by_session_legacy.session_id;
  if expires is not null and expires > now() then
    select p.*, s.status into p, s_status
    from public.profiles p
    join public.assessment_sessions s on s.id = p.session_id
    where p.session_id = get_results_by_session_legacy.session_id;
    success := found;
  end if;

  insert into public.results_token_access_logs(profile_id, session_id, token_hash, success, ip, ua)
    values (p.id, get_results_by_session_legacy.session_id, token_hash, success, ip, ua);

  if success then
    return jsonb_build_object('profile', to_jsonb(p), 'session', jsonb_build_object('id', get_results_by_session_legacy.session_id, 'status', s_status));
  else
    return null;
  end if;
end;
$$;

grant execute on function public.get_results_by_session_legacy(uuid) to anon, authenticated;

-- down
revoke execute on function public.get_results_by_session_legacy(uuid) from anon, authenticated;
drop function if exists public.get_results_by_session_legacy(uuid);
drop index if exists idx_legacy_results_expires_at;
drop table if exists public.legacy_results_sessions;
