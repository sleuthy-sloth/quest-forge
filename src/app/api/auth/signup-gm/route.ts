import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'

const SignupGmSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8).max(72),
  householdName: z.string().min(2).max(60),
  displayName: z.string().min(2).max(40),
})

/**
 * POST /api/auth/signup-gm
 *
 * Creates a Game Master account end-to-end using the admin client so that
 * RLS policies never block the operation (they require an authenticated
 * session, which doesn't exist yet during signup).
 *
 * Flow:
 *  1. Admin creates the Supabase Auth user (email_confirm: true)
 *  2. Admin inserts the household row
 *  3. Admin inserts the GM profile row
 *  4. Returns success — the client then calls signInWithPassword to get a session
 *
 * Rolls back (deletes auth user) if any subsequent step fails.
 */
export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = SignupGmSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { email, password, householdName, displayName } = result.data
  const admin = getAdminClient()

  // 1. Create Auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (
      authError.status === 422 ||
      authError.message.toLowerCase().includes('already registered') ||
      authError.message.toLowerCase().includes('already exists')
    ) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try logging in.' },
        { status: 409 }
      )
    }
    console.error('[signup-gm] createUser failed:', authError)
    return NextResponse.json({ error: 'Could not create account.' }, { status: 500 })
  }

  const userId = authData.user.id

  // 2. Create household — use .select() WITHOUT .single() to avoid RLS
  //    blocking the return (no profile exists yet so get_my_household_id()
  //    returns NULL). With the admin client this isn't an issue, but this
  //    pattern is safe for both service-role and anon-key clients.
  const { data: households, error: householdError } = await admin
    .from('households')
    .insert({ name: householdName, created_by: userId })
    .select('id')

  if (householdError || !households || households.length === 0) {
    await admin.auth.admin.deleteUser(userId)
    console.error('[signup-gm] household insert failed:', householdError)
    return NextResponse.json({ error: 'Could not create household.' }, { status: 500 })
  }

  const householdId = households[0].id

  // 3. Create GM profile
  const username = `gm_${email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${Date.now().toString(36)}`

  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: userId,
      household_id: householdId,
      display_name: displayName,
      username,
      role: 'gm',
    })

  if (profileError) {
    // Roll back: delete auth user + household (cascade handles the rest)
    await admin.auth.admin.deleteUser(userId)
    console.error('[signup-gm] profile insert failed:', profileError)
    return NextResponse.json({ error: 'Could not create profile.' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
