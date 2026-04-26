-- ============================================================
-- Quest Forge — Migration 011
-- Add quest_flavor_text to quests table
-- ============================================================
--
-- Mirrors chores.quest_flavor_text. The GM types a plain task into
-- `description` and clicks "Generate" to fill `quest_flavor_text` with
-- AI-generated lore prose. The player UI shows the flavor text
-- prominently with the original `description` italicized below.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quests') THEN
    ALTER TABLE quests
      ADD COLUMN IF NOT EXISTS quest_flavor_text text NOT NULL DEFAULT '';
  END IF;
END $$;
