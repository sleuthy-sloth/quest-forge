-- Fix: story_progress INSERT was outside the IF v_active_chapter_id IS NOT NULL block,
-- causing a FK violation (and full transaction rollback) when no active boss exists.
-- Players received no XP or gold when approving chores without an active story chapter.

CREATE OR REPLACE FUNCTION handle_chore_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_chapter_id uuid;
BEGIN
  -- Only act when verified flips from false → true
  IF OLD.verified = false AND NEW.verified = true THEN

    -- 1. Award XP and gold to the player
    UPDATE profiles
    SET
      xp_total      = xp_total + NEW.xp_awarded,
      xp_available  = xp_available + NEW.xp_awarded,
      gold          = gold + NEW.gold_awarded
    WHERE id = NEW.player_id;

    -- 2. Find the active (unlocked=false) chapter for this household
    SELECT id INTO v_active_chapter_id
    FROM story_chapters
    WHERE household_id = NEW.household_id
      AND is_unlocked = false
      AND boss_current_hp > 0
    ORDER BY week_number ASC, chapter_number ASC
    LIMIT 1;

    -- 3. Deal boss damage and record story contribution (only when a boss exists)
    IF v_active_chapter_id IS NOT NULL THEN
      UPDATE story_chapters
      SET
        boss_current_hp = GREATEST(0, boss_current_hp - NEW.xp_awarded),
        is_unlocked     = CASE
                            WHEN GREATEST(0, boss_current_hp - NEW.xp_awarded) = 0
                            THEN true
                            ELSE is_unlocked
                          END
      WHERE id = v_active_chapter_id;

      INSERT INTO story_progress (household_id, player_id, chapter_id, contribution_xp)
      VALUES (NEW.household_id, NEW.player_id, v_active_chapter_id, NEW.xp_awarded)
      ON CONFLICT (player_id, chapter_id)
      DO UPDATE SET contribution_xp = story_progress.contribution_xp + EXCLUDED.contribution_xp;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;
