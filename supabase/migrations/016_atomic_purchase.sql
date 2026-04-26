-- ============================================================
-- Quest Forge — Migration 016
-- Atomic loot-store purchase RPC
-- ============================================================
--
-- Wraps the entire purchase flow (affordability check + currency
-- deduction + purchase record insert) in a single transaction.
-- This eliminates the TOCTOU window and the non-atomic best-effort
-- rollback that existed in /api/loot/purchase/route.ts.
--
-- Returns a JSON object with one of:
--   { "error": "..." }          — purchase rejected
--   { "purchaseId": uuid,
--     "newXpAvailable": int,
--     "newGold": int }          — purchase succeeded

CREATE OR REPLACE FUNCTION public.purchase_loot_item(
  p_player_id uuid,
  p_item_id   uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player   record;
  v_item     record;
  v_purchase_id uuid;
  v_new_xp   integer;
  v_new_gold integer;
BEGIN
  -- Lock the player row for the duration of this transaction to prevent
  -- concurrent purchases from racing past the affordability check.
  SELECT id, household_id, xp_available, gold
  INTO   v_player
  FROM   profiles
  WHERE  id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;

  -- Fetch the item — must belong to the same household and be available.
  SELECT id, cost_xp, cost_gold
  INTO   v_item
  FROM   loot_store_items
  WHERE  id           = p_item_id
    AND  household_id = v_player.household_id
    AND  is_available = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Item not found or unavailable');
  END IF;

  -- Affordability check.
  IF v_player.xp_available < v_item.cost_xp OR v_player.gold < v_item.cost_gold THEN
    RETURN json_build_object('error', 'Insufficient funds');
  END IF;

  -- Deduct currencies.
  v_new_xp   := v_player.xp_available - v_item.cost_xp;
  v_new_gold := v_player.gold         - v_item.cost_gold;

  UPDATE profiles
  SET    xp_available = v_new_xp,
         gold         = v_new_gold
  WHERE  id = p_player_id;

  -- Record the purchase.
  INSERT INTO purchases (item_id, player_id, household_id)
  VALUES (v_item.id, p_player_id, v_player.household_id)
  RETURNING id INTO v_purchase_id;

  RETURN json_build_object(
    'purchaseId',      v_purchase_id,
    'newXpAvailable',  v_new_xp,
    'newGold',         v_new_gold
  );
END;
$$;
