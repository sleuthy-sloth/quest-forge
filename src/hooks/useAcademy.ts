'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EduChallenge {
  id: string
  title?: string
  subject?: string
  age_tier?: 'junior' | 'senior'
  difficulty?: number
  xp_reward: number
  content: {
    question: string
    options: string[]
    correct_answer: string
    explanation?: string
    type?: string
  }
}

export type QuestionSource = 'ai' | 'db' | 'fallback'

export interface UseAcademyResult {
  /** Currently loaded challenge set (up to 10). */
  challenges: EduChallenge[]
  /** Where the loaded challenges came from (null until first fetch resolves). */
  source: QuestionSource | null
  /** Whether challenges are still being fetched. */
  loading: boolean
  /** Human-readable error, or null when OK. */
  error: string | null
  /** Derived age tier for the current player. Null until profile age loads. */
  ageTier: 'junior' | 'senior' | null
  /** Running count of correct answers in this session. */
  sessionCorrect: number
  /** Running XP earned this session (sum of xp_reward for correct answers). */
  sessionXp: number
  /** True while a submitAnswer call is in-flight (prevents double-submission). */
  submitting: boolean
  /** Fetch a fresh random set of 10 challenges, optionally filtered by subject. */
  fetchChallenges: (subject?: string) => Promise<void>
  /**
   * Record an answer and, if correct, award XP.
   *
   * Inserts a row into edu_completions. The DB trigger
   * `handle_edu_completed` automatically updates profiles.xp_total /
   * xp_available, deals boss damage, and recalculates the player’s level.
   *
   * Callers should NOT manually update XP or boss HP — the trigger
   * handles it atomically.
   */
  submitAnswer: (challengeId: string, correct: boolean) => Promise<void>
  /** Reset session counters (does not re-fetch). */
  resetSession: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveAgeTier(age: number | null): 'junior' | 'senior' {
  if (age === null || age <= 10) return 'junior'
  return 'senior'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAcademy(
  userId: string | null,
  householdId: string | null,
): UseAcademyResult {
  const supabase = useMemo(() => createClient(), [])

  const [challenges, setChallenges] = useState<EduChallenge[]>([])
  const [source, setSource] = useState<QuestionSource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ageTier, setAgeTier] = useState<'junior' | 'senior' | null>(null)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const submittingRef = useRef(false)

  // ── Derive age_tier from profile ──────────────────────────────────────────

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('age')
        .eq('id', userId)
        .single()
      // Fallback to 'junior' if profile fetch fails — ensures questions
      // can still load even if the profiles RLS or query has an issue.
      setAgeTier(data ? deriveAgeTier(data.age) : 'junior')
    })()
  }, [userId, supabase])

  // ── Fetch challenges ──────────────────────────────────────────────────────
  // Mirrors the arena-game pattern: tries AI generation first (which now
  // persists into edu_challenges and returns real UUIDs), then the seeded DB
  // via the server proxy route — bypasses the browser-side Supabase REST hang
  // that affected direct queries.

  const fetchChallenges = useCallback(async (subject?: string) => {
    if (!ageTier) return // age not yet loaded; caller should wait
    setLoading(true)
    setError(null)
    setSource(null)
    setSessionCorrect(0)
    setSessionXp(0)

    // Quiz-style games (Reading, History, Vocab, Logic) always pass `subject`.
    // Without it we can't sensibly call the AI generator.
    const aiPromise: Promise<EduChallenge[] | null> = subject
      ? fetch('/api/edu/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, age_tier: ageTier, count: 10 }),
          signal: AbortSignal.timeout(9000),
        })
          .then(async (res) => {
            if (!res.ok) return null
            const json = (await res.json()) as { questions?: EduChallenge[] }
            return json.questions && json.questions.length >= 5 ? json.questions : null
          })
          .catch(() => null)
      : Promise.resolve(null)

    const dbPromise: Promise<EduChallenge[] | null> = (async () => {
      try {
        const params = new URLSearchParams({ age_tier: ageTier, count: '10' })
        if (subject) params.set('subject', subject)
        const res = await fetch(`/api/edu/challenges?${params.toString()}`, {
          signal: AbortSignal.timeout(12000),
        })
        if (!res.ok) {
          console.error('[useAcademy] API route error:', res.status)
          return null
        }
        const json = (await res.json()) as { questions?: EduChallenge[] }
        if (!json.questions || json.questions.length === 0) return null
        return json.questions
      } catch (err) {
        console.error('[useAcademy] API route threw:', err)
        return null
      }
    })()

    const overallTimeout: Promise<never> = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 16_000),
    )

    try {
      const aiResults = await Promise.race([aiPromise, overallTimeout])
      if (aiResults) {
        setChallenges(shuffle(aiResults).slice(0, 10))
        setSource('ai')
        setLoading(false)
        return
      }

      const dbResults = await Promise.race<EduChallenge[] | null>([dbPromise, overallTimeout])
      if (dbResults) {
        setChallenges(shuffle(dbResults).slice(0, 10))
        setSource('db')
        setLoading(false)
        return
      }

      setError('No challenges available')
      setLoading(false)
    } catch {
      setError('Failed to load challenges')
      setLoading(false)
    }
  }, [ageTier])

  // ── Submit answer ─────────────────────────────────────────────────────────

  const submitAnswer = useCallback(async (
    challengeId: string,
    correct: boolean,
  ) => {
    // Guard: prevent rapid double-clicks (ref is instant, state follows)
    if (submittingRef.current) return
    if (!householdId || !userId) return

    submittingRef.current = true
    setSubmitting(true)

    try {
      const challenge = challenges.find(c => c.id === challengeId)
      if (!challenge) return

      const xpToAward = correct ? challenge.xp_reward : 0

      // Track session stats client-side for UI display
      if (correct) {
        setSessionCorrect(prev => prev + 1)
        setSessionXp(prev => prev + xpToAward)
      }

      // Skip persistence if the id isn't a UUID — protects against the FK
      // violation that would silently abort the save.
      if (!UUID_RE.test(challengeId)) return

      // Insert completion  →  DB trigger awards XP + deals boss damage
      const { error: insertError } = await supabase.from('edu_completions').insert({
        household_id: householdId,
        challenge_id: challengeId,
        player_id: userId,
        score: correct ? 1 : 0,
        completed_at: new Date().toISOString(),
        xp_awarded: xpToAward,
      })
      if (insertError) {
        console.error('[useAcademy] edu_completions insert failed:', insertError)
        setError('Failed to save answer')
      }
    } catch (err) {
      console.error('[useAcademy] edu_completions insert threw:', err)
      setError('Failed to save answer')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [challenges, householdId, userId, supabase])

  // ── Reset ─────────────────────────────────────────────────────────────────

  const resetSession = useCallback(() => {
    setSessionCorrect(0)
    setSessionXp(0)
    setError(null)
  }, [])

  return {
    challenges,
    source,
    loading,
    error,
    ageTier,
    sessionCorrect,
    sessionXp,
    submitting,
    fetchChallenges,
    submitAnswer,
    resetSession,
  }
}
