// src/app/api/chores/approve/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const Schema = z.object({
  completionId: z.string().uuid('completionId must be a valid UUID'),
})

/**
 * POST /api/chores/approve
 *
 * Approves a pending chore completion.
 * - Copies xp_reward + gold_reward from the parent chore into xp_awarded/gold_awarded.
 * - Sets verified=true and verified_at=now() in one UPDATE.
 * - The handle_chore_verified DB trigger fires and awards XP, gold, and boss damage.
 *
 * Protected: GM role required.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { completionId } = result.data

  // Fetch completion + parent chore rewards in one query.
  // The .eq('verified', false) guard prevents double-approval.
  const { data: completion, error: fetchError } = await supabase
    .from('chore_completions')
    .select('id, chores!chore_id(xp_reward, gold_reward)')
    .eq('id', completionId)
    .eq('household_id', profile.household_id)
    .eq('verified', false)
    .single()

  if (fetchError || !completion) {
    return NextResponse.json(
      { error: 'Completion not found or already approved.' },
      { status: 404 }
    )
  }

  // Extract rewards — TypeScript types the join as an object or null.
  const chore = completion.chores as { xp_reward: number; gold_reward: number } | null
  const xpAwarded   = chore?.xp_reward   ?? 0
  const goldAwarded = chore?.gold_reward ?? 0

  // Single UPDATE: populates awards + flips verified=true in one operation.
  // The handle_chore_verified trigger fires here and awards xp/gold/boss damage.
  // .eq('verified', false) closes the TOCTOU window: two concurrent approvals
  // for the same row both pass the SELECT, but only the first UPDATE matches.
  const { data: updated, error: updateError } = await supabase
    .from('chore_completions')
    .update({
      verified:     true,
      verified_at:  new Date().toISOString(),
      xp_awarded:   xpAwarded,
      gold_awarded: goldAwarded,
    })
    .eq('id', completionId)
    .eq('household_id', profile.household_id)
    .eq('verified', false)
    .select('id')

  if (updateError) {
    console.error('[approve] update error:', updateError)
    return NextResponse.json({ error: 'Failed to approve completion.' }, { status: 500 })
  }

  if (!updated || updated.length === 0) {
    return NextResponse.json(
      { error: 'Completion not found or already approved.' },
      { status: 409 }
    )
  }

  return NextResponse.json({ success: true, xpAwarded, goldAwarded })
}
