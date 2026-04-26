-- ============================================================
-- Quest Forge — Migration 014
-- Fix is_unlocked semantics for story_chapters
-- ============================================================
--
-- Semantic contract (as used by handle_chore_verified trigger):
--   is_unlocked = false, boss_current_hp > 0  →  boss is ACTIVE (players fighting it)
--   is_unlocked = true,  boss_current_hp = 0  →  boss DEFEATED (story narrative revealed)
--
-- Bug: seed-chapters.ts seeded week 1 with is_unlocked = true, which meant
-- the handle_chore_verified trigger (which looks for is_unlocked = false) never
-- dealt damage to the week-1 boss.  The play page also queried is_unlocked = true
-- which correctly found week 1, but damage was never applied, so it never resolved.
--
-- Fix: reset any week-1 chapter that still has boss_current_hp > 0 (i.e. the
-- boss has not genuinely been defeated) back to is_unlocked = false so the
-- trigger can track and damage it correctly.
-- Chapters that are already at boss_current_hp = 0 keep is_unlocked = true
-- because they were legitimately defeated and their story should stay visible.

UPDATE story_chapters
SET    is_unlocked = false
WHERE  week_number = 1
  AND  boss_current_hp > 0
  AND  is_unlocked  = true;
