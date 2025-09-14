-- Create or replace health check RPC for results path
create or replace function public.health_results_path()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  checks jsonb;
begin
  checks := jsonb_build_object(
    'rls_profiles_on',           coalesce((select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'profiles'), false),
    'rls_sessions_on',           coalesce((select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'assessment_sessions'), false),
    'anon_profiles_select',      has_table_privilege('anon','public.profiles','SELECT'),
    'anon_sessions_select',      has_table_privilege('anon','public.assessment_sessions','SELECT'),
    'rpc_main_anon_exec',        has_function_privilege('anon','public.get_results_by_session(uuid,text)','EXECUTE'),
    'rpc_main_auth_exec',        has_function_privilege('authenticated','public.get_results_by_session(uuid,text)','EXECUTE'),
    'rpc_rotate_auth_exec',      has_function_privilege('authenticated','public.rotate_results_share_token(uuid)','EXECUTE'),
    'rpc_rotate_anon_exec',      has_function_privilege('anon','public.rotate_results_share_token(uuid)','EXECUTE'),
    -- legacy check removed (legacy function fully retired)
    'expiry_guard_present',      position('share_token_expires_at' in pg_get_functiondef('public.get_results_by_session(uuid,text)'::regprocedure)) > 0,
    'idx_fc_block_present',      to_regclass('public.idx_fc_responses_block_id') is not null,
    'idx_fc_option_present',     to_regclass('public.idx_fc_responses_option_id') is not null
  );

  return checks || jsonb_build_object(
    'failing', coalesce(
      (select jsonb_agg(key)
         from jsonb_each(checks)
        where value = 'false'::jsonb),
      '[]'::jsonb)
  );
end;
$$;

grant execute on function public.health_results_path() to anon, authenticated;
