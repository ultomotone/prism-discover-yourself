-- up
-- A) schema sanity & indexes
alter table public.profiles add column if not exists share_token text;
update public.profiles set share_token = gen_random_uuid() where share_token is null;
alter table public.profiles alter column share_token set not null;
create unique index if not exists idx_profiles_share_token on public.profiles(share_token);

alter table public.assessment_sessions add column if not exists finalized_at timestamptz;
alter table public.assessment_sessions add column if not exists profile_id uuid;
alter table public.assessment_sessions
  add constraint assessment_sessions_profile_id_fkey foreign key (profile_id)
  references public.profiles(id) on delete set null;
create unique index if not exists idx_assessment_sessions_share_token on public.assessment_sessions(share_token);

-- B) RLS hardening
alter table public.profiles enable row level security;
alter table public.assessment_sessions enable row level security;

-- drop permissive policies
DROP POLICY IF EXISTS "Public can view profiles for dashboard statistics" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous can view profiles by session" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read for session access" ON public.assessment_sessions;
DROP POLICY IF EXISTS "Allow update for session owner or anonymous" ON public.assessment_sessions;

CREATE POLICY IF NOT EXISTS profiles_owner_select
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS profiles_owner_iud
  ON public.profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS sessions_owner_select
  ON public.assessment_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS sessions_owner_iud
  ON public.assessment_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

revoke select on public.profiles from anon;
revoke select on public.assessment_sessions from anon;

-- C) tokenized RPCs
create table if not exists public.results_token_access_logs (
  id bigserial primary key,
  profile_id uuid,
  session_id uuid,
  token_hash text not null,
  success boolean not null,
  ip text,
  ua text,
  ts timestamptz not null default now()
);
create index if not exists idx_results_logs_profile on public.results_token_access_logs(profile_id);
create index if not exists idx_results_logs_ts on public.results_token_access_logs(ts);

create or replace function public.get_profile_by_share_token(t text)
returns public.profiles
language plpgsql
security definer
as $$
declare
  headers jsonb := coalesce(current_setting('request.headers', true)::jsonb, '{}'::jsonb);
  ip text := headers->>'x-forwarded-for';
  ua text := headers->>'user-agent';
  result public.profiles%rowtype;
  success boolean;
  token_hash text := encode(digest(t, 'sha256'), 'hex');
begin
  select * into result from public.profiles p where p.share_token = t;
  success := found;
  insert into public.results_token_access_logs(profile_id, session_id, token_hash, success, ip, ua)
    values (result.id, result.session_id, token_hash, success, ip, ua);
  if success then
    return result;
  else
    return null;
  end if;
end;
$$;

grant execute on function public.get_profile_by_share_token(text) to anon, authenticated;

create or replace function public.get_results_by_session(session_id uuid, t text)
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
  success boolean;
  token_hash text := encode(digest(t, 'sha256'), 'hex');
begin
  select p.*, s.status into p, s_status
  from public.profiles p
  join public.assessment_sessions s on s.id = p.session_id
  where s.id = session_id and p.share_token = t;
  success := found;
  insert into public.results_token_access_logs(profile_id, session_id, token_hash, success, ip, ua)
    values (p.id, session_id, token_hash, success, ip, ua);
  if success then
    return jsonb_build_object('profile', to_jsonb(p), 'session', jsonb_build_object('id', session_id, 'status', s_status));
  else
    return null;
  end if;
end;
$$;

grant execute on function public.get_results_by_session(uuid, text) to anon, authenticated;

create or replace function public.regenerate_profile_share_token(pid uuid)
returns text
language plpgsql
security definer
as $$
declare
  uid uuid := auth.uid();
  sess_id uuid;
  new_token text := gen_random_uuid()::text;
begin
  select session_id into sess_id from public.profiles where id = pid and user_id = uid;
  if sess_id is null then
    raise exception 'not authorized';
  end if;
  update public.profiles set share_token = new_token where id = pid;
  update public.assessment_sessions set share_token = new_token where id = sess_id;
  return new_token;
end;
$$;

grant execute on function public.regenerate_profile_share_token(uuid) to authenticated;

-- retention job
DO $$
BEGIN
  PERFORM 1 FROM pg_extension WHERE extname = 'pg_cron';
  IF FOUND THEN
    PERFORM cron.schedule('results_token_access_logs_purge', '0 0 * * *', $$delete from public.results_token_access_logs where ts < now() - interval '90 days';$$);
  END IF;
END$$;

-- down
select pg_try_advisory_lock(123456); -- noop to keep DO blocks balanced
select pg_advisory_unlock(123456);

do $$
begin
  perform cron.unschedule('results_token_access_logs_purge');
exception when undefined_function then null; end$$;

drop function if exists public.regenerate_profile_share_token(uuid);
revoke execute on function public.regenerate_profile_share_token(uuid) from authenticated;

drop function if exists public.get_results_by_session(uuid, text);
revoke execute on function public.get_results_by_session(uuid, text) from anon, authenticated;

drop function if exists public.get_profile_by_share_token(text);
revoke execute on function public.get_profile_by_share_token(text) from anon, authenticated;

drop table if exists public.results_token_access_logs;

alter table public.assessment_sessions drop constraint if exists assessment_sessions_profile_id_fkey;
alter table public.assessment_sessions drop column if exists profile_id;
alter table public.assessment_sessions drop column if exists finalized_at;

drop index if exists idx_profiles_share_token;
alter table public.profiles drop column if exists share_token;

drop policy if exists profiles_owner_select on public.profiles;
drop policy if exists profiles_owner_iud on public.profiles;
drop policy if exists sessions_owner_select on public.assessment_sessions;
drop policy if exists sessions_owner_iud on public.assessment_sessions;
