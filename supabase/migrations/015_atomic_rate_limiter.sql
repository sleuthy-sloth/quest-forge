-- ============================================================
-- Quest Forge — Migration 015
-- Atomic AI rate-limiter RPC
-- ============================================================
--
-- Replaces the previous read-then-write pattern in
-- src/lib/ai/rate-limiter.ts with a single atomic upsert
-- that increments the counter and returns the new value.
-- Called via supabase.rpc('increment_api_usage').

CREATE OR REPLACE FUNCTION public.increment_api_usage(p_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count integer;
BEGIN
  INSERT INTO api_usage (date, request_count, last_updated)
  VALUES (p_date, 1, now())
  ON CONFLICT (date)
  DO UPDATE
     SET request_count = api_usage.request_count + 1,
         last_updated  = now()
  RETURNING request_count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- Also expose a read-only helper used by canMakeRequest() without bumping the counter.
CREATE OR REPLACE FUNCTION public.get_api_usage_today(p_date date)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT request_count FROM api_usage WHERE date = p_date),
    0
  );
$$;
