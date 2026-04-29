-- ============================================================
-- Quest Forge — Migration 019
-- "Deeds Before Victory": Prevent boss defeat if chores remain
-- ============================================================

-- Redefine handle_edu_completed to check for remaining chores
CREATE OR REPLACE FUNCTION handle_edu_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_chapter_id uuid;
  v_chores_active boolean;
BEGIN
  -- 1. Award XP to the player
  UPDATE profiles
  SET
    xp_total     = xp_total + NEW.xp_awarded,
    xp_available = xp_available + NEW.xp_awarded
  WHERE id = NEW.player_id;

  -- 2. Find the active chapter (is_unlocked = false, boss_current_hp > 0)
  SELECT id INTO v_active_chapter_id
  FROM story_chapters
  WHERE household_id = NEW.household_id
    AND is_unlocked = false
    AND boss_current_hp > 0
  ORDER BY week_number ASC, chapter_number ASC
  LIMIT 1;

  -- 3. Check for active chores that haven't been verified for today
  -- We define "active chores" as chores with is_active = true
  -- that do NOT have a verified completion today.
  SELECT EXISTS (
    SELECT 1 FROM chores c
    LEFT JOIN chore_completions cc ON c.id = cc.chore_id 
      AND cc.completed_at >= CURRENT_DATE 
      AND cc.verified_at IS NOT NULL
    WHERE c.household_id = NEW.household_id
      AND c.is_active = true
      AND cc.id IS NULL
  ) INTO v_chores_active;

  -- 4. Deal boss damage (cap at 1 HP if chores are active)
  IF v_active_chapter_id IS NOT NULL THEN
    UPDATE story_chapters
    SET
      boss_current_hp = CASE 
                          WHEN v_chores_active AND GREATEST(0, boss_current_hp - NEW.xp_awarded) = 0 
                          THEN 1 
                          ELSE GREATEST(0, boss_current_hp - NEW.xp_awarded) 
                        END,
      is_unlocked     = CASE
                          -- Only unlock if chores are done AND HP reaches 0
                          WHEN NOT v_chores_active AND GREATEST(0, boss_current_hp - NEW.xp_awarded) = 0
                          THEN true
                          ELSE is_unlocked
                        END
    WHERE id = v_active_chapter_id;

    -- 5. Record contribution
    INSERT INTO story_progress (household_id, player_id, chapter_id, contribution_xp)
    VALUES (NEW.household_id, NEW.player_id, v_active_chapter_id, NEW.xp_awarded)
    ON CONFLICT (player_id, chapter_id)
    DO UPDATE SET contribution_xp = story_progress.contribution_xp + EXCLUDED.contribution_xp;
  END IF;

  RETURN NEW;
END;
$$;
