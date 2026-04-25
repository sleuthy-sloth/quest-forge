import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateEduChallenges, type EduSubject, type AgeTier } from '@/lib/ai/edu'

const SUBJECTS = ['math', 'reading', 'science', 'history', 'vocabulary', 'logic'] as const
const AGE_TIERS = ['junior', 'senior'] as const

const Schema = z.object({
  subject: z.enum(SUBJECTS),
  age_tier: z.enum(AGE_TIERS),
  count: z.number().int().min(1).max(15).optional().default(10),
})

/**
 * POST /api/edu/generate
 *
 * Returns a fresh batch of AI-generated quiz questions. Authenticated kids
 * (player role) can call this from the academy game pages. The handler
 * returns 200 with `{ questions: [...] }` on success, or `{ questions: [] }`
 * when AI is unavailable / rate-limited so the client falls back to the
 * seeded edu_challenges DB rows.
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

  // 8s timeout — if Gemini stalls we want the client to fall through to its
  // DB-backed seed rather than hang the academy "Preparing the arena…" UI.
  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 8000),
  )
  const generationPromise = generateEduChallenges(
    subject as EduSubject,
    age_tier as AgeTier,
    count,
  )

  let questions
  try {
    questions = await Promise.race([generationPromise, timeoutPromise])
  } catch (err) {
    console.error('[edu/generate] generation threw:', err)
    questions = null
  }

  return NextResponse.json({ questions: questions ?? [] })
}
