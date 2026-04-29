-- ============================================================
-- Quest Forge — Migration 023
-- Data Model Reconciliation: Rewards & Bosses
-- ============================================================

DO $$ 
BEGIN

-- 1. UNIFY REWARDS --------------------------------------------

-- Add new columns to rewards
ALTER TABLE rewards 
  ADD COLUMN IF NOT EXISTS category loot_category NOT NULL DEFAULT 'real_reward',
  ADD COLUMN IF NOT EXISTS cost_xp int NOT NULL DEFAULT 0 CHECK (cost_xp >= 0),
  ADD COLUMN IF NOT EXISTS sprite_icon text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true;

-- Rename cost to cost_gold for clarity
IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'cost') THEN
  ALTER TABLE rewards RENAME COLUMN cost TO cost_gold;
END IF;

-- Migrate data from loot_store_items to rewards
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loot_store_items') THEN
  INSERT INTO rewards (id, household_id, title, description, cost_gold, cost_xp, category, sprite_icon, is_available, created_by)
  SELECT id, household_id, name, description, cost_gold, cost_xp, category, sprite_icon, is_available, created_by
  FROM loot_store_items
  ON CONFLICT (id) DO NOTHING;
END IF;

-- 2. UNIFY TRANSACTIONS ---------------------------------------

-- Add cost columns to redemptions to track historical price
ALTER TABLE redemptions
  ADD COLUMN IF NOT EXISTS gold_cost_paid int,
  ADD COLUMN IF NOT EXISTS xp_cost_paid int;

-- Migrate purchases to redemptions
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchases') THEN
  INSERT INTO redemptions (household_id, player_id, reward_id, status, created_at, approved_at)
  SELECT 
    p.household_id, 
    p.player_id, 
    p.item_id, 
    CASE WHEN p.redeemed THEN 'redeemed'::text ELSE 'pending'::text END,
    p.purchased_at,
    p.redeemed_at
  FROM purchases p
  ON CONFLICT DO NOTHING; -- Note: redemptions has a UNIQUE(player_id, reward_id) which might conflict
END IF;

-- 3. ALIGN BOSS COLUMNS ---------------------------------------

-- Update quests table to match story_chapters
IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quests' AND column_name = 'boss_health') THEN
  ALTER TABLE quests RENAME COLUMN boss_health TO boss_hp;
END IF;

IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quests' AND column_name = 'boss_current_health') THEN
  ALTER TABLE quests RENAME COLUMN boss_current_health TO boss_current_hp;
END IF;

IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quests' AND column_name = 'boss_sprite') THEN
  ALTER TABLE quests RENAME COLUMN boss_sprite TO boss_sprite_legacy;
  ALTER TABLE quests ADD COLUMN boss_sprite_config jsonb;
END IF;

ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_unlocked boolean NOT NULL DEFAULT true;

-- 4. UNIFY BOSS TRIGGER LOGIC ---------------------------------

-- Redefine deal_boss_damage to handle both story_chapters and quests
CREATE OR REPLACE FUNCTION deal_boss_damage(
  p_chapter_id uuid,
  p_damage      int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $inner$
DECLARE
  v_new_hp int;
BEGIN
  -- 1. Try story_chapters
  UPDATE story_chapters
  SET
    boss_current_hp = GREATEST(0, boss_current_hp - p_damage),
    is_unlocked     = CASE
                        WHEN GREATEST(0, boss_current_hp - p_damage) = 0
                        THEN true
                        ELSE is_unlocked
                      END
  WHERE id = p_chapter_id
    AND household_id = public.get_my_household_id()
    AND boss_current_hp > 0
  RETURNING boss_current_hp INTO v_new_hp;

  -- 2. If not found or not affected, try quests
  IF v_new_hp IS NULL THEN
    UPDATE quests
    SET
      boss_current_hp = GREATEST(0, boss_current_hp - p_damage),
      is_active       = CASE
                          WHEN GREATEST(0, boss_current_hp - p_damage) = 0
                          THEN false
                          ELSE is_active
                        END
    WHERE id = p_chapter_id
      AND household_id = public.get_my_household_id()
      AND is_boss = true
      AND boss_current_hp > 0
    RETURNING boss_current_hp INTO v_new_hp;
  END IF;

  RETURN COALESCE(v_new_hp, 0);
END;
$inner$;

-- Update handle_chore_verified to look for ANY active boss (chapter OR quest)
CREATE OR REPLACE FUNCTION handle_chore_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $inner$
DECLARE
  v_active_id uuid;
  v_is_quest boolean := false;
  v_chores_active boolean;
  v_effective_damage int;
BEGIN
  IF OLD.verified = false AND NEW.verified = true THEN
    -- Award XP/Gold
    UPDATE profiles
    SET
      xp_total      = xp_total + NEW.xp_awarded,
      xp_available  = xp_available + NEW.xp_awarded,
      gold          = gold + NEW.gold_awarded
    WHERE id = NEW.player_id;

    -- Check if other chores remain unverified
    SELECT EXISTS (
      SELECT 1 FROM chores c
      LEFT JOIN chore_completions cc ON c.id = cc.chore_id 
        AND cc.completed_at >= CURRENT_DATE 
        AND cc.verified_at IS NOT NULL
      WHERE c.household_id = NEW.household_id
        AND c.is_active = true
        AND cc.id IS NULL
        AND c.id <> NEW.chore_id
    ) INTO v_chores_active;

    -- Find active boss: 1. story_chapters, 2. quests
    SELECT id, false INTO v_active_id, v_is_quest
    FROM story_chapters
    WHERE household_id = NEW.household_id AND is_unlocked = false AND boss_current_hp > 0
    ORDER BY week_number ASC, chapter_number ASC LIMIT 1;

    IF v_active_id IS NULL THEN
      SELECT id, true INTO v_active_id, v_is_quest
      FROM quests
      WHERE household_id = NEW.household_id AND is_active = true AND is_boss = true AND boss_current_hp > 0
      ORDER BY created_at ASC LIMIT 1;
    END IF;

    IF v_active_id IS NULL THEN RETURN NEW; END IF;

    -- Deeds Before Victory logic
    IF v_chores_active THEN
      -- Cap damage at current_hp - 1
      IF v_is_quest THEN
        SELECT LEAST(NEW.xp_awarded, boss_current_hp - 1) INTO v_effective_damage FROM quests WHERE id = v_active_id;
      ELSE
        SELECT LEAST(NEW.xp_awarded, boss_current_hp - 1) INTO v_effective_damage FROM story_chapters WHERE id = v_active_id;
      END IF;
    ELSE
      v_effective_damage := NEW.xp_awarded;
    END IF;

    -- Apply damage
    IF v_is_quest THEN
      UPDATE quests 
      SET 
        boss_current_hp = GREATEST(0, boss_current_hp - v_effective_damage), 
        is_active = (GREATEST(0, boss_current_hp - v_effective_damage) > 0) 
      WHERE id = v_active_id;
    ELSE
      UPDATE story_chapters 
      SET 
        boss_current_hp = GREATEST(0, boss_current_hp - v_effective_damage), 
        is_unlocked = (GREATEST(0, boss_current_hp - v_effective_damage) = 0) 
      WHERE id = v_active_id;
    END IF;

    -- Story Progress
    INSERT INTO story_progress (household_id, player_id, chapter_id, contribution_xp)
    VALUES (NEW.household_id, NEW.player_id, v_active_id, v_effective_damage)
    ON CONFLICT (player_id, chapter_id) DO UPDATE SET contribution_xp = story_progress.contribution_xp + EXCLUDED.contribution_xp;
  END IF;
  RETURN NEW;
END;
$inner$;

-- Unified handle_edu_completed
CREATE OR REPLACE FUNCTION handle_edu_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $inner$
DECLARE
  v_active_id uuid;
  v_is_quest boolean := false;
  v_chores_active boolean;
  v_effective_damage int;
BEGIN
  -- 1. Award XP
  UPDATE profiles
  SET
    xp_total     = xp_total + NEW.xp_awarded,
    xp_available = xp_available + NEW.xp_awarded
  WHERE id = NEW.player_id;

  -- 2. Find active boss
  SELECT id, false INTO v_active_id, v_is_quest
  FROM story_chapters
  WHERE household_id = NEW.household_id AND is_unlocked = false AND boss_current_hp > 0
  ORDER BY week_number ASC, chapter_number ASC LIMIT 1;

  IF v_active_id IS NULL THEN
    SELECT id, true INTO v_active_id, v_is_quest
    FROM quests
    WHERE household_id = NEW.household_id AND is_active = true AND is_boss = true AND boss_current_hp > 0
    ORDER BY created_at ASC LIMIT 1;
  END IF;

  IF v_active_id IS NULL THEN RETURN NEW; END IF;

  -- 3. Deeds Before Victory check
  SELECT EXISTS (
    SELECT 1 FROM chores c
    LEFT JOIN chore_completions cc ON c.id = cc.chore_id 
      AND cc.completed_at >= CURRENT_DATE 
      AND cc.verified_at IS NOT NULL
    WHERE c.household_id = NEW.household_id
      AND c.is_active = true
      AND cc.id IS NULL
  ) INTO v_chores_active;

  -- 4. Deal Damage
  IF v_chores_active THEN
    IF v_is_quest THEN
      SELECT LEAST(NEW.xp_awarded, boss_current_hp - 1) INTO v_effective_damage FROM quests WHERE id = v_active_id;
    ELSE
      SELECT LEAST(NEW.xp_awarded, boss_current_hp - 1) INTO v_effective_damage FROM story_chapters WHERE id = v_active_id;
    END IF;
  ELSE
    v_effective_damage := NEW.xp_awarded;
  END IF;

  IF v_is_quest THEN
    UPDATE quests 
    SET 
      boss_current_hp = GREATEST(0, boss_current_hp - v_effective_damage), 
      is_active = (GREATEST(0, boss_current_hp - v_effective_damage) > 0) 
    WHERE id = v_active_id;
  ELSE
    UPDATE story_chapters 
    SET 
      boss_current_hp = GREATEST(0, boss_current_hp - v_effective_damage), 
      is_unlocked = (GREATEST(0, boss_current_hp - v_effective_damage) = 0) 
    WHERE id = v_active_id;
  END IF;

  -- 5. Progress
  INSERT INTO story_progress (household_id, player_id, chapter_id, contribution_xp)
  VALUES (NEW.household_id, NEW.player_id, v_active_id, v_effective_damage)
  ON CONFLICT (player_id, chapter_id) DO UPDATE SET contribution_xp = story_progress.contribution_xp + EXCLUDED.contribution_xp;

  RETURN NEW;
END;
$inner$;

-- Unified Purchase RPC
CREATE OR REPLACE FUNCTION public.purchase_reward(
  p_player_id uuid,
  p_reward_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $inner$
DECLARE
  v_player   record;
  v_reward   record;
  v_red_id   uuid;
  v_new_xp   integer;
  v_new_gold integer;
BEGIN
  SELECT id, household_id, xp_available, gold INTO v_player
  FROM profiles WHERE id = p_player_id FOR UPDATE;

  IF NOT FOUND THEN RETURN json_build_object('error', 'Profile not found'); END IF;

  SELECT id, cost_xp, cost_gold, category, title, description
  INTO v_reward
  FROM rewards
  WHERE id = p_reward_id AND household_id = v_player.household_id AND is_available = true;

  IF NOT FOUND THEN RETURN json_build_object('error', 'Reward not found'); END IF;

  IF v_player.xp_available < v_reward.cost_xp OR v_player.gold < v_reward.cost_gold THEN
    RETURN json_build_object('error', 'Insufficient funds');
  END IF;

  v_new_xp   := v_player.xp_available - v_reward.cost_xp;
  v_new_gold := v_player.gold         - v_reward.cost_gold;

  UPDATE profiles SET xp_available = v_new_xp, gold = v_new_gold WHERE id = p_player_id;

  -- Insert into redemptions (transaction log)
  INSERT INTO redemptions (household_id, player_id, reward_id, gold_cost_paid, xp_cost_paid, status)
  VALUES (v_player.household_id, p_player_id, v_reward.id, v_reward.cost_gold, v_reward.cost_xp, 
    CASE WHEN v_reward.category = 'cosmetic' THEN 'redeemed' ELSE 'pending' END)
  RETURNING id INTO v_red_id;

  -- If it's a cosmetic or item, also add to inventory
  IF v_reward.category IN ('cosmetic', 'power_up') THEN
    INSERT INTO inventory (household_id, player_id, item_name, item_type, description)
    VALUES (v_player.household_id, p_player_id, v_reward.title, 
      CASE WHEN v_reward.category = 'cosmetic' THEN 'cosmetic'::item_type ELSE 'consumable'::item_type END,
      v_reward.description);
  END IF;

  RETURN json_build_object(
    'redemptionId',    v_red_id,
    'newXpAvailable',  v_new_xp,
    'newGold',         v_new_gold
  );
END;
$inner$;

-- 5. CLEANUP --------------------------------------------------

-- Drop legacy functions
DROP FUNCTION IF EXISTS public.purchase_loot_item(uuid, uuid);

-- Drop legacy tables
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS loot_store_items CASCADE;
DROP TABLE IF EXISTS player_inventory CASCADE;

END $$;

