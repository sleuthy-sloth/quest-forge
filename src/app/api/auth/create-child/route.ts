import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

// ── Schemas ───────────────────────────────────────────────────
const CreateChildSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(40, 'Display name must be 40 characters or fewer'),
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(30, 'Username must be 30 characters or fewer')
    .regex(/^[a-z0-9_]+$/i, 'Username can only contain letters, numbers, and underscores')
    .transform(s => s.toLowerCase()),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be 72 characters or fewer'),
  age: z
    .number()
    .int()
    .min(4, 'Age must be at least 4')
    .max(17, 'Age must be 17 or under'),
})

const ResetPasswordSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be 72 characters or fewer'),
})

// ── Shared: verify caller is a GM, return their profile ───────
async function verifyGm() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401, profile: null, supabase: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') {
    return { error: 'Forbidden: only Game Masters can manage player accounts', status: 403, profile: null, supabase: null }
  }

  return { error: null, status: null, profile, supabase }
}

function parseBody(raw: unknown): Record<string, unknown> | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  return null
}

// ── POST — Create child account ───────────────────────────────
export async function POST(request: Request) {
  const { error, status, profile } = await verifyGm()
  if (error) return NextResponse.json({ error }, { status: status! })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = parseBody(body)
  if (!parsed) return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 })

  // Coerce age from string to number (HTML form inputs send strings)
  if (typeof parsed.age === 'string') parsed.age = parseInt(parsed.age, 10)

  const result = CreateChildSchema.safeParse(parsed)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { displayName, username, password, age } = result.data
  const householdId = profile!.household_id
  const email = `${username}@${householdId}.questforge.local`

  const admin = getAdminClient()

  // Check for username uniqueness before creating the auth user
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
  }

  // Create Supabase Auth user (admin bypasses email confirmation)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm — children don't have real emails
  })

  if (authError) {
    if (authError.status === 422 || authError.message.toLowerCase().includes('already registered')) {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    }
    console.error('[create-child] auth.admin.createUser failed:', authError)
    return NextResponse.json({ error: 'Could not create player account.' }, { status: 500 })
  }

  const newUserId = authData.user.id

  // Create profile row
  const { data: newProfile, error: profileError } = await admin
    .from('profiles')
    .insert({
      id: newUserId,
      household_id: householdId,
      display_name: displayName,
      username,
      role: 'player',
      age,
    })
    .select()
    .single()

  if (profileError) {
    // Roll back: delete the auth user so we don't leave an orphan
    await admin.auth.admin.deleteUser(newUserId)
    console.error('[create-child] profile insert failed:', profileError)

    if (profileError.code === '23505') {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not create player profile.' }, { status: 500 })
  }

  return NextResponse.json({ profile: newProfile }, { status: 201 })
}

// ── PATCH — Reset a player's password ────────────────────────
export async function PATCH(request: Request) {
  const { error, status, profile, supabase } = await verifyGm()
  if (error) return NextResponse.json({ error }, { status: status! })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = ResetPasswordSchema.safeParse(parseBody(body))
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { playerId, newPassword } = result.data

  // Verify the target is a player in the GM's own household (via RLS-scoped client)
  const { data: playerProfile } = await supabase!
    .from('profiles')
    .select('id')
    .eq('id', playerId)
    .eq('household_id', profile!.household_id)
    .eq('role', 'player')
    .single()

  if (!playerProfile) {
    return NextResponse.json({ error: 'Player not found in your household.' }, { status: 404 })
  }

  const admin = getAdminClient()
  const { error: resetError } = await admin.auth.admin.updateUserById(playerId, {
    password: newPassword,
  })

  if (resetError) {
    console.error('[create-child PATCH] password reset failed:', resetError)
    return NextResponse.json({ error: 'Could not reset password.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ── DELETE — Remove a player profile ─────────────────────────
export async function DELETE(request: Request) {
  const { error, status, profile, supabase } = await verifyGm()
  if (error) return NextResponse.json({ error }, { status: status! })

  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get('playerId')

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required.' }, { status: 400 })
  }

  // Verify the target is a player in the GM's own household
  const { data: playerProfile } = await supabase!
    .from('profiles')
    .select('id')
    .eq('id', playerId)
    .eq('household_id', profile!.household_id)
    .eq('role', 'player')
    .single()

  if (!playerProfile) {
    return NextResponse.json({ error: 'Player not found in your household.' }, { status: 404 })
  }

  const admin = getAdminClient()

  // 1. Delete the Auth user (this will cascade delete the profile row due to FK + trigger, 
  // or we do it explicitly if needed. In Supabase, deleting the auth user removes the user, 
  // and if ON DELETE CASCADE is set on profiles.id -> auth.users.id, it works.)
  const { error: deleteError } = await admin.auth.admin.deleteUser(playerId)

  if (deleteError) {
    console.error('[create-child DELETE] failed:', deleteError)
    return NextResponse.json({ error: 'Could not delete player account.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
