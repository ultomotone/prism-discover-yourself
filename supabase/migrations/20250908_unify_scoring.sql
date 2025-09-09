-- up
alter table public.profiles enable row level security;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Authenticated can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

grant execute on function public.get_profile_by_session(uuid, text) to anon, authenticated;

alter table public.assessment_sessions
  alter column share_token set default gen_random_uuid();

update scoring_config set value='v1.2.1' where key='results_version';

-- down
update scoring_config set value='v1.2.0' where key='results_version';

alter table public.assessment_sessions
  alter column share_token drop default;

revoke execute on function public.get_profile_by_session(uuid, text) from anon, authenticated;

drop policy if exists "Authenticated can view own profile" on public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
alter table public.profiles disable row level security;
