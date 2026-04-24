import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateVictoryNarrative } from '@/lib/ai/story'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const Schema = z.object({
  chapterId: z.string().uuid('Invalid chapter ID'),
})

// ---------------------------------------------------------------------------
// POST /api/story/generate
// ---------------------------------------------------------------------------

/**
 * Generates a cinematic victory narrative when a weekly boss is defeated.
 *
 * Flow:
 * 1. Authenticate the caller (any household member can trigger — the trigger
 *    naturally fires from the player's BossArena when HP hits 0).
 * 2. Look up the story_chapters row and verify it belongs to the caller's
 *    household.
 * 3. If the chapter already has a narrative, return it (idempotent).
 * 4. Fetch all players in the household and their class data.
 * 5. Generate a 3–4 paragraph victory narrative via AI.
 * 6. Persist the narrative to story_chapters.narrative_text for future loads.
 * 7. Return the narrative.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'You must be logged in to generate a story.' },
      { status: 401 },
    )
  }

  // ── Parse body ───────────────────────────────────────────────────────

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 },
    )
  }

  const { chapterId } = result.data

  // ── Fetch caller's profile ───────────────────────────────────────────

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json(
      { error: 'Profile not found.' },
      { status: 403 },
    )
  }

  const householdId = profile.household_id

  // ── Fetch the story chapter and verify household ─────────────────────

  const { data: chapter, error: chapterError } = await supabase
    .from('story_chapters')
    .select('*')
    .eq('id', chapterId)
    .eq('household_id', householdId)
    .single()

  if (chapterError || !chapter) {
    return NextResponse.json(
      {
        error:
          'Chapter not found or does not belong to your household.',
      },
      { status: 404 },
    )
  }

  // ── Idempotency: return existing narrative if already generated ──────

  if (chapter.narrative_text && chapter.narrative_text.trim()) {
    return NextResponse.json({ narrative: chapter.narrative_text })
  }

  // ── Fetch all players in the household ───────────────────────────────

  const { data: players, error: playersError } = await supabase
    .from('profiles')
    .select('display_name, avatar_class')
    .eq('household_id', householdId)
    .eq('role', 'player')

  if (playersError) {
    return NextResponse.json(
      { error: 'Failed to fetch household players.' },
      { status: 500 },
    )
  }

  // ── Generate ─────────────────────────────────────────────────────────

  const narrative = await generateVictoryNarrative(
    {
      name: chapter.boss_name ?? 'The Unknown Threat',
      description: chapter.boss_description,
      weekNumber: chapter.week_number,
    },
    players.map((p) => ({
      displayName: p.display_name,
      avatarClass: p.avatar_class,
    })),
  )

  // ── Persist ──────────────────────────────────────────────────────────

  const { error: updateError } = await supabase
    .from('story_chapters')
    .update({ narrative_text: narrative })
    .eq('id', chapterId)

  if (updateError) {
    console.error('[story] Failed to persist narrative:', updateError.message)
    // Still return the narrative — it was generated successfully
  }

  return NextResponse.json({ narrative })
}
