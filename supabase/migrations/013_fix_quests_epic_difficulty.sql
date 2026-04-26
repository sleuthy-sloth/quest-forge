-- ============================================================
-- Quest Forge — Migration 013
-- Allow 'epic' difficulty on the quests table
-- ============================================================
--
-- Migration 007 created the quests table with:
--   CHECK (difficulty IN ('easy','medium','hard'))
-- The chores table (migration 001) always included 'epic', and
-- the UI (quests/page.tsx, dashboard/quests/page.tsx) already
-- renders an 'epic' tier. Drop the old constraint and add a
-- new one that mirrors the chores table constraint.

ALTER TABLE quests
  DROP CONSTRAINT IF EXISTS quests_difficulty_check;

ALTER TABLE quests
  ADD CONSTRAINT quests_difficulty_check
    CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic'));
