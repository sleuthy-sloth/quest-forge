// src/app/api/chores/reject/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const Schema = z.object({
  completionId: z.string().uuid('completionId must be a valid UUID'),
})

/**
 * POST /api/chores/reject
 *
 * Rejects a pending chore completion by deleting the row.
 * No audit trail is kept. The player can resubmit the chore.
 * The optional reject reason (if any) is UI-only and is never sent here.
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

  const { error } = await supabase
    .from('chore_completions')
    .delete()
    .eq('id', completionId)
    .eq('household_id', profile.household_id)

  if (error) {
    console.error('[reject] delete error:', error)
    return NextResponse.json({ error: 'Failed to reject completion.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
