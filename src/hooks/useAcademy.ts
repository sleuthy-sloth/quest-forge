'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EduChallenge {
  id: string
  title: string
  subject: string
  age_tier: 'junior' | 'senior'
  difficulty: number
  xp_reward: number
  content: {
    question: string
    options: string[]
    correct_answer: string
    explanation?: string
    type?: string
  }
}

export interface UseAcademyResult {
  /** Currently loaded challenge set (up to 10). */
  challenges: EduChallenge[]
  /** Whether challenges are still being fetched. */
  loading: boolean
  /** Human-readable error, or null when OK. */
  error: string | null
  /** Derived age tier for the current player. */
  ageTier: 'junior' | 'senior'
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

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAcademy(
  userId: string | null,
  householdId: string | null,
): UseAcademyResult {
  const supabase = useMemo(() => createClient(), [])

  const [challenges, setChallenges] = useState<EduChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ageTier, setAgeTier] = useState<'junior' | 'senior'>('junior')
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
      if (data) setAgeTier(deriveAgeTier(data.age))
    })()
  }, [userId, supabase])

  // ── Fetch challenges ──────────────────────────────────────────────────────

  const fetchChallenges = useCallback(async (subject?: string) => {
    setLoading(true)
    setError(null)
    setSessionCorrect(0)
    setSessionXp(0)

    try {
      let query = supabase
        .from('edu_challenges')
        .select('id, title, subject, age_tier, difficulty, xp_reward, content')
        .eq('age_tier', ageTier)
        .eq('is_active', true)
        .order('id')
        .limit(50)

      if (subject) query = query.eq('subject', subject as never)

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError('Failed to load challenges')
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setError('No challenges available')
        setLoading(false)
        return
      }

      setChallenges(shuffle(data as EduChallenge[]).slice(0, 10))
      setLoading(false)
    } catch {
      setError('Failed to load challenges')
      setLoading(false)
    }
  }, [supabase, ageTier])

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

      // Insert completion  →  DB trigger awards XP + deals boss damage
      await supabase.from('edu_completions').insert({
        household_id: householdId,
        challenge_id: challengeId,
        player_id: userId,
        score: correct ? 1 : 0,
        completed_at: new Date().toISOString(),
        xp_awarded: xpToAward,
      })
    } catch {
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
