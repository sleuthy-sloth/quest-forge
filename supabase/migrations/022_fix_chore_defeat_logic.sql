-- ============================================================
-- Quest Forge — Migration 022
-- "Deeds Before Victory": Sync handle_chore_verified with handle_edu_completed
-- ============================================================

CREATE OR REPLACE FUNCTION handle_chore_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_chapter_id uuid;
  v_chores_active boolean;
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

    -- 2. Find the active chapter (is_unlocked = false, boss_current_hp > 0)
    SELECT id INTO v_active_chapter_id
    FROM story_chapters
    WHERE household_id = NEW.household_id
      AND is_unlocked = false
      AND boss_current_hp > 0
    ORDER BY week_number ASC, chapter_number ASC
    LIMIT 1;

    -- 3. Check if OTHER chores still remain unverified for today
    -- This ensures we don't defeat the boss unless ALL active chores are verified.
    SELECT EXISTS (
      SELECT 1 FROM chores c
      LEFT JOIN chore_completions cc ON c.id = cc.chore_id 
        AND cc.completed_at >= CURRENT_DATE 
        AND cc.verified_at IS NOT NULL
      WHERE c.household_id = NEW.household_id
        AND c.is_active = true
        AND cc.id IS NULL
    ) INTO v_chores_active;

    -- 4. Deal boss damage (cap at 1 HP if other chores are still active)
    IF v_active_chapter_id IS NOT NULL THEN
      UPDATE story_chapters
      SET
        boss_current_hp = CASE 
                            WHEN v_chores_active AND GREATEST(0, boss_current_hp - NEW.xp_awarded) = 0 
                            THEN 1 
                            ELSE GREATEST(0, boss_current_hp - NEW.xp_awarded) 
                          END,
        is_unlocked     = CASE
                            -- Only unlock if all chores are done AND HP reaches 0
                            WHEN NOT v_chores_active AND GREATEST(0, boss_current_hp - NEW.xp_awarded) = 0
                            THEN true
                            ELSE is_unlocked
                          END
      WHERE id = v_active_chapter_id;

      -- 5. Record contribution in story_progress
      INSERT INTO story_progress (household_id, player_id, chapter_id, contribution_xp)
      VALUES (NEW.household_id, NEW.player_id, v_active_chapter_id, NEW.xp_awarded)
      ON CONFLICT (player_id, chapter_id)
      DO UPDATE SET contribution_xp = story_progress.contribution_xp + EXCLUDED.contribution_xp;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;
