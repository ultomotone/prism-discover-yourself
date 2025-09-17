-- Enable RLS (safe if already enabled)
alter table public.profiles enable row level security;
alter table public.fc_scores enable row level security;

-- Service role can fully manage profiles
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles'
      and policyname='svc_manage_profiles'
  ) then
    create policy "svc_manage_profiles"
      on public.profiles
      for all
      to public
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end$$;

-- Service role can fully manage fc_scores
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='fc_scores'
      and policyname='svc_manage_fc_scores'
  ) then
    create policy "svc_manage_fc_scores"
      on public.fc_scores
      for all
      to public
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end$$;