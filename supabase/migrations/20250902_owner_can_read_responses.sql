alter table public.assessment_sessions enable row level security;

alter table public.assessment_responses enable row level security;

-- Sessions policies
drop policy if exists "sessions_read_own" on public.assessment_sessions;
drop policy if exists "sessions_insert_self" on public.assessment_sessions;
drop policy if exists "sessions_update_own" on public.assessment_sessions;
drop policy if exists "sessions_delete_own" on public.assessment_sessions;

create policy "sessions_read_own"
  on public.assessment_sessions
  for select
  using (auth.uid() = user_id);

create policy "sessions_insert_self"
  on public.assessment_sessions
  for insert
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.assessment_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions_delete_own"
  on public.assessment_sessions
  for delete
  using (auth.uid() = user_id);

-- Responses policies
drop policy if exists "responses_read_own" on public.assessment_responses;
drop policy if exists "responses_insert_self" on public.assessment_responses;
drop policy if exists "responses_update_own" on public.assessment_responses;
drop policy if exists "responses_delete_own" on public.assessment_responses;

create policy "responses_read_own"
  on public.assessment_responses
  for select
  using (auth.uid() = user_id);

create policy "responses_insert_self"
  on public.assessment_responses
  for insert
  with check (auth.uid() = user_id);

create policy "responses_update_own"
  on public.assessment_responses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "responses_delete_own"
  on public.assessment_responses
  for delete
  using (auth.uid() = user_id);

-- Ensure responses cascade when a session is hard-deleted
alter table public.assessment_responses
  drop constraint if exists assessment_responses_session_id_fkey,
  add constraint assessment_responses_session_id_fkey
    foreign key (session_id)
    references public.assessment_sessions(id)
    on delete cascade;
