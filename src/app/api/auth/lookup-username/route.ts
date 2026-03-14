import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

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

  const admin = getAdminClient()

  const { data, error } = await admin
    .from('profiles')
    .select('username, household_id, role')
    .eq('username', username)
    .eq('role', 'player')
    .single()

  if (error || !data) {
    // Generic message — don't reveal whether the username exists
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 404 })
  }

  // Construct the internal email used when the child account was created
  const email = `${data.username}@${data.household_id}.questforge.local`

  return NextResponse.json({ email })
}
