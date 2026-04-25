-- ============================================================
-- Quest Forge — Migration 005
-- Reward Shop tables
-- ============================================================

-- rewards ----------------------------------------------------
-- Simple gold-cost rewards managed by GM per household
CREATE TABLE rewards (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  description  text        NOT NULL DEFAULT '',
  cost         int         NOT NULL CHECK (cost >= 1),
  icon_type    text        NOT NULL DEFAULT 'chest',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rewards_household ON rewards(household_id);

-- player_inventory -------------------------------------------
-- Tracks which rewards a player has purchased
CREATE TABLE player_inventory (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id   uuid        NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  is_used     boolean     NOT NULL DEFAULT false,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, reward_id)
);

CREATE INDEX idx_player_inventory_player ON player_inventory(player_id);
CREATE INDEX idx_player_inventory_reward ON player_inventory(reward_id);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE rewards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;

-- rewards: GMs can CRUD their household's rewards; players can read
CREATE POLICY "rewards_household_select"
  ON rewards FOR SELECT
  USING (household_id = public.get_my_household_id());

CREATE POLICY "rewards_gm_insert"
  ON rewards FOR INSERT
  WITH CHECK (public.is_gm(household_id));

CREATE POLICY "rewards_gm_update"
  ON rewards FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "rewards_gm_delete"
  ON rewards FOR DELETE
  USING (public.is_gm(household_id));

-- player_inventory: players can insert (buy), read own
CREATE POLICY "player_inventory_select"
  ON player_inventory FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.household_id =
        (SELECT household_id FROM rewards r WHERE r.id = player_inventory.reward_id))
  );

CREATE POLICY "player_inventory_insert"
  ON player_inventory FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "player_inventory_gm_update"
  ON player_inventory FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'gm' AND p.household_id =
        (SELECT household_id FROM rewards r WHERE r.id = player_inventory.reward_id))
  );
