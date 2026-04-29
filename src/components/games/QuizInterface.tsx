'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { revalidatePlayCache } from '@/app/actions/cache'
import { playSfx } from '@/lib/audio'
import { useAcademy } from '@/hooks/useAcademy'
import BattleArena, { type BattleArenaHandle } from '@/components/games/BattleArena'
import CelebrationEffect from '@/components/games/CelebrationEffect'
import { ENEMY_PRESETS, DEFAULT_AVATAR_CONFIG } from '@/lib/constants/enemies'
import { SUBJECT_TO_SLUG, SLUG_PRESET, TEACHER_BY_SLUG } from '@/lib/constants/academy'
import type { AvatarConfig } from '@/types/avatar'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = 'loading' | 'playing' | 'waiting' | 'results'
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
    sessionWrong,
    submitting,
    secondBatchLoading,
    secondBatchReady,
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

  // Map enemy slugs to thematic backgrounds and atmospheres
  const theme = useMemo(() => {
    switch (enemySlug) {
      case 'math-arena': return { bg: '/images/lore/underbright.png', atm: 'mist' }
      case 'science-labyrinth': return { bg: '/images/lore/ashlands.png', atm: 'embers' }
      case 'word-forge': return { bg: '/images/lore/dustmere.png', atm: 'dust' }
      case 'reading-tome': return { bg: '/images/lore/underbright.png', atm: 'mist' }
      case 'history-scroll': return { bg: '/images/lore/ironspine.png', atm: 'dust' }
      case 'vocab-duel': return { bg: '/images/lore/shattered_coast.png', atm: 'mist' }
      case 'logic-gate': return { bg: '/images/lore/dustmere.png', atm: 'mist' }
      case 'general-knowledge': return { bg: '/images/lore/shattered_coast.png', atm: 'mist' }
      case 'life-skills': return { bg: '/images/lore/heartwood.png', atm: 'dust' }
      default: return { bg: '/images/lore/heartwood.png', atm: 'dust' }
    }
  }, [enemySlug])

  // ── Load challenges when age tier is known ──────────────────────────────
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

  // When waiting for the second batch and it arrives, advance to Q6
  useEffect(() => {
    if (phase === 'waiting' && secondBatchReady) {
      setQuestionIndex(5)
      setFeedback(null)
      setChosenWrong(null)
      setPhase('playing')
    }
  }, [phase, secondBatchReady])

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

  useEffect(() => {
    if (phase === 'results') {
      void revalidatePlayCache()
    }
  }, [phase])

  // ── Answer handler ───────────────────────────────────────────────────────

  async function handleAnswer(option: string) {
    if (feedback !== null || submitting) return

    const current = challenges[questionIndex]
    const isCorrect = option === current.content.correct_answer

    if (isCorrect) {
      setStreak(s => Math.min(s + 1, 10))
      setFeedback('correct')
      setFlash('green')
      playSfx('attack')
      arenaRef.current?.triggerPlayerAttack()

      addTimer(setTimeout(() => setFlash(null), 350))

      try {
        await submitAnswer(current.id, true)
      } catch {
        setSubmissionError(true)
      }

      addTimer(setTimeout(() => {
        if (questionIndex >= 9) {
          playSfx('victory')
          setCelebrationTick(t => t + 1)
          setPhase('results')
        } else if (questionIndex === 4 && secondBatchLoading) {
          // Q5 done but batch 2 not ready yet — phase will advance via useEffect
          setPhase('waiting')
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
      playSfx('click')
      arenaRef.current?.triggerEnemyAttack()

      addTimer(setTimeout(() => setFlash(null), 350))

      try {
        await submitAnswer(current.id, false)
      } catch {
        setSubmissionError(true)
      }

      addTimer(setTimeout(() => {
        // Lose condition: 4 misses = 0 HP
        if (sessionWrong + 1 >= 4) {
          playSfx('click') // Maybe a defeat sound?
          setPhase('results')
        } else if (questionIndex >= 9) {
          playSfx('victory')
          setCelebrationTick(t => t + 1)
          setPhase('results')
        } else if (questionIndex === 4 && secondBatchLoading) {
          setPhase('waiting')
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
          setChosenWrong(null)
        }
      }, 3500))
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
      <div style={{ padding: '64px 20px', textAlign: 'center' }}>
        {fetchError ? (
          <>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                color: '#c9a84c',
                marginBottom: 20,
              }}
            >
              {fetchError}
            </div>
            <button
              onClick={handleRetry}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 9,
                color: '#f0e6c8',
                background: 'linear-gradient(135deg,#c43a00,#8b1e00)',
                border: '1px solid rgba(196,58,0,0.5)',
                borderRadius: 4,
                padding: '12px 20px',
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
              fontSize: 9,
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

  // ── Waiting (second batch loading between Q5 and Q6) ─────────────────────

  if (phase === 'waiting') {
    return (
      <div className="px-4 pt-10" style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 9,
            color: 'var(--qf-gold-300)',
            letterSpacing: '0.18em',
            marginBottom: 10,
          }}
        >
          PREPARING NEXT CHALLENGE…
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--qf-parchment-dim)',
            fontFamily: 'var(--font-body)',
          }}
        >
          The Gemini Oracle is forging your next set of questions.
        </div>
      </div>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────────

  if (phase === 'results') {
    const correctCount = sessionCorrect
    const wrongCount = sessionWrong
    const isDefeat = wrongCount >= 4
    const accuracy = correctCount / 10

    return (
      <>
        <style>{`
          @keyframes score-pop {
            0%   { transform: scale(0.7); opacity: 0; }
            70%  { transform: scale(1.08); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <div className="px-4 py-6" style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <CelebrationEffect trigger={celebrationTick} />

          {/* Submission error toast */}
          {submissionError && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: '#e05555',
                background: 'rgba(224,85,85,0.1)',
                border: '1px solid rgba(224,85,85,0.3)',
                borderRadius: 4,
                padding: '10px 14px',
                marginBottom: 14,
                textAlign: 'center',
              }}
            >
              Some results may not have saved — check your connection.
            </div>
          )}

          <div
            style={{
              background: 'linear-gradient(180deg,#0d0f1c,#070910)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 6,
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            {/* Score hero */}
            <div style={{
              padding: '28px 20px 24px',
              textAlign: 'center',
              borderBottom: '1px solid rgba(201,168,76,0.1)',
              background: `linear-gradient(180deg, rgba(${isDefeat ? '224,85,85' : accuracy >= 0.8 ? '46,184,92' : accuracy >= 0.6 ? '232,160,32' : '224,85,85'},0.08), transparent)`,
            }}>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 9,
                  color: isDefeat ? '#e05555' : '#7a6a44',
                  letterSpacing: '2px',
                  marginBottom: 14,
                }}
              >
                {isDefeat ? 'TRIAL FAILED' : 'QUIZ COMPLETE'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 'clamp(28px, 6vw, 48px)',
                  color: isDefeat ? '#e05555' : accuracyColor(accuracy),
                  animation: 'score-pop 0.5s ease both',
                  lineHeight: 1,
                  marginBottom: 10,
                  textShadow: `0 0 20px ${isDefeat ? '#e05555' : accuracyColor(accuracy)}66`,
                }}
              >
                {isDefeat ? 'DEFEATED' : `${correctCount} / ${challenges.length}`}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: `rgba(${isDefeat ? '224,85,85' : accuracy >= 0.8 ? '46,184,92' : accuracy >= 0.6 ? '232,160,32' : '224,85,85'},0.15)`,
                  border: `1px solid ${isDefeat ? '#e0555566' : accuracyColor(accuracy) + '66'}`,
                  borderRadius: 4,
                  padding: '4px 14px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 11,
                  color: isDefeat ? '#e05555' : accuracyColor(accuracy),
                  marginBottom: 12,
                }}
              >
                {isDefeat ? `${wrongCount} MISSES` : `${Math.round(accuracy * 100)}% Accuracy`}
              </div>
              {!isDefeat && (
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 18,
                    color: '#c9a84c',
                  }}
                >
                  +{sessionXp} XP earned
                </div>
              )}
              {freshProfile && (
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', marginTop: 6, letterSpacing: '0.1em' }}>
                  LV {freshProfile.level} · {freshProfile.xp_available.toLocaleString()} XP available
                </div>
              )}
            </div>

            {/* Answers log */}
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#7a6a44', letterSpacing: '0.1em', marginBottom: 10 }}>
                ANSWER LOG
              </div>
              <div
                style={{
                  display: 'flex', flexDirection: 'column', gap: 6,
                  marginBottom: 16, maxHeight: 260, overflowY: 'auto',
                }}
              >
                {challenges.map((q, i) => (
                  <div
                    key={q.id}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 4,
                      background: 'rgba(26,28,46,0.8)',
                      borderLeft: '3px solid rgba(201,168,76,0.3)',
                      borderRadius: '0 3px 3px 0',
                      padding: '8px 12px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#b09a6e' }}>
                      {i + 1}. {q.content.question}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: 7,
                        color: '#7a6a44',
                      }}
                    >
                      Answer: {q.content.correct_answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={handleRetry}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg,#c43a00,#8b1e00)',
                  border: '1px solid rgba(196,58,0,0.5)',
                  borderRadius: 4,
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 10,
                  color: '#f0e6c8',
                  cursor: 'pointer',
                  minHeight: 52,
                }}
              >
                📜 PLAY AGAIN
              </button>
              <button
                onClick={handleBack}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.35)',
                  borderRadius: 4,
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 9,
                  color: '#c9a84c',
                  cursor: 'pointer',
                  minHeight: 48,
                }}
              >
                ← BACK TO ACADEMY
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Playing ──────────────────────────────────────────────────────────────

  const current = challenges[questionIndex]
  const correctCount = sessionCorrect

  return (
    <>
      <style>{`
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="px-4 pt-4 pb-10" style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ── Battle arena (full-width header) ── */}
        <div>
          <BattleArena
            ref={arenaRef}
            playerConfig={(avatarConfig as AvatarConfig | null) ?? DEFAULT_AVATAR_CONFIG}
            playerPreset={playerPreset}
            playerDisplayName={displayName ?? 'Hero'}
            enemy={enemy}
            enemyPreset={enemyPreset}
            correctCount={correctCount}
            questionIndex={questionIndex}
            totalQuestions={10}
            questionSource={source}
            screenFlash={flash}
            playerSize={96}
            enemySize={96}
            streak={streak}
            enemyTitle={teacher?.title}
            backgroundSrc={theme.bg}
            atmosphere={theme.atm as any}
            playerHpPct={Math.max(0, 100 - (sessionWrong * 25))}
          />
        </div>

        {/* ── Question card ── */}
        <div
          key={questionIndex}
          style={{
            background: 'rgba(26,28,46,0.85)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 6,
            padding: '20px 18px',
            animation: 'card-rise 0.25s ease',
          }}
        >
          {/* Progress header */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 8,
              color: '#7a6a44',
              textAlign: 'center',
              marginBottom: 16,
              letterSpacing: '1.5px',
            }}
          >
            QUESTION {questionIndex + 1} OF 10
          </div>

            {/* Question text */}
            {(() => {
              const hasPattern = /[◯■△★◆▲●○□▽☆◇▽]/.test(current.content.question)
              return (
                <div
                  style={{
                    fontFamily: hasPattern ? 'var(--font-body)' : 'var(--font-heading)',
                    fontSize: hasPattern ? '22px' : 'clamp(16px, 2.5vw, 22px)',
                    letterSpacing: hasPattern ? '0.15em' : '0.02em',
                    color: '#f0e6c8',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    marginBottom: 22,
                    minHeight: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {current.content.question}
                </div>
              )
            })()}

            {/* Answer grid — 2×2 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 14,
              }}
            >
              {current.content.options.map(option => {
                const isCorrect = option === current.content.correct_answer
                const isChosen = option === chosenWrong

                let borderColor = 'rgba(201,168,76,0.25)'
                let bg = 'linear-gradient(135deg,#1a1c2e,#12131f)'
                if (feedback === 'wrong') {
                  if (isCorrect) { borderColor = '#2eb85c'; bg = 'rgba(46,184,92,0.08)' }
                  else if (isChosen) { borderColor = '#e05555'; bg = 'rgba(224,85,85,0.08)' }
                  else borderColor = 'rgba(201,168,76,0.12)'
                } else if (feedback === 'correct' && isCorrect) {
                  borderColor = '#2eb85c'; bg = 'rgba(46,184,92,0.1)'
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={feedback !== null}
                    style={{
                      background: bg,
                      border: `2px solid ${borderColor}`,
                      borderRadius: 4,
                      padding: '14px 10px',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: 10,
                      color: '#f0e6c8',
                      textAlign: 'center',
                      cursor: feedback !== null ? 'not-allowed' : 'pointer',
                      pointerEvents: feedback !== null ? 'none' : 'auto',
                      minHeight: 60,
                      lineHeight: 1.6,
                      transition: 'border-color 0.15s, background 0.15s',
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
                  fontSize: 14,
                  color: '#9a8a64',
                  textAlign: 'center',
                  padding: '10px 12px',
                  borderTop: '1px solid rgba(201,168,76,0.12)',
                  lineHeight: 1.6,
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
