import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { withApiMiddleware } from '@/lib/api/middleware'

/**
 * POST /api/auth/lookup-username
 *
 * Resolves a player's username to their internal Supabase auth email.
 * Uses the admin client (bypasses RLS) because the caller is unauthenticated.
 *
 * Body: { username: string }
 * Returns: { email: string } or 400/404
 *
 * Security: returns a generic error on failure to avoid username enumeration.
 */
export async function POST(request: Request) {
  const err = await withApiMiddleware(request, { rateLimit: { maxRequests: 30 }, csrf: false })
  if (err) return err

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const username = typeof (body as Record<string, unknown>).username === 'string'
    ? ((body as Record<string, unknown>).username as string).trim().toLowerCase()
    : null

  if (!username || username.length < 1) {
    return NextResponse.json({ error: 'Username is required.' }, { status: 400 })
  }

  let admin
  try {
    admin = getAdminClient()
  } catch (err) {
    console.error('[lookup-username] admin client init failed:', err)
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 500 })
  }

  const { data, error } = await admin
    .from('profiles')
    .select('username, household_id, role')
    .eq('username', username)
    .eq('role', 'player')
    .single()

  if (error || !data) {
    // Log the actual error for debugging; surface generic message to user
    if (error) console.error('[lookup-username] profile query failed:', error.message)
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 404 })
  }

  // Construct the internal email used when the child account was created
  const email = `${data.username}@${data.household_id}.questforge.local`

  return NextResponse.json({ email })
}
