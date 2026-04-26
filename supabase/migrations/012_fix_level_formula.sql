-- ============================================================
-- Quest Forge — Migration 012
-- Fix recalculate_level() formula (off-by-one in threshold)
-- ============================================================
--
-- The old formula was: 50 * (v_level + 1) * (v_level + 2) / 2
-- This gave thresholds of 150, 300, 500, … instead of the
-- correct 100, 250, 450, … that matches the CLAUDE.md spec:
--   "cost to advance from level N to level N+1 is 50 × (N + 1) XP"
--
-- New formula: 50 * v_level * (v_level + 3) / 2
--   v_level=1 → 50*1*4/2 = 100  (threshold for level 2)
--   v_level=2 → 50*2*5/2 = 250  (threshold for level 3)
--   v_level=3 → 50*3*6/2 = 450  (threshold for level 4)

CREATE OR REPLACE FUNCTION public.recalculate_level()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_level int := 1;
BEGIN
  -- Find the highest level where threshold <= xp_total
  -- threshold(N) = 50 * N * (N+3) / 2   (N = level to check for)
  -- This gives: level 2 = 100 XP, level 3 = 250 XP, level 4 = 450 XP, …
  -- Matching: cost from level N to N+1 = 50 × (N + 1)
  WHILE v_level < 100
    AND (50 * v_level * (v_level + 3) / 2) <= NEW.xp_total
  LOOP
    v_level := v_level + 1;
  END LOOP;

  NEW.level := v_level;
  RETURN NEW;
END;
$$;
