import { createClient } from '@/lib/supabase/server'

/** Daily request budget. Hard limit is 1,500; we stop at 1,400 for safety. */
const DAILY_LIMIT = 1_400

function todayDate(): string {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

/**
 * Returns true if we have budget remaining for another AI request today.
 * Uses the get_api_usage_today RPC (read-only, no side effects).
 * Call this BEFORE every AI API call.
 */
export async function canMakeRequest(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .rpc('get_api_usage_today', { p_date: todayDate() })
    if (error) {
      console.warn('[rate-limiter] canMakeRequest error:', error)
      return false
    }
    return (data as number) < DAILY_LIMIT
  } catch {
    // If we can't read the table, be conservative and deny
    return false
  }
}

/**
 * Atomically increments today's usage counter via a DB RPC.
 * The RPC uses INSERT … ON CONFLICT DO UPDATE, so a single round-trip
 * handles both first-request-of-day row creation and concurrent updates
 * without the read-then-write race of the previous implementation.
 *
 * Call this AFTER a successful AI API response.
 * Returns the new count (useful for logging).
 */
export async function incrementUsage(): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('increment_api_usage', { p_date: todayDate() })
  if (error) {
    console.warn('[rate-limiter] incrementUsage error:', error)
    return 0
  }
  return data as number
}

/**
 * Returns today's usage count. Useful for admin dashboards / logging.
 */
export async function getUsageToday(): Promise<number> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .rpc('get_api_usage_today', { p_date: todayDate() })
    return (data as number) ?? 0
  } catch {
    return 0
  }
}
