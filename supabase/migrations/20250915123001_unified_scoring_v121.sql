-- up
alter table assessment_sessions
  alter column share_token set default gen_random_uuid();

update scoring_config set value='v1.2.1' where key='results_version';

alter table profiles enable row level security;
revoke select on profiles from public;
revoke select on profiles from anon;
revoke select on profiles from authenticated;
grant select on profiles to authenticated;
create policy "profiles_select_own" on profiles for select
  using (auth.uid() = user_id);

grant execute on function get_profile_by_session(uuid,text) to anon, authenticated;

-- down
alter table assessment_sessions
  alter column share_token drop default;

update scoring_config set value='v1.2' where key='results_version';

drop policy if exists "profiles_select_own" on profiles;
revoke select on profiles from authenticated;
grant select on profiles to anon;
grant select on profiles to authenticated;
alter table profiles disable row level security;

revoke execute on function get_profile_by_session(uuid,text) from anon, authenticated;
