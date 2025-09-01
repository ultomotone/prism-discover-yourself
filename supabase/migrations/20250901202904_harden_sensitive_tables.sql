-- 1) Harden assessment_sessions
alter table if exists public.assessment_sessions enable row level security;

-- Remove any blanket grants to anon/authenticated
revoke all on table public.assessment_sessions from anon, authenticated;

-- Require a user ownership column (assumes column exists as user_id UUID -> auth.users.id).
-- If missing, add it (no-op if already exists).
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='assessment_sessions' and column_name='user_id'
  ) then
    alter table public.assessment_sessions add column user_id uuid;
    -- optional: backfill from existing data if you have a source column
  end if;
end $$;

-- Policies: owner-only access
drop policy if exists "as_owner_select" on public.assessment_sessions;
drop policy if exists "as_owner_insert" on public.assessment_sessions;
drop policy if exists "as_owner_update" on public.assessment_sessions;
drop policy if exists "as_owner_delete" on public.assessment_sessions;
drop policy if exists "as_anon_insert" on public.assessment_sessions;

create policy "as_owner_select"
  on public.assessment_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "as_owner_insert"
  on public.assessment_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "as_anon_insert"
  on public.assessment_sessions
  for insert
  to anon
  with check (true);

create policy "as_owner_update"
  on public.assessment_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table if exists public.scoring_config enable row level security;

-- Remove public grants
revoke all on table public.scoring_config from anon, authenticated;

drop policy if exists "admin_read" on public.scoring_config;
create policy "admin_read"
  on public.scoring_config
  for select
  to authenticated
  using ((current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin');

-- 3) Remove any anonymous policies on cron.job and revoke privileges
do $$
begin
  if to_regclass('cron.job') is not null then
    -- Drop any existing policies
    for r in
      select polname
      from pg_policies
      where schemaname='cron' and tablename='job'
    loop
      execute format('drop policy if exists %I on cron.job;', r.polname);
    end loop;

    revoke all on table cron.job from anon, authenticated;
  end if;
end $$;
