-- Lock search_path on all user-defined functions in public
do $$
declare
  r record;
begin
  for r in
    select n.nspname as schema_name,
           p.proname as func_name,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format(
      'alter function %I.%I(%s) set search_path = public, pg_temp;',
      r.schema_name, r.func_name, r.args
    );
  end loop;
end $$;
