import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateFlavorText } from '@/lib/gemini/flavor'

const Schema = z.object({
  choreTitle: z.string().min(1, 'Title is required').max(200),
  choreDescription: z.string().max(500).optional().default(''),
})

/**
 * POST /api/chores/flavor
 *
 * Generates fantasy quest flavor text for a chore via Gemini Flash.
 * Falls back to the keyword-matched template bank if rate-limited or on error.
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

  const { choreTitle, choreDescription } = result.data
  const flavorText = await generateFlavorText(choreTitle, choreDescription)

  return NextResponse.json({ flavorText })
}
