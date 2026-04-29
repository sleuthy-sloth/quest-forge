import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const SUBJECTS = ['math', 'reading', 'science', 'history', 'vocabulary', 'logic'] as const
const AGE_TIERS = ['junior', 'senior'] as const

const Schema = z.object({
  subject: z.enum(SUBJECTS),
  age_tier: z.enum(AGE_TIERS),
  count: z.coerce.number().int().min(1).max(15).optional().default(10),
})

/**
 * GET /api/edu/challenges?subject=math&age_tier=junior&count=10
 *
 * Fetches a random batch of quiz questions from the edu_challenges table.
 * Uses the server-side Supabase client (which reliably connects) to bypass
 * browser-side Supabase REST connection issues.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const subject = searchParams.get('subject')
  const ageTier = searchParams.get('age_tier')
  const countStr = searchParams.get('count')

  const result = Schema.safeParse({ subject, age_tier: ageTier, count: countStr })
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { subject: subj, age_tier: tier, count } = result.data

  // Optional comma-separated list of IDs to exclude (used for second-batch deduplication)
  const excludeParam = searchParams.get('exclude')
  const excludeIds = excludeParam
    ? excludeParam.split(',').map(s => s.trim()).filter(s => /^[0-9a-f-]{36}$/i.test(s))
    : []

  try {
    let query = supabase
      .from('edu_challenges')
      .select('id, title, content, xp_reward')
      .eq('subject', subj)
      .eq('age_tier', tier)
      .eq('is_active', true)

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      console.error('[api/edu/challenges] DB error:', error)
      return NextResponse.json({ questions: [] })
    }

    if (!data || data.length === 0) {
      console.warn('[api/edu/challenges] No rows for', subj, tier)
      return NextResponse.json({ questions: [] })
    }

    // Shuffle and slice
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, count)
    return NextResponse.json({ questions: shuffled })
  } catch (err) {
    console.error('[api/edu/challenges] threw:', err)
    return NextResponse.json({ questions: [] })
  }
}
