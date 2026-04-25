-- ============================================================
-- Quest Forge — Migration 008
-- Fix RLS circular dependency for first-time user signup
-- ============================================================

-- ── Problem ──────────────────────────────────────────────────
-- The `households_select` policy uses:
--     USING (id = public.get_my_household_id())
--
-- `get_my_household_id()` queries `profiles WHERE id = auth.uid()`.
-- During signup, no profile exists yet, so the function returns NULL.
-- The policy evaluates to `id = NULL` → NULL → row is denied.
--
-- This breaks `.select('id').single()` after a household INSERT
-- when using the anon key (regular client). The fix: also allow
-- SELECT when the current user IS the `created_by`, so the first
-- user can read their own household before a profile row exists.
--
-- ── Solution ─────────────────────────────────────────────────
-- Extend `households_select` to also match `created_by = auth.uid()`.

DROP POLICY IF EXISTS "households_select" ON households;

CREATE POLICY "households_select"
  ON households FOR SELECT
  USING (
    id = public.get_my_household_id()
    OR created_by = auth.uid()
  );


-- ── profiles_insert safety net ──────────────────────────────
-- The existing policy already allows `id = auth.uid()`, so the
-- initial GM profile insert works. But add a fallback for the
-- case where `get_my_household_id()` is called before the profile
-- is committed (SECURITY DEFINER functions run in a separate
-- snapshot, but it's good practice to be explicit).

-- No change needed here — the existing policy already works:
--   WITH CHECK (
--     public.is_gm(household_id)
--     OR
--     id = auth.uid()
--   );
-- `public.is_gm(...)` returns false (profile doesn't exist),
-- but `id = auth.uid()` is true since the user is creating
-- their own profile. ✓


-- ── Authoritative createHousehold for client-side (anon key) ─
-- If you ever need to create a household from a client component
-- (e.g., in a Zustand action), use this approach:
--
--   1. Verify the user is authenticated
--   2. INSERT the household WITHOUT .single() — just collect the
--      returned array (avoids RLS 0-row trap from the SELECT)
--   3. INSERT the profile with the returned household_id
--
-- The `households_select` fix above ensures steps 2-3 work even
-- when the profile doesn't exist yet.
