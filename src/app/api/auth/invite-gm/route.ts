import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { withApiMiddleware } from '@/lib/api/middleware'

const InviteGmSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(40),
})

/**
 * POST /api/auth/invite-gm
 *
 * Creates a Co-GM account attached to the calling GM's existing household.
 * Does NOT create a new household or seed story chapters.
 *
 * Flow:
 *  1. Verify the caller is a GM
 *  2. Admin creates the Supabase Auth user (email_confirm: true)
 *  3. Admin inserts a GM profile row in the SAME household
 *  4. Returns success
 *
 * Rolls back (deletes auth user) if any step fails.
 */
export async function POST(request: Request) {
  const err = await withApiMiddleware(request, { rateLimit: { maxRequests: 10 }, csrf: true })
  if (err) return err

  try {
    return await handleInvite(request)
  } catch (err) {
    console.error('[invite-gm] UNEXPECTED CRASH:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected server error occurred.' },
      { status: 500 },
    )
  }
}

async function handleInvite(request: Request) {
  // 1. Verify caller is a GM
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('id, role, household_id')
    .eq('id', user.id)
    .single()

  if (!callerProfile || callerProfile.role !== 'gm') {
    return NextResponse.json(
      { error: 'Forbidden: only Game Masters can invite co-GMs.' },
      { status: 403 },
    )
  }

  // 2. Parse body
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = InviteGmSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { email, password, displayName } = result.data
  const householdId = callerProfile.household_id

  let admin
  try {
    admin = getAdminClient()
  } catch {
    return NextResponse.json(
      { error: 'Server configuration error: admin client unavailable.' },
      { status: 500 },
    )
  }

  // 3. Create Auth user
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
        { error: 'An account with this email already exists.' },
        { status: 409 },
      )
    }
    console.error('[invite-gm] createUser failed:', authError)
    return NextResponse.json({ error: 'Could not create account.' }, { status: 500 })
  }

  const newUserId = authData.user.id

  // 4. Create GM profile in the SAME household
  const username = `gm_${email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${Date.now().toString(36)}`

  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: newUserId,
      household_id: householdId,
      display_name: displayName,
      username,
      role: 'gm',
    })

  if (profileError) {
    // Roll back: delete the auth user
    await admin.auth.admin.deleteUser(newUserId).catch(() => {})
    console.error('[invite-gm] profile insert failed:', profileError)
    return NextResponse.json({ error: 'Could not create co-GM profile.' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
