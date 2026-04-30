import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'
import { seedStoryChaptersForHousehold } from '@/lib/story/seed-chapters'
import { withApiMiddleware } from '@/lib/api/middleware'

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
  const err = await withApiMiddleware(request, { rateLimit: { maxRequests: 5 }, csrf: false })
  if (err) return err

  try {
    return await handleSignup(request)
  } catch (err) {
    console.error('[signup-gm] UNEXPECTED CRASH:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected server error occurred.' },
      { status: 500 },
    )
  }
}

async function handleSignup(request: Request) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = SignupGmSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { email, password, householdName, displayName } = result.data

  let admin
  try {
    admin = getAdminClient()
  } catch {
    return NextResponse.json(
      { error: 'Server configuration error: admin client unavailable. Please check SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 },
    )
  }

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

  // 2. Create household
  const { data: households, error: householdError } = await admin
    .from('households')
    .insert({ name: householdName, created_by: userId })
    .select('id')

  if (householdError || !households || households.length === 0) {
    await admin.auth.admin.deleteUser(userId).catch(() => {})
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
    await admin.auth.admin.deleteUser(userId).catch(() => {})
    console.error('[signup-gm] profile insert failed:', profileError)
    return NextResponse.json({ error: 'Could not create profile.' }, { status: 500 })
  }

  // 4. Seed 52 story chapters for the new household. Best-effort: a failure
  // here leaves the household functional and an admin can re-run the seeder
  // via /api/admin/seed-story.
  try {
    await seedStoryChaptersForHousehold(admin, householdId)
  } catch (seedErr) {
    console.error('[signup-gm] seedStoryChaptersForHousehold failed:', seedErr)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
