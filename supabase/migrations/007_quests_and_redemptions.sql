-- ============================================================
-- Quest Forge — Migration 007
-- Quests (boss-capable), voucher reward_type, redemptions
-- ============================================================

-- Enums -------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE reward_type AS ENUM ('digital', 'real_world');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE redemption_status AS ENUM ('pending', 'approved', 'redeemed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Quests ------------------------------------------------------
-- RPG-style quests created by parents. Can be boss encounters.
CREATE TABLE IF NOT EXISTS quests (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  description   text        NOT NULL DEFAULT '',
  xp_reward     int         NOT NULL CHECK (xp_reward >= 1),
  gold_reward   int         NOT NULL DEFAULT 0 CHECK (gold_reward >= 0),
  assigned_to   uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  difficulty    text        NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  is_boss       boolean     NOT NULL DEFAULT false,
  boss_health   int         CHECK (boss_health IS NULL OR boss_health BETWEEN 100 AND 500),
  boss_current_health int    CHECK (boss_current_health IS NULL OR boss_current_health >= 0),
  boss_sprite   text        CHECK (boss_sprite IS NULL OR boss_sprite IN ('demon','dragon','slime')),
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quests_household ON quests(household_id);
CREATE INDEX IF NOT EXISTS idx_quests_assigned  ON quests(assigned_to);

-- Rewards: add reward_type column ----------------------------
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS reward_type reward_type NOT NULL DEFAULT 'digital';

-- Redemptions ------------------------------------------------
CREATE TABLE IF NOT EXISTS redemptions (
  id            uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid              NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  player_id     uuid              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id     uuid              NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  status        redemption_status NOT NULL DEFAULT 'pending',
  created_at    timestamptz       NOT NULL DEFAULT now(),
  approved_at   timestamptz,
  UNIQUE (player_id, reward_id)
);

CREATE INDEX IF NOT EXISTS idx_redemptions_household ON redemptions(household_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_player    ON redemptions(player_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status    ON redemptions(status);

-- RLS ---------------------------------------------------------

ALTER TABLE quests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Quests: household members read; GMs CRUD
CREATE POLICY "quests_select" ON quests FOR SELECT
  USING (household_id = public.get_my_household_id());

CREATE POLICY "quests_gm_insert" ON quests FOR INSERT
  WITH CHECK (public.is_gm(household_id));

CREATE POLICY "quests_gm_update" ON quests FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "quests_gm_delete" ON quests FOR DELETE
  USING (public.is_gm(household_id));

-- Redemptions: players insert (buy real-world reward), read own; GMs read all + update
CREATE POLICY "redemptions_select" ON redemptions FOR SELECT
  USING (
    player_id = auth.uid()
    OR public.is_gm(household_id)
  );

CREATE POLICY "redemptions_insert" ON redemptions FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "redemptions_gm_update" ON redemptions FOR UPDATE
  USING (public.is_gm(household_id));
