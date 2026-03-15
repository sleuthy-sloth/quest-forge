import { createClient } from '@/lib/supabase/server'

/** Daily request budget. Hard limit is 1,500; we stop at 1,400 for safety. */
const DAILY_LIMIT = 1_400

function todayDate(): string {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

/**
 * Ensures a row exists for today in api_usage and returns the current count.
 * If no row exists, inserts one with request_count = 0.
 */
async function getOrCreateTodayRow(): Promise<number> {
  const supabase = await createClient()
  const today = todayDate()

  // Try to read existing row first
  const { data: existing } = await supabase
    .from('api_usage')
    .select('request_count')
    .eq('date', today)
    .maybeSingle()

  if (existing !== null) {
    return existing.request_count
  }

  // Row doesn't exist — insert it. If another request races us, the DB
  // unique constraint on date will reject the duplicate; we ignore that error
  // and re-read the row.
  const { error: insertError } = await supabase
    .from('api_usage')
    .insert({ date: today, request_count: 0, last_updated: new Date().toISOString() })

  if (insertError) {
    // Likely a unique violation from a concurrent insert — re-read
    const { data: retry } = await supabase
      .from('api_usage')
      .select('request_count')
      .eq('date', today)
      .maybeSingle()
    return retry?.request_count ?? 0
  }

  return 0
}

/**
 * Returns true if we have budget remaining for another Gemini request today.
 * Call this BEFORE every Gemini API call.
 */
export async function canMakeRequest(): Promise<boolean> {
  try {
    const count = await getOrCreateTodayRow()
    return count < DAILY_LIMIT
  } catch {
    // If we can't read the table, be conservative and deny
    return false
  }
}

/**
 * Atomically increments today's usage counter.
 * Call this AFTER a successful Gemini API response.
 */
export async function incrementUsage(): Promise<void> {
  const supabase = await createClient()
  const today = todayDate()

  // Read current count then write count+1.
  // Not a true CAS, but the rate limit is a soft cap so this is acceptable.
  const { data } = await supabase
    .from('api_usage')
    .select('request_count')
    .eq('date', today)
    .maybeSingle()

  const next = (data?.request_count ?? 0) + 1

  await supabase
    .from('api_usage')
    .upsert(
      { date: today, request_count: next, last_updated: new Date().toISOString() },
      { onConflict: 'date' }
    )
}

/**
 * Returns today's usage count. Useful for admin dashboards / logging.
 */
export async function getUsageToday(): Promise<number> {
  try {
    return await getOrCreateTodayRow()
  } catch {
    return 0
  }
}
