'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { revalidatePlayCache } from '@/app/actions/cache'
import { playSfx } from '@/lib/audio'
import { useAcademy } from '@/hooks/useAcademy'
import BattleArena, { type BattleArenaHandle } from '@/components/games/BattleArena'
import CelebrationEffect from '@/components/games/CelebrationEffect'
import { ENEMY_PRESETS, DEFAULT_AVATAR_CONFIG } from '@/lib/constants/enemies'
import { SLUG_PRESET, TEACHER_BY_SLUG } from '@/lib/constants/academy'
import type { AnimationPreset } from '@/lib/constants/lpc-animations'
import type { AvatarConfig } from '@/types/avatar'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  id: string
  title: string
  content: {
    question: string
    options: string[]
    correct_answer: string
    explanation?: string
  }
  xp_reward: number
}

type Phase = 'loading' | 'playing' | 'waiting' | 'results'
type Feedback = null | 'correct' | 'wrong'
type ScreenFlash = 'green' | 'red' | null
type FetchErrorKind = 'network' | 'empty' | null
type QuestionSource = 'ai' | 'db' | 'fallback'

// RFC 4122 UUID — DB challenge ids match this; fallback ids ('fb_*') don't.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Props {
  ageTier: 'junior' | 'senior'
  householdId: string
  playerId: string
  avatarConfig: Record<string, unknown> | null
  displayName: string
  /** Animation preset derived from the player's avatar_class. */
  playerPreset?: AnimationPreset
}

// ── Fisher-Yates shuffle ──────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Hardcoded fallback math questions used when AI + DB both fail. */
function fallbackQuestions(ageTier: 'junior' | 'senior'): Question[] {
  const bank: Question[] = ageTier === 'junior'
    ? [
        { id: 'fb_m1', title: '6 × 7', content: { question: 'What is 6 × 7?', options: ['36', '42', '48', '54'], correct_answer: '42', explanation: '6 × 7 = 42.' }, xp_reward: 25 },
        { id: 'fb_m2', title: '8 × 9', content: { question: 'What is 8 × 9?', options: ['63', '72', '81', '64'], correct_answer: '72', explanation: '8 × 9 = 72.' }, xp_reward: 25 },
        { id: 'fb_m3', title: '15 + 8', content: { question: 'What is 15 + 8?', options: ['21', '22', '23', '24'], correct_answer: '23', explanation: '15 + 8 = 23.' }, xp_reward: 20 },
        { id: 'fb_m4', title: '100 − 37', content: { question: 'What is 100 − 37?', options: ['63', '73', '67', '57'], correct_answer: '63', explanation: '100 − 37 = 63.' }, xp_reward: 25 },
        { id: 'fb_m5', title: '12 ÷ 4', content: { question: 'What is 12 ÷ 4?', options: ['2', '3', '4', '6'], correct_answer: '3', explanation: '12 ÷ 4 = 3.' }, xp_reward: 20 },
        { id: 'fb_m6', title: 'Shape sides', content: { question: 'How many sides does a hexagon have?', options: ['4', '5', '6', '8'], correct_answer: '6', explanation: 'A hexagon has 6 sides.' }, xp_reward: 20 },
        { id: 'fb_m7', title: '3 × 12', content: { question: 'What is 3 × 12?', options: ['24', '36', '32', '48'], correct_answer: '36', explanation: '3 × 12 = 36.' }, xp_reward: 25 },
        { id: 'fb_m8', title: 'Half of 50', content: { question: 'What is half of 50?', options: ['20', '25', '30', '35'], correct_answer: '25', explanation: 'Half of 50 is 25.' }, xp_reward: 20 },
        { id: 'fb_m9', title: '7 + 9', content: { question: 'What is 7 + 9?', options: ['14', '15', '16', '17'], correct_answer: '16', explanation: '7 + 9 = 16.' }, xp_reward: 20 },
        { id: 'fb_m10', title: '10 × 10', content: { question: 'What is 10 × 10?', options: ['50', '100', '110', '20'], correct_answer: '100', explanation: '10 × 10 = 100.' }, xp_reward: 20 },
      ]
    : [
        { id: 'fb_s1', title: '15% of 200', content: { question: 'What is 15% of 200?', options: ['25', '30', '35', '40'], correct_answer: '30', explanation: '15% of 200 = 0.15 × 200 = 30.' }, xp_reward: 35 },
        { id: 'fb_s2', title: 'Slope', content: { question: 'What is the slope of y = 3x + 5?', options: ['3', '5', '−3', '−5'], correct_answer: '3', explanation: 'In y = mx + b, the slope m is 3.' }, xp_reward: 35 },
        { id: 'fb_s3', title: 'Reciprocal', content: { question: 'What is the reciprocal of 2/3?', options: ['−2/3', '3/2', '1.5', '−1.5'], correct_answer: '3/2', explanation: 'The reciprocal of 2/3 is 3/2.' }, xp_reward: 30 },
        { id: 'fb_s4', title: 'Pythagorean', content: { question: 'In a right triangle with legs 6 and 8, what is the hypotenuse?', options: ['10', '12', '14', '9'], correct_answer: '10', explanation: '√(6² + 8²) = √100 = 10.' }, xp_reward: 40 },
        { id: 'fb_s5', title: 'x² = 49', content: { question: 'If x² = 49, what is x?', options: ['±7', '7', '−7', '49'], correct_answer: '±7', explanation: 'x = ±√49 = ±7.' }, xp_reward: 30 },
        { id: 'fb_s6', title: 'Area of circle', content: { question: 'What is the area of a circle with radius 4? (Use π = 3.14)', options: ['50.24', '25.12', '12.56', '100.48'], correct_answer: '50.24', explanation: 'Area = πr² = 3.14 × 16 = 50.24.' }, xp_reward: 40 },
        { id: 'fb_s7', title: 'Prime numbers', content: { question: 'Which of these is a prime number?', options: ['49', '51', '53', '57'], correct_answer: '53', explanation: '53 is only divisible by 1 and itself.' }, xp_reward: 30 },
        { id: 'fb_s8', title: '−5 + 12', content: { question: 'What is −5 + 12?', options: ['7', '−7', '17', '−17'], correct_answer: '7', explanation: '−5 + 12 = 7.' }, xp_reward: 25 },
        { id: 'fb_s9', title: 'GCF', content: { question: 'What is the greatest common factor of 24 and 36?', options: ['6', '8', '12', '18'], correct_answer: '12', explanation: 'The GCF of 24 and 36 is 12.' }, xp_reward: 35 },
        { id: 'fb_s10', title: 'Probability', content: { question: 'What is the probability of rolling an even number on a 6-sided die?', options: ['1/2', '1/3', '2/3', '1/6'], correct_answer: '1/2', explanation: '3 out of 6 numbers are even, so P = 3/6 = 1/2.' }, xp_reward: 30 },
      ]
  return bank
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MathArena({
  ageTier,
  householdId,
  playerId,
  avatarConfig,
  displayName,
  playerPreset = 'warrior',
}: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const {
    challenges: questions,
    loading,
    error,
    source: questionSource,
    secondBatchLoading,
    secondBatchReady,
    fetchChallenges,
    submitAnswer,
  } = useAcademy(playerId, householdId)

  // Playing state
  const [phase, setPhase] = useState<Phase>('loading')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [screenFlash, setScreenFlash] = useState<ScreenFlash>(null)
  const [chosenWrong, setChosenWrong] = useState<string | null>(null)
  const [saveError, setSaveError] = useState(false)

  const correctCount = score

  // Celebration effect trigger (incremented when the quiz finishes)
  const [celebrationTick, setCelebrationTick] = useState(0)

  // Battle arena ref for triggering attack animations
  const arenaRef = useRef<BattleArenaHandle>(null)

  // Enemy config for this game
  const enemy = ENEMY_PRESETS['math-arena']
  const enemyPreset = SLUG_PRESET['math-arena'] ?? 'warrior'

  // Timer refs for cleanup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function addTimer(id: ReturnType<typeof setTimeout>) {
    timersRef.current.push(id)
  }

  // Results — XP accumulates per correct answer (DB trigger awards it on insert)
  const [xpEarned, setXpEarned] = useState(0)
  const [submissionError, setSubmissionError] = useState(false)
  const [freshProfile, setFreshProfile] = useState<{ xp_total: number; xp_available: number; level: number } | null>(null)

  // ── Initial Fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetchChallenges('math')
  }, [fetchChallenges])

  // Sync phase with useAcademy loading state
  useEffect(() => {
    if (!loading && phase === 'loading' && questions.length > 0) {
      setPhase('playing')
    }
  }, [loading, questions.length, phase])

  // Auto-advance from waiting to Q6 when second batch arrives
  useEffect(() => {
    if (phase === 'waiting' && secondBatchReady) {
      setQuestionIndex(5)
      setFeedback(null)
      setChosenWrong(null)
      setPhase('playing')
    }
  }, [phase, secondBatchReady])

  useEffect(() => {
    const timers = timersRef.current
    return () => { timers.forEach(clearTimeout) }
  }, [])

  useEffect(() => {
    if (phase === 'results') {
      void revalidatePlayCache()
    }
  }, [phase])

  // Fetch fresh profile data when results phase starts so XP reflects DB
  useEffect(() => {
    if (phase !== 'results') return
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('xp_total, xp_available, level')
        .eq('id', playerId)
        .single()
      if (data) setFreshProfile(data as { xp_total: number; xp_available: number; level: number })
    }, 700)
    return () => clearTimeout(timer)
  }, [phase, supabase, playerId])

  // ── Answer handler ───────────────────────────────────────────────────────

  async function handleAnswer(option: string) {
    if (feedback !== null) return // debounce

    const current = questions[questionIndex]
    const correct = option === current.content.correct_answer
    const newAnswers = [...answers, option]

    // Fire the persistence via hook
    try {
      await submitAnswer(current.id, correct)
    } catch {
      setSubmissionError(true)
    }

    if (correct) {
      const newScore = score + 1
      setScore(newScore)
      setStreak(s => Math.min(s + 1, 10))
      setXpEarned(prev => prev + current.xp_reward)
      setAnswers(newAnswers)
      setFeedback('correct')
      setScreenFlash('green')
      playSfx('attack')
      arenaRef.current?.triggerPlayerAttack()

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => {
        if (questionIndex >= 9) {
          playSfx('victory')
          setCelebrationTick(t => t + 1)
          setAnswers(newAnswers)
          setPhase('results')
        } else if (questionIndex === 4 && secondBatchLoading) {
          setAnswers(newAnswers)
          setPhase('waiting')
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
        }
      }, 800))
    } else {
      setStreak(0)
      setAnswers(newAnswers)
      setFeedback('wrong')
      setChosenWrong(option)
      setScreenFlash('red')
      playSfx('click')
      arenaRef.current?.triggerEnemyAttack()

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => {
        if (questionIndex >= 9) {
          playSfx('victory')
          setCelebrationTick(t => t + 1)
          setAnswers(newAnswers)
          setPhase('results')
        } else if (questionIndex === 4 && secondBatchLoading) {
          setAnswers(newAnswers)
          setPhase('waiting')
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
          setChosenWrong(null)
        }
      }, 3000))
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  const current = questions[questionIndex]

  // Accuracy badge color
  function accuracyColor(n: number): string {
    const pct = n / 10
    if (pct >= 0.8) return '#2eb85c'
    if (pct >= 0.6) return '#e8a020'
    return '#e05555'
  }

  // ── Loading phase ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', color: '#e05555', marginBottom: '16px' }}>
              {error}
            </div>
            <button
              onClick={() => fetchChallenges('math')}
              style={{
                fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#f0e6c8',
                background: 'linear-gradient(135deg,#c43a00,#8b1e00)',
                border: '1px solid rgba(196,58,0,0.5)', borderRadius: '3px',
                padding: '10px 16px', cursor: 'pointer',
              }}
            >
              TRY AGAIN
            </button>
          </>
        ) : (
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#c9a84c', letterSpacing: '2px' }}>
            Preparing the arena…
          </div>
        )}
      </div>
    )
  }

  // ── Waiting phase (second batch loading between Q5 and Q6) ──────────────

  if (phase === 'waiting') {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--qf-gold-300)', letterSpacing: '0.18em', marginBottom: 10 }}>
          PREPARING NEXT CHALLENGE…
        </div>
        <div style={{ fontSize: 11, color: 'var(--qf-parchment-dim)', fontFamily: 'var(--font-body)' }}>
          The Gemini Oracle is forging your next set of questions.
        </div>
      </div>
    )
  }

  // ── Results phase ─────────────────────────────────────────────────────────

  if (phase === 'results') {
    return (
      <div className="px-4 py-6" style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
        {/*
          Celebration burst — plays once when the results screen first mounts.
          The trigger is incremented whenever the quiz transitions to results,
          so it fires again if the player retakes and finishes.
        */}
        <CelebrationEffect trigger={celebrationTick} />

        {/* Save error toast */}
        {saveError && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '12px', color: '#e05555',
            background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.3)',
            borderRadius: '3px', padding: '8px 12px', marginBottom: '12px', textAlign: 'center',
          }}>
            Couldn&rsquo;t save progress — check your connection.
          </div>
        )}

        {/* Score card */}
        <div style={{
          background: 'linear-gradient(180deg,#0d0f1c,#070910)',
          border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px',
          padding: '16px 14px', marginBottom: '12px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#7a6a44', marginBottom: '4px', letterSpacing: '1px' }}>
                TRAINING COMPLETE
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: '#f0e6c8' }}>
                {correctCount} / 10
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', color: '#7a6a44', marginTop: '2px' }}>
                {questionSource === 'fallback'
                  ? 'Practice round — XP not awarded (offline questions)'
                  : `+${xpEarned} XP awarded`}
              </div>
              {freshProfile && (
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#c9a84c', marginTop: '4px', letterSpacing: '0.1em' }}>
                  LV {freshProfile.level} · {freshProfile.xp_available.toLocaleString()} XP available
                </div>
              )}
            </div>
            <div style={{
              background: `rgba(${correctCount >= 8 ? '46,184,92' : correctCount >= 6 ? '232,160,32' : '224,85,85'},0.12)`,
              border: `1px solid rgba(${correctCount >= 8 ? '46,184,92' : correctCount >= 6 ? '232,160,32' : '224,85,85'},0.4)`,
              borderRadius: '3px', padding: '8px 12px',
              fontFamily: 'var(--font-pixel)', fontSize: '8px',
              color: accuracyColor(correctCount),
            }}>
              {Math.round((correctCount / 10) * 100)}%
            </div>
          </div>

          {/* Question log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {questions.map((q, i) => {
              const playerAnswer = answers[i] ?? ''
              const wasCorrect = playerAnswer === q.content.correct_answer
              return (
                <div
                  key={q.id}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    background: wasCorrect ? 'rgba(46,184,92,0.06)' : 'rgba(224,85,85,0.06)',
                    borderLeft: `2px solid ${wasCorrect ? '#2eb85c' : '#e05555'}`,
                    borderRadius: '0 2px 2px 0', padding: '5px 8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: wasCorrect ? '#2eb85c' : '#e05555', fontSize: '12px', flexShrink: 0 }}>
                      {wasCorrect ? '✓' : '✗'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#b09a6e' }}>
                      {q.content.question} = {q.content.correct_answer}
                    </span>
                  </div>
                  {!wasCorrect && playerAnswer && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#7a6a44', paddingLeft: '18px' }}>
                      you answered: {playerAnswer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => fetchChallenges('math')}
              style={{
                width: '100%', padding: '11px',
                background: 'linear-gradient(135deg,#c43a00,#8b1e00)',
                border: '1px solid rgba(196,58,0,0.5)', borderRadius: '3px',
                fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#f0e6c8', cursor: 'pointer',
              }}
            >
              ⚔️ PLAY AGAIN
            </button>
            <button
              onClick={() => { router.refresh(); router.push('/play/academy') }}
              style={{
                width: '100%', padding: '9px',
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.3)', borderRadius: '3px',
                fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#c9a84c', cursor: 'pointer',
              }}
            >
              ← BACK TO ACADEMY
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing phase ─────────────────────────────────────────────────────────

  return (
    <>
      <div className="px-4 pt-4 pb-8" style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Battle arena ── */}
        <BattleArena
          ref={arenaRef}
          playerConfig={(avatarConfig as AvatarConfig | null) ?? DEFAULT_AVATAR_CONFIG}
          playerPreset={playerPreset}
          playerDisplayName={displayName}
          enemy={enemy}
          enemyPreset={enemyPreset}
          correctCount={correctCount}
          questionIndex={questionIndex}
          totalQuestions={10}
          questionSource={questionSource}
          screenFlash={screenFlash}
          playerSize={96}
          enemySize={96}
          streak={streak}
          enemyTitle={TEACHER_BY_SLUG['math-arena']?.title}
          backgroundSrc="/images/lore/underbright.png"
          atmosphere="mist"
        />

        {/* ── Question card ──────────────────────────────────────────────── */}
        <div
          key={questionIndex}
          style={{
            background: 'rgba(26,28,46,0.8)',
            border: '1px solid rgba(201,168,76,0.18)', borderRadius: '3px',
            padding: '14px 12px',
            animation: 'card-rise 0.25s ease',
          }}
        >
          {/* Question counter */}
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#7a6a44', textAlign: 'center', marginBottom: '10px', letterSpacing: '1px' }}>
            QUESTION {questionIndex + 1} OF 10
          </div>

          {/* Question text */}
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: '11px', color: '#f0e6c8',
            textAlign: 'center', lineHeight: 1.8, marginBottom: '16px',
            minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {current.content.question}
          </div>

          {/* Answer grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            {current.content.options.map((option) => {
              const isCorrect = option === current.content.correct_answer
              const isChosen  = option === chosenWrong

              let borderColor = 'rgba(201,168,76,0.22)'
              if (feedback === 'wrong') {
                if (isCorrect) borderColor = '#2eb85c'
                else if (isChosen) borderColor = '#e05555'
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={feedback !== null}
                  style={{
                    background: 'linear-gradient(135deg,#1a1c2e,#12131f)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '3px', padding: '12px 8px',
                    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#f0e6c8',
                    textAlign: 'center', cursor: feedback !== null ? 'not-allowed' : 'pointer',
                    pointerEvents: feedback !== null ? 'none' : 'auto',
                    minHeight: '48px', lineHeight: 1.6,
                    transition: 'border-color 0.15s',
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {/* Explanation (wrong answers only) */}
          {feedback === 'wrong' && current.content.explanation && (
            <div style={{
              fontFamily: 'var(--font-body)', fontStyle: 'italic',
              fontSize: '12px', color: '#7a6a44', textAlign: 'center',
              padding: '6px 8px',
              borderTop: '1px solid rgba(201,168,76,0.1)',
            }}>
              {current.content.explanation}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
