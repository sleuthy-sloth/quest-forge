import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateFlavorText } from '@/lib/ai/flavor'

export const maxDuration = 60

const Schema = z.object({
  questTitle: z.string().min(1, 'Title is required').max(200),
  questDescription: z.string().max(1000).optional().default(''),
})

/**
 * POST /api/quests/flavor
 *
 * Generates fantasy flavor text for a GM-authored quest. Reuses the
 * chores flavor pipeline (OpenRouter AI → keyword-template fallback) so
 * both surfaces share one prompt and one rate-limit pool.
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
    .select('role')
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

  const { questTitle, questDescription } = result.data
  const flavorText = await generateFlavorText(questTitle, questDescription)
  return NextResponse.json({ flavorText })
}
