-- ============================================================
-- Quest Forge: The Emberlight Chronicles
-- Migration 001 — Initial Schema
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================



-- ============================================================
-- CUSTOM TYPES
-- ============================================================
CREATE TYPE user_role        AS ENUM ('gm', 'player');
CREATE TYPE recurrence_type  AS ENUM ('once', 'daily', 'weekly');
CREATE TYPE difficulty_type  AS ENUM ('easy', 'medium', 'hard', 'epic');
CREATE TYPE subject_type     AS ENUM ('math', 'reading', 'science', 'history', 'vocabulary', 'logic');
CREATE TYPE age_tier_type    AS ENUM ('junior', 'senior');
CREATE TYPE challenge_type   AS ENUM ('quiz', 'puzzle', 'word_game', 'math_drill', 'ai_generated');
CREATE TYPE loot_category    AS ENUM ('real_reward', 'cosmetic', 'power_up', 'story_unlock');
CREATE TYPE item_type        AS ENUM ('weapon', 'armor', 'accessory', 'consumable', 'cosmetic');


-- ============================================================
-- TABLES
-- ============================================================

-- households ------------------------------------------------
CREATE TABLE households (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  created_by  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  settings    jsonb       NOT NULL DEFAULT '{}'
);

-- profiles --------------------------------------------------
CREATE TABLE profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  display_name    text        NOT NULL,
  username        text        NOT NULL UNIQUE,
  role            user_role   NOT NULL,
  age             int         CHECK (age IS NULL OR (age >= 0 AND age <= 120)),
  avatar_config   jsonb       NOT NULL DEFAULT '{}',
  avatar_class    text,
  xp_total        int         NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
  xp_available    int         NOT NULL DEFAULT 0 CHECK (xp_available >= 0),
  level           int         NOT NULL DEFAULT 1 CHECK (level >= 1),
  gold            int         NOT NULL DEFAULT 0 CHECK (gold >= 0),
  story_chapter   int         NOT NULL DEFAULT 1 CHECK (story_chapter >= 1),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- chores ----------------------------------------------------
CREATE TABLE chores (
  id                uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id      uuid            NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title             text            NOT NULL,
  description       text            NOT NULL DEFAULT '',
  xp_reward         int             NOT NULL CHECK (xp_reward >= 0),
  gold_reward       int             NOT NULL DEFAULT 0 CHECK (gold_reward >= 0),
  assigned_to       uuid            REFERENCES profiles(id) ON DELETE SET NULL,
  recurrence        recurrence_type NOT NULL,
  difficulty        difficulty_type NOT NULL,
  quest_flavor_text text            NOT NULL DEFAULT '',
  is_active         boolean         NOT NULL DEFAULT true,
  created_by        uuid            NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at        timestamptz     NOT NULL DEFAULT now()
);

-- chore_completions -----------------------------------------
CREATE TABLE chore_completions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  chore_id     uuid        NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
  player_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  verified     boolean     NOT NULL DEFAULT false,
  verified_at  timestamptz,
  xp_awarded   int         NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  gold_awarded int         NOT NULL DEFAULT 0 CHECK (gold_awarded >= 0)
);

-- edu_challenges --------------------------------------------
-- Global (not household-scoped) — shared content library
CREATE TABLE edu_challenges (
  id             uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text           NOT NULL,
  subject        subject_type   NOT NULL,
  age_tier       age_tier_type  NOT NULL,
  difficulty     int            NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  xp_reward      int            NOT NULL CHECK (xp_reward >= 0),
  challenge_type challenge_type NOT NULL,
  content        jsonb          NOT NULL DEFAULT '{}',
  is_active      boolean        NOT NULL DEFAULT true
);

-- edu_completions -------------------------------------------
CREATE TABLE edu_completions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  challenge_id uuid        NOT NULL REFERENCES edu_challenges(id) ON DELETE CASCADE,
  player_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score        int         NOT NULL CHECK (score >= 0),
  completed_at timestamptz NOT NULL DEFAULT now(),
  xp_awarded   int         NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0)
);

-- loot_store_items ------------------------------------------
CREATE TABLE loot_store_items (
  id                      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id            uuid          NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name                    text          NOT NULL,
  description             text          NOT NULL DEFAULT '',
  flavor_text             text          NOT NULL DEFAULT '',
  cost_xp                 int           NOT NULL DEFAULT 0 CHECK (cost_xp >= 0),
  cost_gold               int           NOT NULL DEFAULT 0 CHECK (cost_gold >= 0),
  category                loot_category NOT NULL,
  real_reward_description text          NOT NULL DEFAULT '',
  is_available            boolean       NOT NULL DEFAULT true,
  sprite_icon             text,
  created_by              uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- purchases -------------------------------------------------
CREATE TABLE purchases (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  item_id      uuid        NOT NULL REFERENCES loot_store_items(id) ON DELETE CASCADE,
  player_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  redeemed     boolean     NOT NULL DEFAULT false,
  redeemed_at  timestamptz
);

-- story_chapters --------------------------------------------
CREATE TABLE story_chapters (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id          uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  week_number           int         NOT NULL CHECK (week_number >= 1),
  chapter_number        int         NOT NULL CHECK (chapter_number >= 1),
  title                 text        NOT NULL DEFAULT '',
  narrative_text        text        NOT NULL DEFAULT '',
  boss_name             text,
  boss_description      text,
  boss_hp               int         NOT NULL DEFAULT 100 CHECK (boss_hp >= 0),
  boss_current_hp       int         NOT NULL DEFAULT 100 CHECK (boss_current_hp >= 0),
  boss_sprite_config    jsonb,
  xp_threshold_to_unlock int        NOT NULL DEFAULT 0 CHECK (xp_threshold_to_unlock >= 0),
  is_unlocked           boolean     NOT NULL DEFAULT false,
  rewards_claimed       boolean     NOT NULL DEFAULT false,
  UNIQUE (household_id, week_number, chapter_number)
);

-- story_progress --------------------------------------------
CREATE TABLE story_progress (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    uuid        NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  player_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_id      uuid        NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
  contribution_xp int         NOT NULL DEFAULT 0 CHECK (contribution_xp >= 0),
  unlocked_at     timestamptz,
  UNIQUE (player_id, chapter_id)
);

-- inventory -------------------------------------------------
CREATE TABLE inventory (
  id           uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid      NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  player_id    uuid      NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_name    text      NOT NULL,
  item_type    item_type NOT NULL,
  description  text      NOT NULL DEFAULT '',
  sprite_layer jsonb,
  equipped     boolean   NOT NULL DEFAULT false,
  acquired_at  timestamptz NOT NULL DEFAULT now()
);

-- api_usage -------------------------------------------------
-- Single row per calendar day, atomically incremented
CREATE TABLE api_usage (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  date          date        NOT NULL UNIQUE,
  request_count int         NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  last_updated  timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_household_id       ON profiles(household_id);
CREATE INDEX idx_profiles_username           ON profiles(username);
CREATE INDEX idx_chores_household_id         ON chores(household_id);
CREATE INDEX idx_chores_assigned_to          ON chores(assigned_to);
CREATE INDEX idx_chore_completions_household ON chore_completions(household_id);
CREATE INDEX idx_chore_completions_player    ON chore_completions(player_id);
CREATE INDEX idx_chore_completions_verified  ON chore_completions(verified);
CREATE INDEX idx_edu_completions_household   ON edu_completions(household_id);
CREATE INDEX idx_edu_completions_player      ON edu_completions(player_id);
CREATE INDEX idx_edu_challenges_subject_tier ON edu_challenges(subject, age_tier);
CREATE INDEX idx_loot_store_household        ON loot_store_items(household_id);
CREATE INDEX idx_purchases_household         ON purchases(household_id);
CREATE INDEX idx_purchases_player            ON purchases(player_id);
CREATE INDEX idx_story_chapters_household    ON story_chapters(household_id);
CREATE INDEX idx_story_progress_household    ON story_progress(household_id);
CREATE INDEX idx_story_progress_chapter      ON story_progress(chapter_id);
CREATE INDEX idx_inventory_player            ON inventory(player_id);
CREATE INDEX idx_api_usage_date              ON api_usage(date);


-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
ALTER TABLE households       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_challenges   ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_completions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_chapters   ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory        ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage        ENABLE ROW LEVEL SECURITY;

-- Helper: get the household_id for the current user
-- Used in policies to avoid repeated subqueries
CREATE OR REPLACE FUNCTION public.get_my_household_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid()
$$;

-- Helper: check if current user is a GM in the given household
CREATE OR REPLACE FUNCTION public.is_gm(hid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'gm'
      AND household_id = hid
  )
$$;


-- ── households ──────────────────────────────────────────────
-- Users can only see and manage their own household
CREATE POLICY "households_select"
  ON households FOR SELECT
  USING (id = public.get_my_household_id());

CREATE POLICY "households_insert"
  ON households FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "households_update"
  ON households FOR UPDATE
  USING (public.is_gm(id));

CREATE POLICY "households_delete"
  ON households FOR DELETE
  USING (public.is_gm(id));


-- ── profiles ────────────────────────────────────────────────
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  USING (household_id = public.get_my_household_id());

-- GMs can insert new profiles (child account creation)
CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  WITH CHECK (
    -- GMs creating child profiles in their own household
    public.is_gm(household_id)
    OR
    -- Initial GM profile creation (their own profile, first insert)
    id = auth.uid()
  );

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  USING (
    -- Players can update their own profile
    id = auth.uid()
    OR
    -- GMs can update any profile in their household
    public.is_gm(household_id)
  );

CREATE POLICY "profiles_delete"
  ON profiles FOR DELETE
  USING (public.is_gm(household_id));


-- ── chores ──────────────────────────────────────────────────
CREATE POLICY "chores_select"
  ON chores FOR SELECT
  USING (household_id = public.get_my_household_id());

CREATE POLICY "chores_insert"
  ON chores FOR INSERT
  WITH CHECK (public.is_gm(household_id));

CREATE POLICY "chores_update"
  ON chores FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "chores_delete"
  ON chores FOR DELETE
  USING (public.is_gm(household_id));


-- ── chore_completions ───────────────────────────────────────
CREATE POLICY "chore_completions_select"
  ON chore_completions FOR SELECT
  USING (household_id = public.get_my_household_id());

-- Players can mark chores complete (INSERT)
CREATE POLICY "chore_completions_insert"
  ON chore_completions FOR INSERT
  WITH CHECK (
    household_id = public.get_my_household_id()
    AND player_id = auth.uid()
  );

-- Only GMs can verify (UPDATE) completions
CREATE POLICY "chore_completions_update"
  ON chore_completions FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "chore_completions_delete"
  ON chore_completions FOR DELETE
  USING (public.is_gm(household_id));


-- ── edu_challenges ──────────────────────────────────────────
-- Globally readable by all authenticated users (shared library)
CREATE POLICY "edu_challenges_select"
  ON edu_challenges FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- No INSERT/UPDATE/DELETE via RLS — managed by service role / seed only


-- ── edu_completions ─────────────────────────────────────────
CREATE POLICY "edu_completions_select"
  ON edu_completions FOR SELECT
  USING (household_id = public.get_my_household_id());

-- Players can submit their own scores
CREATE POLICY "edu_completions_insert"
  ON edu_completions FOR INSERT
  WITH CHECK (
    household_id = public.get_my_household_id()
    AND player_id = auth.uid()
  );

CREATE POLICY "edu_completions_update"
  ON edu_completions FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "edu_completions_delete"
  ON edu_completions FOR DELETE
  USING (public.is_gm(household_id));


-- ── loot_store_items ────────────────────────────────────────
CREATE POLICY "loot_store_items_select"
  ON loot_store_items FOR SELECT
  USING (household_id = public.get_my_household_id());

CREATE POLICY "loot_store_items_insert"
  ON loot_store_items FOR INSERT
  WITH CHECK (public.is_gm(household_id));

CREATE POLICY "loot_store_items_update"
  ON loot_store_items FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "loot_store_items_delete"
  ON loot_store_items FOR DELETE
  USING (public.is_gm(household_id));


-- ── purchases ───────────────────────────────────────────────
CREATE POLICY "purchases_select"
  ON purchases FOR SELECT
  USING (household_id = public.get_my_household_id());

-- Players can make purchases
CREATE POLICY "purchases_insert"
  ON purchases FOR INSERT
  WITH CHECK (
    household_id = public.get_my_household_id()
    AND player_id = auth.uid()
  );

-- GMs can update (mark redeemed)
CREATE POLICY "purchases_update"
  ON purchases FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "purchases_delete"
  ON purchases FOR DELETE
  USING (public.is_gm(household_id));


-- ── story_chapters ──────────────────────────────────────────
CREATE POLICY "story_chapters_select"
  ON story_chapters FOR SELECT
  USING (household_id = public.get_my_household_id());

CREATE POLICY "story_chapters_insert"
  ON story_chapters FOR INSERT
  WITH CHECK (public.is_gm(household_id));

CREATE POLICY "story_chapters_update"
  ON story_chapters FOR UPDATE
  USING (public.is_gm(household_id));

CREATE POLICY "story_chapters_delete"
  ON story_chapters FOR DELETE
  USING (public.is_gm(household_id));


-- ── story_progress ──────────────────────────────────────────
CREATE POLICY "story_progress_select"
  ON story_progress FOR SELECT
  USING (household_id = public.get_my_household_id());

CREATE POLICY "story_progress_insert"
  ON story_progress FOR INSERT
  WITH CHECK (household_id = public.get_my_household_id());

CREATE POLICY "story_progress_update"
  ON story_progress FOR UPDATE
  USING (household_id = public.get_my_household_id());

CREATE POLICY "story_progress_delete"
  ON story_progress FOR DELETE
  USING (public.is_gm(household_id));


-- ── inventory ───────────────────────────────────────────────
CREATE POLICY "inventory_select"
  ON inventory FOR SELECT
  USING (household_id = public.get_my_household_id());

CREATE POLICY "inventory_insert"
  ON inventory FOR INSERT
  WITH CHECK (household_id = public.get_my_household_id());

CREATE POLICY "inventory_update"
  ON inventory FOR UPDATE
  USING (
    player_id = auth.uid()
    OR public.is_gm(household_id)
  );

CREATE POLICY "inventory_delete"
  ON inventory FOR DELETE
  USING (public.is_gm(household_id));


-- ── api_usage ───────────────────────────────────────────────
-- Service role only — no user-facing RLS needed
-- Authenticated users get read access (for rate-limit display if desired)
CREATE POLICY "api_usage_select"
  ON api_usage FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE handled exclusively by service role (bypasses RLS)


-- ============================================================
-- BOSS DAMAGE FUNCTION
-- Atomically decrements boss_current_hp, floors at 0,
-- and marks the chapter is_unlocked when HP hits 0.
-- Returns the new boss_current_hp value.
-- ============================================================
CREATE OR REPLACE FUNCTION deal_boss_damage(
  p_chapter_id uuid,
  p_damage      int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_hp int;
BEGIN
  UPDATE story_chapters
  SET
    boss_current_hp = GREATEST(0, boss_current_hp - p_damage),
    is_unlocked     = CASE
                        WHEN GREATEST(0, boss_current_hp - p_damage) = 0
                        THEN true
                        ELSE is_unlocked
                      END
  WHERE id = p_chapter_id
    -- Enforce household isolation: caller must belong to this chapter's household
    AND household_id = public.get_my_household_id()
    AND boss_current_hp > 0  -- No-op if boss already defeated
  RETURNING boss_current_hp INTO v_new_hp;

  RETURN COALESCE(v_new_hp, 0);
END;
$$;


-- ============================================================
-- AUTOMATIC XP / BOSS DAMAGE ON CHORE VERIFICATION
-- When a GM verifies a chore_completion, automatically:
--   1. Award XP and gold to the player's profile
--   2. Deal boss damage to the active chapter equal to xp_awarded
-- ============================================================
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

    -- 3. Deal boss damage if an active chapter exists
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
    END IF;

    -- 4. Record contribution in story_progress
    INSERT INTO story_progress (household_id, player_id, chapter_id, contribution_xp)
    VALUES (NEW.household_id, NEW.player_id, v_active_chapter_id, NEW.xp_awarded)
    ON CONFLICT (player_id, chapter_id)
    DO UPDATE SET contribution_xp = story_progress.contribution_xp + EXCLUDED.contribution_xp;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_chore_verified
  AFTER UPDATE ON chore_completions
  FOR EACH ROW
  EXECUTE FUNCTION handle_chore_verified();


-- ============================================================
-- AUTOMATIC XP / BOSS DAMAGE ON EDU COMPLETION
-- When a player submits an edu_completion, award XP and
-- deal boss damage immediately (no GM verification step).
-- ============================================================
CREATE OR REPLACE FUNCTION handle_edu_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_chapter_id uuid;
BEGIN
  -- 1. Award XP to the player
  UPDATE profiles
  SET
    xp_total     = xp_total + NEW.xp_awarded,
    xp_available = xp_available + NEW.xp_awarded
  WHERE id = NEW.player_id;

  -- 2. Find the active chapter
  SELECT id INTO v_active_chapter_id
  FROM story_chapters
  WHERE household_id = NEW.household_id
    AND is_unlocked = false
    AND boss_current_hp > 0
  ORDER BY week_number ASC, chapter_number ASC
  LIMIT 1;

  -- 3. Deal boss damage
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

    -- 4. Record contribution
    INSERT INTO story_progress (household_id, player_id, chapter_id, contribution_xp)
    VALUES (NEW.household_id, NEW.player_id, v_active_chapter_id, NEW.xp_awarded)
    ON CONFLICT (player_id, chapter_id)
    DO UPDATE SET contribution_xp = story_progress.contribution_xp + EXCLUDED.contribution_xp;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_edu_completed
  AFTER INSERT ON edu_completions
  FOR EACH ROW
  EXECUTE FUNCTION handle_edu_completed();


-- ============================================================
-- AUTOMATIC LEVEL-UP
-- After XP changes on profiles, recalculate level.
-- Formula: level N requires 50 × N × (N+1) / 2 total XP
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_level()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_level int := 1;
BEGIN
  -- Find the highest level where threshold <= xp_total
  -- threshold(N) = 50 * N * (N+1) / 2
  -- Solve iteratively up to a reasonable cap (level 100)
  WHILE v_level < 100
    AND (50 * (v_level + 1) * (v_level + 2) / 2) <= NEW.xp_total
  LOOP
    v_level := v_level + 1;
  END LOOP;

  NEW.level := v_level;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_xp_change
  BEFORE UPDATE OF xp_total ON profiles
  FOR EACH ROW
  WHEN (NEW.xp_total <> OLD.xp_total)
  EXECUTE FUNCTION recalculate_level();


-- ============================================================
-- REALTIME
-- Enable Supabase Realtime publications on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chore_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE story_chapters;
