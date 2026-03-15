-- Enable realtime for tables that need live updates.
-- Uses existence checks so this migration is safe to run even if a table
-- was already added to the publication manually.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chore_completions'
  ) then
    alter publication supabase_realtime add table chore_completions;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'story_chapters'
  ) then
    alter publication supabase_realtime add table story_chapters;
  end if;
end $$;
