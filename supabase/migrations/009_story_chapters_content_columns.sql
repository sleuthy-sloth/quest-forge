-- ============================================================
-- Quest Forge — Migration 009
-- Add content/sequence_order columns to story_chapters
-- ============================================================
--
-- The story UI (StoryPlayer.tsx, useQuestStore.fetchStoryData) reads
-- chapter.content and chapter.sequence_order, but the original schema
-- only has narrative_text + week_number/chapter_number. Add the missing
-- columns and backfill them so seeding from src/lore/bosses.json (52
-- weeks) writes to the columns the UI expects.

ALTER TABLE story_chapters
  ADD COLUMN IF NOT EXISTS content text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sequence_order int;

UPDATE story_chapters
   SET content = COALESCE(NULLIF(content, ''), narrative_text, ''),
       sequence_order = COALESCE(sequence_order, week_number);

ALTER TABLE story_chapters
  ALTER COLUMN sequence_order SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_story_chapters_household_seq
  ON story_chapters(household_id, sequence_order);
