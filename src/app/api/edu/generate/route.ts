import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateEduChallenges, type EduSubject, type AgeTier } from '@/lib/ai/edu'

export const maxDuration = 60;

const SUBJECTS = ['math', 'reading', 'science', 'history', 'vocabulary', 'logic'] as const
const AGE_TIERS = ['junior', 'senior'] as const

const Schema = z.object({
  subject: z.enum(SUBJECTS),
  age_tier: z.enum(AGE_TIERS),
  count: z.number().int().min(1).max(15).optional().default(10),
})

/**
 * Difficulty heuristic: senior tiers are harder than junior. Also, the AI
 * varies xp_reward 15–40, so map xp into the 1–5 difficulty bucket required
 * by the edu_challenges schema.
 */
function deriveDifficulty(xpReward: number, ageTier: AgeTier): number {
  const base = ageTier === 'senior' ? 3 : 2
  if (xpReward >= 38) return Math.min(5, base + 2)
  if (xpReward >= 30) return Math.min(5, base + 1)
  if (xpReward >= 22) return base
  if (xpReward >= 17) return Math.max(1, base - 1)
  return Math.max(1, base - 2)
}

/**
 * POST /api/edu/generate
 *
 * Generates a fresh batch of quiz questions via the AI client AND persists
 * them into the `edu_challenges` table so subsequent inserts into
 * `edu_completions` (which has a UUID FK to `edu_challenges.id`) can succeed.
 *
 * Returns 200 with `{ questions: [...] }` (each question has a real UUID `id`)
 * on success, or `{ questions: [] }` when AI is unavailable / rate-limited so
 * the client falls back to seeded `edu_challenges` rows.
 */
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

  const { subject, age_tier, count } = result.data

  // Log which AI providers are configured on each request for debuggability
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY
  const hasGemini     = !!process.env.GEMINI_API_KEY
  if (!hasOpenRouter && !hasGemini) {
    console.warn('[edu/generate] No AI provider configured (OPENROUTER_API_KEY and GEMINI_API_KEY both missing) — returning empty for DB fallback')
    return NextResponse.json({ questions: [] })
  }
  console.log(`[edu/generate] providers: openrouter=${hasOpenRouter} gemini=${hasGemini} subject=${subject} tier=${age_tier}`)


  // 25s timeout — OpenRouter (primary) + Gemini (fallback) both get a chance
  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 25_000),
  )
  const generationPromise = generateEduChallenges(
    subject as EduSubject,
    age_tier as AgeTier,
    count,
  )

  let generated
  try {
    generated = await Promise.race([generationPromise, timeoutPromise])
  } catch (err) {
    console.error('[edu/generate] generation threw:', err)
    generated = null
  }

  if (!generated || generated.length === 0) {
    return NextResponse.json({ questions: [] })
  }

  // Persist into edu_challenges so the FK in edu_completions resolves.
  // Uses the admin client because edu_challenges has no INSERT RLS policy
  // (the table is meant to be seed/service-managed).
  let admin
  try {
    admin = getAdminClient()
  } catch (err) {
    console.error('[edu/generate] admin client unavailable; cannot persist AI questions:', err)
    return NextResponse.json({ questions: [] })
  }

  const rows = generated.map((q) => ({
    title: q.title,
    subject: subject as EduSubject,
    age_tier: age_tier as AgeTier,
    difficulty: deriveDifficulty(q.xp_reward, age_tier as AgeTier),
    xp_reward: q.xp_reward,
    challenge_type: 'ai_generated' as const,
    content: q.content,
    is_active: true,
  }))

  const { data: inserted, error: insertError } = await admin
    .from('edu_challenges')
    .insert(rows)
    .select('id, title, content, xp_reward')

  if (insertError || !inserted) {
    console.error('[edu/generate] failed to persist AI questions:', insertError)
    return NextResponse.json({ questions: [] })
  }

  console.log(`[edu/generate] persisted ${inserted.length} ${subject}/${age_tier} questions`)
  return NextResponse.json({ questions: inserted })
}
