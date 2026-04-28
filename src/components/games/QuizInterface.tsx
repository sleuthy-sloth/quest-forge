'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAcademy } from '@/hooks/useAcademy'
import BattleArena, { type BattleArenaHandle } from '@/components/games/BattleArena'
import CelebrationEffect from '@/components/games/CelebrationEffect'
import { ENEMY_PRESETS, DEFAULT_AVATAR_CONFIG } from '@/lib/constants/enemies'
import { SUBJECT_TO_SLUG, SLUG_PRESET, TEACHER_BY_SLUG } from '@/lib/constants/academy'
import type { AvatarConfig } from '@/types/avatar'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = 'loading' | 'playing' | 'results'
type Feedback = null | 'correct' | 'wrong'
type Flash = 'green' | 'red' | null

interface Props {
  /** Auth user id (also profiles.id). */
  userId: string
  /** Household id for scoping inserts. */
  householdId: string
  /** Optional subject filter — omit for mixed-mode quiz. */
  subject?: string
  /** Player display info for the arena bar. */
  avatarConfig?: Record<string, unknown> | null
  displayName?: string
  /** Animation preset derived from the player's avatar_class. */
  playerPreset?: import('@/lib/constants/lpc-animations').AnimationPreset
  /** Called after the results screen renders. */
  onComplete?: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function accuracyColor(n: number): string {
  if (n >= 0.8) return '#2eb85c'
  if (n >= 0.6) return '#e8a020'
  return '#e05555'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QuizInterface({
  userId,
  householdId,
  subject,
  avatarConfig,
  displayName,
  onComplete,
  playerPreset = 'warrior',
}: Props) {
  const router = useRouter()
  const {
    challenges,
    source,
    loading: fetching,
    error: fetchError,
    ageTier,
    sessionCorrect,
    sessionXp,
    submitting,
    fetchChallenges,
    submitAnswer,
  } = useAcademy(userId, householdId)

  // ── Phase & playing state ────────────────────────────────────────────────

  const [phase, setPhase] = useState<Phase>('loading')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [chosenWrong, setChosenWrong] = useState<string | null>(null)
  const [flash, setFlash] = useState<Flash>(null)
  const [submissionError, setSubmissionError] = useState(false)
  const [streak, setStreak] = useState(0)
  const [freshProfile, setFreshProfile] = useState<{ xp_total: number; xp_available: number; level: number } | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Celebration effect trigger (incremented when the quiz finishes)
  const [celebrationTick, setCelebrationTick] = useState(0)

  // Battle arena ref for triggering attack animations
  const arenaRef = useRef<BattleArenaHandle>(null)

  // Resolve enemy config from the subject prop
  const enemySlug = subject ? SUBJECT_TO_SLUG[subject] ?? 'reading-tome' : 'reading-tome'
  const enemy = ENEMY_PRESETS[enemySlug] ?? ENEMY_PRESETS['reading-tome']
  const enemyPreset = SLUG_PRESET[enemySlug] ?? 'warrior'
  const teacher = TEACHER_BY_SLUG[enemySlug]

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  function addTimer(id: ReturnType<typeof setTimeout>) {
    timersRef.current.push(id)
  }

  // ── Load challenges when age tier is known ──────────────────────────────
  // fetchChallenges() returns early if ageTier is null, so we only fire it
  // once the hook finishes loading the player's age from the profile.
  // This avoids the race-condition double-fetch that happened when the hook
  // defaulted to 'junior' before the profile age arrived.
  const startedRef = useRef(false)
  useEffect(() => {
    if (!ageTier || startedRef.current) return
    startedRef.current = true
    fetchChallenges(subject)
  }, [ageTier, fetchChallenges, subject])

  // Drain fetching into phase
  useEffect(() => {
    if (!fetching && challenges.length > 0) setPhase('playing')
    if (!fetching && fetchError) setPhase('loading')
  }, [fetching, challenges.length, fetchError])

  // Safety timeout: if still loading after 18 s, force a re-fetch
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (phase !== 'loading' || fetchError || challenges.length > 0) {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
      return
    }
    loadingTimerRef.current = setTimeout(() => {
      startedRef.current = false
      if (phase === 'loading' && !fetching && challenges.length === 0 && !fetchError) {
        fetchChallenges(subject)
      }
    }, 18000)
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
    }
  }, [phase, fetching, challenges.length, fetchError, fetchChallenges, subject])

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current
    return () => { timers.forEach(clearTimeout) }
  }, [])

  // Fetch fresh profile data once results are shown so XP reflects the DB
  useEffect(() => {
    if (phase !== 'results') return
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('xp_total, xp_available, level')
        .eq('id', userId)
        .single()
      if (data) setFreshProfile(data as { xp_total: number; xp_available: number; level: number })
    }, 700)
    return () => clearTimeout(timer)
  }, [phase, supabase, userId])

  // ── Answer handler ───────────────────────────────────────────────────────

  async function handleAnswer(option: string) {
    // Guard: prevent double-submission via feedback state + ref in hook
    if (feedback !== null || submitting) return

    const current = challenges[questionIndex]
    const isCorrect = option === current.content.correct_answer

    if (isCorrect) {
      setStreak(s => Math.min(s + 1, 10))
      setFeedback('correct')
      setFlash('green')
      arenaRef.current?.triggerPlayerAttack()

      addTimer(setTimeout(() => setFlash(null), 350))

      try {
        await submitAnswer(current.id, true)
      } catch {
        setSubmissionError(true)
      }

      addTimer(setTimeout(() => {
        if (questionIndex >= 9) {
          setCelebrationTick(t => t + 1)
          setPhase('results')
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
        }
      }, 1000))
    } else {
      setStreak(0)
      setFeedback('wrong')
      setChosenWrong(option)
      setFlash('red')
      arenaRef.current?.triggerEnemyAttack()

      addTimer(setTimeout(() => setFlash(null), 350))

      try {
        await submitAnswer(current.id, false)
      } catch {
        setSubmissionError(true)
      }

      addTimer(setTimeout(() => {
        if (questionIndex >= 9) {
          setCelebrationTick(t => t + 1)
          setPhase('results')
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
          setChosenWrong(null)
        }
      }, 3500)) // longer delay so player can read explanation
    }
  }

  // ── Retry / Replay ───────────────────────────────────────────────────────

  const handleRetry = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setQuestionIndex(0)
    setFeedback(null)
    setChosenWrong(null)
    setFlash(null)
    setSubmissionError(false)
    setPhase('loading')
    fetchChallenges(subject)
  }, [fetchChallenges, subject])

  const handleBack = useCallback(() => {
    router.refresh()
    if (onComplete) onComplete()
    else router.push('/play/academy')
  }, [onComplete, router])

  // ── Loading ──────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        {fetchError ? (
          <>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                color: '#c9a84c',
                marginBottom: '16px',
              }}
            >
              {fetchError}
            </div>
            <button
              onClick={handleRetry}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: '#f0e6c8',
                background: 'linear-gradient(135deg,#c43a00,#8b1e00)',
                border: '1px solid rgba(196,58,0,0.5)',
                borderRadius: '3px',
                padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              TRY AGAIN
            </button>
          </>
        ) : (
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: '#c9a84c',
              letterSpacing: '2px',
            }}
          >
            Preparing your quest…
          </div>
        )}
      </div>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────────

  if (phase === 'results') {
    const correctCount = sessionCorrect

    return (
      <div className="px-4 py-6" style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
        <CelebrationEffect trigger={celebrationTick} />

        {/* Submission error toast */}
        {submissionError && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: '#e05555',
              background: 'rgba(224,85,85,0.1)',
              border: '1px solid rgba(224,85,85,0.3)',
              borderRadius: '3px',
              padding: '8px 12px',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            Some results may not have saved — check your connection.
          </div>
        )}

        <div
          style={{
            background: 'linear-gradient(180deg,#0d0f1c,#070910)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '4px',
            padding: '16px 14px',
            marginBottom: '12px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: '#7a6a44',
                  marginBottom: '4px',
                  letterSpacing: '1px',
                }}
              >
                QUIZ COMPLETE
              </div>
              <div
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: '#f0e6c8' }}
              >
                {correctCount} / {questions.length}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  color: '#7a6a44',
                  marginTop: '2px',
                }}
              >
                +{sessionXp} XP earned
              </div>
              {freshProfile && (
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#c9a84c', marginTop: '4px', letterSpacing: '0.1em' }}>
                  LV {freshProfile.level} · {freshProfile.xp_available.toLocaleString()} XP available
                </div>
              )}
            </div>
            <div
              style={{
                background: `rgba(${correctCount >= 8 ? '46,184,92' : correctCount >= 6 ? '232,160,32' : '224,85,85'},0.12)`,
                border: `1px solid rgba(${correctCount >= 8 ? '46,184,92' : correctCount >= 6 ? '232,160,32' : '224,85,85'},0.4)`,
                borderRadius: '3px',
                padding: '8px 12px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: accuracyColor(questions.length ? correctCount / questions.length : 0),
              }}
            >
              {Math.round((questions.length ? correctCount / questions.length : 0) * 100)}%
            </div>
          </div>

          {/* Answers log */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', gap: '4px',
              marginBottom: '12px', maxHeight: '280px', overflowY: 'auto',
            }}
          >
            {challenges.map((q, i) => (
              <div
                key={q.id}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '2px',
                  background: 'rgba(26,28,46,0.8)',
                  borderLeft: '2px solid rgba(201,168,76,0.3)',
                  borderRadius: '0 2px 2px 0',
                  padding: '5px 8px',
                }}
              >
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#b09a6e' }}>
                  {i + 1}. {q.content.question}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    color: '#7a6a44',
                  }}
                >
                  Answer: {q.content.correct_answer}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={handleRetry}
              style={{
                width: '100%',
                padding: '11px',
                background: 'linear-gradient(135deg,#c43a00,#8b1e00)',
                border: '1px solid rgba(196,58,0,0.5)',
                borderRadius: '3px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: '#f0e6c8',
                cursor: 'pointer',
              }}
            >
              📜 PLAY AGAIN
            </button>
            <button
              onClick={handleBack}
              style={{
                width: '100%',
                padding: '9px',
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '3px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: '#c9a84c',
                cursor: 'pointer',
              }}
            >
              ← BACK TO ACADEMY
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing ──────────────────────────────────────────────────────────────

  const current = challenges[questionIndex]
  const correctCount = sessionCorrect

  return (
    <>
      <style>{`
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="px-4 pt-4 pb-8" style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* ── Battle arena ── */}
        <BattleArena
          ref={arenaRef}
          playerConfig={(avatarConfig as AvatarConfig | null) ?? DEFAULT_AVATAR_CONFIG}
          playerPreset={playerPreset}
          playerDisplayName={displayName ?? 'Hero'}
          enemy={enemy}
          enemyPreset={enemyPreset}
          correctCount={correctCount}
          questionIndex={questionIndex}
          totalQuestions={questions.length}
          questionSource={source}
          screenFlash={flash}
          playerSize={64}
          enemySize={64}
          streak={streak}
          enemyTitle={teacher?.title}
        />

        {/* ── Question card ──────────────────────────────────────────────── */}
        <div
          key={questionIndex}
          style={{
            background: 'rgba(26,28,46,0.8)',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '3px',
            padding: '14px 12px',
            animation: 'card-rise 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '5px',
              color: '#7a6a44',
              textAlign: 'center',
              marginBottom: '10px',
              letterSpacing: '1px',
            }}
          >
            QUESTION {questionIndex + 1} OF {questions.length}
          </div>

          {/* Question text */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: '#f0e6c8',
              textAlign: 'center',
              lineHeight: 1.8,
              marginBottom: '16px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {current.content.question}
          </div>

          {/* Answer grid — 2×2 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            {current.content.options.map(option => {
              const isCorrect = option === current.content.correct_answer
              const isChosen = option === chosenWrong

              let borderColor = 'rgba(201,168,76,0.22)'
              if (feedback === 'wrong') {
                borderColor = isCorrect ? '#2eb85c' : isChosen ? '#e05555' : 'rgba(201,168,76,0.15)'
              } else if (feedback === 'correct' && isCorrect) {
                borderColor = '#2eb85c'
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={feedback !== null}
                  style={{
                    background: 'linear-gradient(135deg,#1a1c2e,#12131f)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '3px',
                    padding: '12px 8px',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '7px',
                    color: '#f0e6c8',
                    textAlign: 'center',
                    cursor: feedback !== null ? 'not-allowed' : 'pointer',
                    pointerEvents: feedback !== null ? 'none' : 'auto',
                    minHeight: '48px',
                    lineHeight: 1.6,
                    transition: 'border-color 0.15s',
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {/* Explanation — only shown after a wrong answer */}
          {feedback === 'wrong' && current.content.explanation && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                fontSize: '12px',
                color: '#7a6a44',
                textAlign: 'center',
                padding: '6px 8px',
                borderTop: '1px solid rgba(201,168,76,0.1)',
              }}
            >
              {current.content.explanation}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
