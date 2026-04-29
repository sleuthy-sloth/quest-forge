import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateOpeningNarrative } from '@/lib/ai/story'
import bossesRaw from '@/lore/bosses.json'

export const maxDuration = 60

const Schema = z.object({
  chapterId: z.string().uuid('Invalid chapter ID'),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { chapterId } = result.data

  // Fetch profile to get household_id and verify GM role
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') {
    return NextResponse.json({ error: 'Only GMs can generate intros.' }, { status: 403 })
  }

  // Fetch chapter
  const { data: chapter, error: chapterError } = await supabase
    .from('story_chapters')
    .select('*')
    .eq('id', chapterId)
    .eq('household_id', profile.household_id)
    .single()

  if (chapterError || !chapter) {
    return NextResponse.json({ error: 'Chapter not found.' }, { status: 404 })
  }

  // Find region/arc context from lore
  const loreBoss = (bossesRaw.bosses as any[]).find(b => b.week === chapter.week_number)
  const loreArc = loreBoss ? (bossesRaw.arcs as any[]).find(a => a.arc_number === loreBoss.arc) : null

  const narrative = await generateOpeningNarrative(
    {
      name: chapter.boss_name ?? 'The Unknown Threat',
      description: chapter.boss_description,
      weekNumber: chapter.week_number,
    },
    loreArc?.region ?? 'Embervale',
    loreArc?.name ?? 'The Saga'
  )

  // We don't persist automatically here; the GM can edit/save from the UI
  return NextResponse.json({ narrative })
}
