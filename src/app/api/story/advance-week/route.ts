import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOpeningNarrative } from '@/lib/ai/story'
import bossesRaw from '@/lore/bosses.json'
import { withApiMiddleware } from '@/lib/api/middleware'

export const maxDuration = 60

/**
 * POST /api/story/advance-week
 *
 * GM-only: Advances the household's story to the next locked chapter.
 * 1. Finds the earliest locked chapter that is the "next" one to unlock
 * 2. Generates an opening narrative via AI
 * 3. Sets the chapter as unlocked
 * 4. Returns the unlocked chapter data
 */
export async function POST() {
  const err = await withApiMiddleware(new Request('http://localhost'), { rateLimit: { maxRequests: 10 }, csrf: false, bodyLimit: false })
  if (err) return err

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  // ── Verify GM role ────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') {
    return NextResponse.json({ error: 'Only Game Masters can advance the story.' }, { status: 403 })
  }

  const { household_id: householdId } = profile

  // ── Find the next locked chapter ──────────────────────────────────────
  // The next chapter is the one with the lowest week_number where
  // is_unlocked = false AND (boss_current_hp = 0 OR boss_current_hp IS NULL).
  // This means the boss has been defeated and the chapter is ready to unlock.
  // If boss HP > 0, the boss is still active — cannot advance.
  const { data: unlockedChapters } = await supabase
    .from('story_chapters')
    .select('week_number')
    .eq('household_id', householdId)
    .eq('is_unlocked', true)
    .order('week_number', { ascending: true })

  const currentMaxWeek = unlockedChapters?.length
    ? Math.max(...unlockedChapters.map(c => c.week_number))
    : -1

  // Next chapter: first locked chapter with week_number > currentMaxWeek
  const { data: nextChapter, error: findError } = await supabase
    .from('story_chapters')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_unlocked', false)
    .gt('week_number', currentMaxWeek)
    .order('week_number', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (findError) {
    return NextResponse.json({ error: 'Failed to find next chapter.' }, { status: 500 })
  }

  if (!nextChapter) {
    return NextResponse.json({ error: 'No more chapters to unlock.' }, { status: 400 })
  }

  // This chapter's boss must be defeated (HP = 0 or no boss)
  const bossActive = nextChapter.boss_name && (nextChapter.boss_current_hp ?? 0) > 0
  if (bossActive) {
    return NextResponse.json({
      error: `Cannot advance — "${nextChapter.boss_name}" is still active. Defeat the boss first.`,
    }, { status: 400 })
  }

  // ── Generate opening narrative ────────────────────────────────────────
  let narrative = nextChapter.narrative_text ?? ''

  try {
    const loreBoss = (bossesRaw.bosses as Array<{ week: number; arc: number; name: string; description: string }>)
      .find(b => b.week === nextChapter.week_number)
    const loreArc = loreBoss
      ? (bossesRaw.arcs as Array<{ arc_number: number; name: string; region: string }>)
          .find(a => a.arc_number === loreBoss.arc)
      : null

    const generated = await generateOpeningNarrative(
      {
        name: nextChapter.boss_name ?? 'The Unknown Threat',
        description: nextChapter.boss_description,
        weekNumber: nextChapter.week_number,
      },
      loreArc?.region ?? 'Embervale',
      loreArc?.name ?? 'The Saga',
    )

    if (generated) {
      narrative = generated
    }
  } catch (err) {
    console.warn('[advance-week] AI generation failed, using fallback:', err)
    // Use existing narrative_text as fallback
  }

  // ── Unlock the chapter ────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('story_chapters')
    .update({
      is_unlocked: true,
      narrative_text: narrative,
    })
    .eq('id', nextChapter.id)
    .eq('household_id', householdId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to unlock chapter.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    chapter: {
      id: nextChapter.id,
      title: nextChapter.title,
      week_number: nextChapter.week_number,
      narrative_text: narrative,
    },
  })
}