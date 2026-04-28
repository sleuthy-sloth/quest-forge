-- Enable realtime for chores table
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chores'
  ) then
    alter publication supabase_realtime add table chores;
  end if;
end $$;
