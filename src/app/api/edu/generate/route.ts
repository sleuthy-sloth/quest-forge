import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateEduChallenges, type EduSubject, type AgeTier } from '@/lib/ai/edu'

export const maxDuration = 60

const SUBJECTS = ['math', 'reading', 'science', 'history', 'vocabulary', 'logic'] as const
const AGE_TIERS = ['junior', 'senior'] as const

const Schema = z.object({
  subject: z.enum(SUBJECTS),
  age_tier: z.enum(AGE_TIERS),
  count: z.number().int().min(1).max(15).optional().default(5),
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
  const t0 = Date.now()
  console.log('[edu/generate] ▶ handler start')

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }
    console.log(`[edu/generate] ▶ auth OK +${Date.now() - t0}ms`)

    // ── Parse body ───────────────────────────────────────────────────────────
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
      console.warn('[edu/generate] No AI provider configured — returning empty for DB fallback')
      return NextResponse.json({ questions: [] })
    }
    console.log(`[edu/generate] ▶ providers: openrouter=${hasOpenRouter} gemini=${hasGemini} subject=${subject} tier=${age_tier} count=${count} +${Date.now() - t0}ms`)

    // ── Generate ─────────────────────────────────────────────────────────────
    // 20s timeout — generous for 5 questions
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn(`[edu/generate] ✗ generation timed out after 20s`)
        resolve(null)
      }, 20_000),
    )

    console.log(`[edu/generate] ▶ calling generateEduChallenges +${Date.now() - t0}ms`)

    let generated: Awaited<ReturnType<typeof generateEduChallenges>> | null
    try {
      generated = await Promise.race([
        generateEduChallenges(subject as EduSubject, age_tier as AgeTier, count),
        timeoutPromise,
      ])
    } catch (err) {
      console.error(`[edu/generate] ✗ generation threw +${Date.now() - t0}ms:`, err)
      generated = null
    }

    console.log(`[edu/generate] ▶ generation done, got ${generated?.length ?? 0} questions +${Date.now() - t0}ms`)

    if (!generated || generated.length === 0) {
      return NextResponse.json({ questions: [] })
    }

    // ── Persist ──────────────────────────────────────────────────────────────
    let admin
    try {
      admin = getAdminClient()
    } catch (err) {
      console.error('[edu/generate] ✗ admin client unavailable:', err)
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
      console.error('[edu/generate] ✗ failed to persist AI questions:', insertError)
      return NextResponse.json({ questions: [] })
    }

    console.log(`[edu/generate] ✓ persisted ${inserted.length} ${subject}/${age_tier} questions in ${Date.now() - t0}ms`)
    return NextResponse.json({ questions: inserted })
  } catch (err) {
    // Top-level safety net — should never reach here, but if it does we want
    // to see exactly what blew up instead of a mysterious Duration: 0ms.
    console.error(`[edu/generate] ✗ UNHANDLED ERROR after ${Date.now() - t0}ms:`, err)
    return NextResponse.json({ questions: [] })
  }
}
