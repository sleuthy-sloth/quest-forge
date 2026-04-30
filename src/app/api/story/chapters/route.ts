import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withApiMiddleware } from '@/lib/api/middleware'

const ToggleSchema = z.object({
  id: z.string().uuid(),
  is_unlocked: z.boolean(),
})

/**
 * GET /api/story/chapters
 *
 * Returns all story chapters for the current user's household,
 * ordered by sequence_order. Uses server-side Supabase (reliable)
 * to avoid browser-side Supabase REST connection issues.
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

  const { data, error } = await supabase
    .from('story_chapters')
    .select('id, title, content, sequence_order, is_unlocked')
    .eq('household_id', profile.household_id)
    .order('sequence_order', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('[api/story/chapters] DB error:', error)
    return NextResponse.json({ chapters: [] })
  }

  return NextResponse.json({ chapters: data ?? [] })
}

/**
 * PATCH /api/story/chapters
 *
 * Toggles a chapter's is_unlocked status. GM-only.
 */
export async function PATCH(request: NextRequest) {
  const err = await withApiMiddleware(request, { rateLimit: { maxRequests: 30 }, csrf: true })
  if (err) return err

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

  const result = ToggleSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { id, is_unlocked } = result.data

  const { error } = await supabase
    .from('story_chapters')
    .update({ is_unlocked })
    .eq('id', id)
    .eq('household_id', profile.household_id)

  if (error) {
    console.error('[api/story/chapters] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update chapter.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
