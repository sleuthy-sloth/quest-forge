-- ============================================================
-- Quest Forge — Migration 006
-- Production Reward Shop tables + helpers
-- ============================================================

-- Helper: atomically deduct gold with a server-side balance check
CREATE OR REPLACE FUNCTION public.deduct_gold(p_player_id uuid, p_amount int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_gold int;
BEGIN
  SELECT gold INTO current_gold FROM profiles WHERE id = p_player_id FOR UPDATE;
  IF current_gold IS NULL OR current_gold < p_amount THEN
    RETURN false;
  END IF;
  UPDATE profiles SET gold = gold - p_amount WHERE id = p_player_id;
  RETURN true;
END;
$$;

-- rewards ----------------------------------------------------
CREATE TABLE IF NOT EXISTS rewards (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  description  text        NOT NULL DEFAULT '',
  cost         int         NOT NULL CHECK (cost >= 1),
  icon_type    text        NOT NULL DEFAULT 'chest',
  household_id uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rewards_household ON rewards(household_id);

-- player_inventory -------------------------------------------
CREATE TABLE IF NOT EXISTS player_inventory (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id   uuid        NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  household_id uuid       NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, reward_id)
);

CREATE INDEX IF NOT EXISTS idx_player_inventory_player ON player_inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_player_inventory_reward ON player_inventory(reward_id);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE rewards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;

-- rewards: household members read; GMs CRUD
CREATE POLICY "rewards_select" ON rewards FOR SELECT
  USING (household_id = public.get_my_household_id());

CREATE POLICY "rewards_gm_insert" ON rewards FOR INSERT
  WITH CHECK (public.is_gm(household_id));

CREATE POLICY "rewards_gm_update" ON rewards FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "rewards_gm_delete" ON rewards FOR DELETE
  USING (public.is_gm(household_id));

-- player_inventory: players insert (buy), read own
CREATE POLICY "player_inventory_select" ON player_inventory FOR SELECT
  USING (
    player_id = auth.uid()
    OR public.is_gm(household_id)
  );

CREATE POLICY "player_inventory_insert" ON player_inventory FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "player_inventory_gm_update" ON player_inventory FOR UPDATE
  USING (public.is_gm(household_id));
