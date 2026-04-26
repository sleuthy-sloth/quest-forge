import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ── Zod schemas ──────────────────────────────────────────────────────────────

const DIFFICULTIES = ['easy', 'medium', 'hard', 'epic'] as const
const RECURRENCES  = ['once', 'daily', 'weekly', 'monthly'] as const

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional().default(''),
  xp_reward: z.number().int().min(1).max(500),
  gold_reward: z.number().int().min(0).max(9999).optional().default(0),
  assigned_to: z.string().uuid().nullable().optional().default(null),
  recurrence: z.enum(RECURRENCES),
  difficulty: z.enum(DIFFICULTIES),
  quest_flavor_text: z.string().max(2000).optional().default(''),
})

const UpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  xp_reward: z.number().int().min(1).max(500).optional(),
  gold_reward: z.number().int().min(0).max(9999).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  recurrence: z.enum(RECURRENCES).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  quest_flavor_text: z.string().max(2000).optional(),
})

const DeactivateSchema = z.object({
  id: z.string().uuid(),
})

// ── Helpers ──────────────────────────────────────────────────────────────────

async function authenticateGM(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null as never, error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') {
    return { user: null as never, error: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) }
  }

  return { user: profile as { id: string; household_id: string }, error: null }
}

const CHORE_COLUMNS = [
  'id', 'title', 'description', 'xp_reward', 'gold_reward',
  'assigned_to', 'recurrence', 'difficulty', 'quest_flavor_text',
  'is_active', 'created_at',
].join(',')

const PLAYER_COLUMNS = ['id', 'display_name', 'username'].join(',')

// ── GET /api/chores ──────────────────────────────────────────────────────────

/**
 * Returns active chores + player profiles for the current household.
 * Uses server-side Supabase to avoid browser-side REST connection issues.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  const [{ data: chores, error: cErr }, { data: players, error: pErr }] = await Promise.all([
    supabase
      .from('chores')
      .select(CHORE_COLUMNS)
      .eq('household_id', profile.household_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select(PLAYER_COLUMNS)
      .eq('household_id', profile.household_id)
      .eq('role', 'player')
      .order('created_at', { ascending: true }),
  ])

  if (cErr) {
    console.error('[api/chores] GET error:', cErr)
    return NextResponse.json({ chores: [], players: [] })
  }

  return NextResponse.json({
    chores: chores ?? [],
    players: players ?? [],
    household_id: profile.household_id,
  })
}

// ── POST /api/chores ─────────────────────────────────────────────────────────

/**
 * Creates a new chore for the household. GM-only.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const auth = await authenticateGM(supabase)
  if (auth.error) return auth.error

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = CreateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const payload = result.data

  const { data, error } = await supabase
    .from('chores')
    .insert({
      household_id: auth.user.household_id,
      created_by: auth.user.id,
      title: payload.title,
      description: payload.description,
      xp_reward: payload.xp_reward,
      gold_reward: payload.gold_reward,
      assigned_to: payload.assigned_to ?? null,
      recurrence: payload.recurrence,
      difficulty: payload.difficulty,
      quest_flavor_text: payload.quest_flavor_text,
      is_active: true,
    })
    .select(CHORE_COLUMNS)
    .single()

  if (error) {
    console.error('[api/chores] POST error:', error)
    return NextResponse.json({ error: error.message ?? 'Failed to create quest.' }, { status: 500 })
  }

  return NextResponse.json({ chore: data }, { status: 201 })
}

// ── PATCH /api/chores ────────────────────────────────────────────────────────

/**
 * Updates an existing chore. GM-only.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const auth = await authenticateGM(supabase)
  if (auth.error) return auth.error

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = UpdateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { id, ...updates } = result.data

  const { data, error } = await supabase
    .from('chores')
    .update(updates)
    .eq('id', id)
    .eq('household_id', auth.user.household_id)
    .select(CHORE_COLUMNS)
    .single()

  if (error) {
    console.error('[api/chores] PATCH error:', error)
    return NextResponse.json({ error: error.message ?? 'Failed to update quest.' }, { status: 500 })
  }

  return NextResponse.json({ chore: data })
}

// ── DELETE /api/chores ───────────────────────────────────────────────────────

/**
 * Deactivates a chore (soft-delete: sets is_active=false). GM-only.
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const auth = await authenticateGM(supabase)
  if (auth.error) return auth.error

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = DeactivateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { id } = result.data

  const { error } = await supabase
    .from('chores')
    .update({ is_active: false })
    .eq('id', id)
    .eq('household_id', auth.user.household_id)

  if (error) {
    console.error('[api/chores] DELETE error:', error)
    return NextResponse.json({ error: error.message ?? 'Failed to deactivate quest.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
