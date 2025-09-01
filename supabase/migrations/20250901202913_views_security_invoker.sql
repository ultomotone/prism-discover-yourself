-- Ensure all views in public run with invoker privileges (respect caller RLS)
do $$
declare
  r record;
begin
  for r in
    select table_schema, table_name
    from information_schema.views
    where table_schema = 'public'
  loop
    execute format('alter view %I.%I set (security_invoker = on);', r.table_schema, r.table_name);
  end loop;
end $$;
