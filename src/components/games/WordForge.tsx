'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { revalidatePlayCache } from '@/app/actions/cache'
import { playSfx } from '@/lib/audio'
import { useAcademy } from '@/hooks/useAcademy'
import BattleArena, { type BattleArenaHandle } from '@/components/games/BattleArena'
import { ENEMY_PRESETS, DEFAULT_AVATAR_CONFIG } from '@/lib/constants/enemies'
import { SLUG_PRESET } from '@/lib/constants/academy'
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
type ScreenFlash = 'blue' | 'red' | null
type FetchErrorKind = 'network' | 'empty' | null
type QuestionSource = 'ai' | 'db' | 'fallback'

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Hardcoded fallback vocabulary questions used when AI + DB both fail. */
function fallbackQuestions(ageTier: 'junior' | 'senior'): Question[] {
  const bank: Question[] = ageTier === 'junior'
    ? [
        { id: 'fb_v1', title: 'Define: ancient', content: { question: 'What does "ancient" mean?', options: ['Very old', 'Very new', 'Very fast', 'Very small'], correct_answer: 'Very old', explanation: 'Ancient means from a long time ago.' }, xp_reward: 25 },
        { id: 'fb_v2', title: 'Define: curious', content: { question: 'What does "curious" mean?', options: ['Bored', 'Sleepy', 'Eager to learn', 'Angry'], correct_answer: 'Eager to learn', explanation: 'Curious means wanting to know more about something.' }, xp_reward: 25 },
        { id: 'fb_v3', title: 'Define: enormous', content: { question: 'What does "enormous" mean?', options: ['Very small', 'Very large', 'Very fast', 'Very slow'], correct_answer: 'Very large', explanation: 'Enormous means extremely large.' }, xp_reward: 20 },
        { id: 'fb_v4', title: 'Synonym: happy', content: { question: 'Which word is a synonym for "happy"?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], correct_answer: 'Joyful', explanation: 'Joyful means the same as happy.' }, xp_reward: 20 },
        { id: 'fb_v5', title: 'Antonym: hot', content: { question: 'Which word is an antonym (opposite) of "hot"?', options: ['Warm', 'Cold', 'Cool', 'Mild'], correct_answer: 'Cold', explanation: 'Cold is the opposite of hot.' }, xp_reward: 25 },
        { id: 'fb_v6', title: 'Define: brave', content: { question: 'What does "brave" mean?', options: ['Scared', 'Courageous', 'Quiet', 'Loud'], correct_answer: 'Courageous', explanation: 'Brave means showing courage in the face of danger.' }, xp_reward: 25 },
        { id: 'fb_v7', title: 'Define: vanish', content: { question: 'What does "vanish" mean?', options: ['Appear', 'Disappear', 'Grow', 'Sleep'], correct_answer: 'Disappear', explanation: 'To vanish means to suddenly disappear.' }, xp_reward: 20 },
        { id: 'fb_v8', title: 'Synonym: quick', content: { question: 'Which word is a synonym for "quick"?', options: ['Slow', 'Fast', 'Heavy', 'Light'], correct_answer: 'Fast', explanation: 'Fast means the same as quick.' }, xp_reward: 20 },
        { id: 'fb_v9', title: 'Define: whisper', content: { question: 'What does "whisper" mean?', options: ['To shout', 'To speak softly', 'To sing', 'To cry'], correct_answer: 'To speak softly', explanation: 'Whisper means to speak very quietly.' }, xp_reward: 25 },
        { id: 'fb_v10', title: 'Define: journey', content: { question: 'What does "journey" mean?', options: ['A meal', 'A trip', 'A game', 'A book'], correct_answer: 'A trip', explanation: 'A journey is a long trip from one place to another.' }, xp_reward: 20 },
      ]
    : [
        { id: 'fb_s1', title: 'Define: ubiquitous', content: { question: 'What does "ubiquitous" mean?', options: ['Rare', 'Everywhere', 'Unique', 'Hidden'], correct_answer: 'Everywhere', explanation: 'Ubiquitous means found or present everywhere.' }, xp_reward: 35 },
        { id: 'fb_s2', title: 'Define: ambiguous', content: { question: 'What does "ambiguous" mean?', options: ['Clear', 'Open to interpretation', 'Hidden', 'Simple'], correct_answer: 'Open to interpretation', explanation: 'Ambiguous means having more than one possible meaning.' }, xp_reward: 35 },
        { id: 'fb_s3', title: 'Synonym: benevolent', content: { question: 'Which word is a synonym for "benevolent"?', options: ['Cruel', 'Kind', 'Angry', 'Strict'], correct_answer: 'Kind', explanation: 'Benevolent means well-meaning and kindly.' }, xp_reward: 35 },
        { id: 'fb_s4', title: 'Define: ephemeral', content: { question: 'What does "ephemeral" mean?', options: ['Permanent', 'Short-lived', 'Everlasting', 'Strong'], correct_answer: 'Short-lived', explanation: 'Ephemeral means lasting for a very short time.' }, xp_reward: 35 },
        { id: 'fb_s5', title: 'Antonym: pessimistic', content: { question: 'Which word is an antonym of "pessimistic"?', options: ['Gloomy', 'Optimistic', 'Realistic', 'Skeptical'], correct_answer: 'Optimistic', explanation: 'Optimistic is the opposite of pessimistic.' }, xp_reward: 30 },
        { id: 'fb_s6', title: 'Define: pragmatic', content: { question: 'What does "pragmatic" mean?', options: ['Idealistic', 'Practical', 'Theoretical', 'Emotional'], correct_answer: 'Practical', explanation: 'Pragmatic means dealing with things in a practical way.' }, xp_reward: 35 },
        { id: 'fb_s7', title: 'Synonym: arduous', content: { question: 'Which word is a synonym for "arduous"?', options: ['Easy', 'Difficult', 'Fun', 'Quick'], correct_answer: 'Difficult', explanation: 'Arduous means involving great effort or difficulty.' }, xp_reward: 30 },
        { id: 'fb_s8', title: 'Define: concise', content: { question: 'What does "concise" mean?', options: ['Wordy', 'Brief and clear', 'Confusing', 'Detailed'], correct_answer: 'Brief and clear', explanation: 'Concise means giving information clearly in few words.' }, xp_reward: 30 },
        { id: 'fb_s9', title: 'Define: scrutinize', content: { question: 'What does "scrutinize" mean?', options: ['To ignore', 'To examine closely', 'To destroy', 'To create'], correct_answer: 'To examine closely', explanation: 'To scrutinize means to examine something very carefully.' }, xp_reward: 35 },
        { id: 'fb_s10', title: 'Antonym: abundant', content: { question: 'Which word is an antonym of "abundant"?', options: ['Plentiful', 'Scarce', 'Enough', 'Excessive'], correct_answer: 'Scarce', explanation: 'Scarce is the opposite of abundant.' }, xp_reward: 30 },
      ]
  return bank
}

/** Extract the vocabulary word/phrase from a title like "Define: ancient" → "ANCIENT" */
function extractWord(title: string): string {
  return title.includes(': ')
    ? title.split(': ').slice(1).join(': ').toUpperCase()
    : title.toUpperCase()
}

/** Interpolate iron bar background color between cold (#555) and hot (#cc5500) based on heat 0–1 */
function ironBarColor(heat: number): string {
  // heat 0 = cold gray, heat 1 = hot orange
  const r = Math.round(0x55 + heat * (0xcc - 0x55))
  const g = Math.round(0x55 + heat * (0x55 - 0x55))
  const b = Math.round(0x55 + heat * (0x00 - 0x55))
  return `rgb(${r},${g},${b})`
}



// ── Component ─────────────────────────────────────────────────────────────────

export default function WordForge({
  ageTier,
  householdId,
  playerId,
  avatarConfig,
  displayName,
  playerPreset = 'warrior',
}: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Battle arena ref for triggering attack animations
  const arenaRef = useRef<BattleArenaHandle>(null)

  // Enemy config for this game
  const enemy = ENEMY_PRESETS['word-forge']
  const enemyPreset = SLUG_PRESET['word-forge'] ?? 'warrior'

  const {
    challenges: questions,
    loading,
    error,
    source: questionSource,
    secondBatchLoading,
    secondBatchReady,
    sessionWrong,
    fetchChallenges,
    submitAnswer,
  } = useAcademy(playerId, householdId)

  // Playing state
  const [phase, setPhase] = useState<Phase>('loading')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [ironHit, setIronHit] = useState(false)
  const [screenFlash, setScreenFlash] = useState<ScreenFlash>(null)
  const [chosenWrong, setChosenWrong] = useState<string | null>(null)

  const [xpEarned, setXpEarned] = useState(0)
  const [submissionError, setSubmissionError] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  function addTimer(id: ReturnType<typeof setTimeout>) {
    timersRef.current.push(id)
  }

  function accuracyColor(n: number): string {
    const pct = questions.length ? n / questions.length : 0
    if (pct >= 0.8) return '#2eb85c'
    if (pct >= 0.6) return '#e8a020'
    return '#e05555'
  }

  // ── Initial Fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetchChallenges('vocabulary')
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

  // ── Answer handler ───────────────────────────────────────────────────────

  async function handleAnswer(option: string) {
    if (feedback !== null) return // debounce

    const current = questions[questionIndex]
    if (!current) return

    const isCorrect = option === current.content.correct_answer
    const newAnswers = [...answers, option]

    // Fire persistence via hook
    try {
      await submitAnswer(current.id, isCorrect)
    } catch {
      setSubmissionError(true)
    }

    if (isCorrect) {
      setScore(s => s + 1)
      setXpEarned(prev => prev + current.xp_reward)
      setAnswers(newAnswers)
      setFeedback('correct')
      setIronHit(true)
      setScreenFlash('blue')
      playSfx('attack')
      arenaRef.current?.triggerPlayerAttack()

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => setIronHit(false), 600))
    } else {
      setAnswers(newAnswers)
      setFeedback('wrong')
      setChosenWrong(option)
      setScreenFlash('red')
      playSfx('click')
      arenaRef.current?.triggerEnemyAttack()
      addTimer(setTimeout(() => setScreenFlash(null), 300))
    }

    const nextIdx = questionIndex + 1
    const isFinished = nextIdx >= 10

    addTimer(setTimeout(() => {
      // Lose condition: 4 misses = 0 HP
      if (sessionWrong + 1 >= 4) {
        playSfx('click')
        setAnswers(newAnswers)
        setPhase('results')
      } else if (isFinished) {
        playSfx('victory')
        setPhase('results')
      } else if (questionIndex === 4 && secondBatchLoading) {
        setPhase('waiting')
      } else {
        setQuestionIndex(nextIdx)
        setFeedback(null)
        setChosenWrong(null)
      }
    }, isCorrect ? 1000 : 3000))
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', color: '#e05555', marginBottom: '16px' }}>
              {error}
            </div>
            <button
              onClick={() => fetchChallenges('vocabulary')}
              style={{
                fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#f0e6c8',
                background: 'linear-gradient(135deg,#1a5c9e,#0e3a6e)',
                border: '1px solid rgba(26,92,158,0.5)', borderRadius: '3px',
                padding: '10px 16px', cursor: 'pointer',
              }}
            >
              TRY AGAIN
            </button>
          </>
        ) : (
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#c9a84c', letterSpacing: '2px' }}>
            Preparing the forge…
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
          The Gemini Oracle is forging your next set of words.
        </div>
      </div>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────────

  if (phase === 'results') {
    const correctCount = score
    const wrongCount = sessionWrong
    const isDefeat = wrongCount >= 4
    return (
      <div className="px-4 py-6" style={{ maxWidth: '480px', margin: '0 auto' }}>
        {submissionError && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '12px', color: '#e05555',
            background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.3)',
            borderRadius: '3px', padding: '8px 12px', marginBottom: '12px', textAlign: 'center',
          }}>
            Couldn&rsquo;t save progress — check your connection.
          </div>
        )}

        <div style={{
          background: 'linear-gradient(180deg,#0d0f1c,#070910)',
          border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px',
          padding: '16px 14px', marginBottom: '12px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: isDefeat ? '#e05555' : '#7a6a44', marginBottom: '4px', letterSpacing: '1px' }}>
                {isDefeat ? 'FORGE FAILED' : 'FORGE COMPLETE'}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: isDefeat ? '#e05555' : '#f0e6c8' }}>
                {isDefeat ? 'DEFEATED' : `${correctCount} / ${questions.length}`}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', color: '#7a6a44', marginTop: '2px' }}>
                {isDefeat 
                  ? `${wrongCount} MISSES`
                  : questionSource === 'fallback'
                    ? 'Practice round — XP not awarded (offline questions)'
                    : `+${xpEarned} XP awarded`}
              </div>
            </div>
            <div style={{
              background: `rgba(${correctCount >= 8 ? '46,184,92' : correctCount >= 6 ? '232,160,32' : '224,85,85'},0.12)`,
              border: `1px solid rgba(${correctCount >= 8 ? '46,184,92' : correctCount >= 6 ? '232,160,32' : '224,85,85'},0.4)`,
              borderRadius: '3px', padding: '8px 12px',
              fontFamily: 'var(--font-pixel)', fontSize: '8px',
              color: accuracyColor(correctCount),
            }}>
              {Math.round((questions.length ? correctCount / questions.length : 0) * 100)}%
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
                      {q.content.question} — {q.content.correct_answer}
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
              onClick={() => fetchChallenges('vocabulary')}
              style={{
                width: '100%', padding: '11px',
                background: 'linear-gradient(135deg,#1a5c9e,#0e3a6e)',
                border: '1px solid rgba(26,92,158,0.5)', borderRadius: '3px',
                fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#f0e6c8', cursor: 'pointer',
              }}
            >
              ⚒ PLAY AGAIN
            </button>
            <button
              onClick={() => router.push('/play/academy')}
              style={{
                width: '100%', padding: '9px', background: 'transparent',
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

  // ── Playing ──────────────────────────────────────────────────────────────

  const current = questions[questionIndex]
  const correctCount = score
  const vocabWord = extractWord(current?.title ?? 'Word')
  const heatLevel = questions.length ? correctCount / questions.length : 0

  return (
    <>
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
          screenFlash={screenFlash === 'blue' ? 'green' : screenFlash}
          playerSize={64}
          enemySize={64}
          backgroundSrc="/images/lore/dustmere.png"
          atmosphere="dust"
          playerHpPct={Math.max(0, 100 - (sessionWrong * 25))}
        />

        {/* ── Question card ───────────────────────────────────────────────── */}
        <div
          key={questionIndex}
          style={{
            background: 'rgba(26,28,46,0.8)',
            border: '1px solid rgba(201,168,76,0.18)', borderRadius: '3px',
            padding: '14px 12px',
            animation: 'card-rise 0.25s ease',
          }}
        >
          {/* Vocabulary word header with letter-forge animation */}
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: '9px',
            textAlign: 'center', marginBottom: '8px',
            letterSpacing: '2px', lineHeight: 1.6,
          }}>
            ⚒{' '}
            {vocabWord.split('').map((ch, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  color: '#c9a84c',
                  animation: feedback === 'correct'
                    ? `letter-forge 0.4s ease forwards ${i * 50}ms`
                    : 'none',
                }}
              >
                {ch === ' ' ? '\u00a0' : ch}
              </span>
            ))}
          </div>

          {/* Question counter */}
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#7a6a44', textAlign: 'center', marginBottom: '10px', letterSpacing: '1px' }}>
            QUESTION {questionIndex + 1} OF 10
          </div>

          {/* Question text */}
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#f0e6c8',
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
              padding: '6px 8px', borderTop: '1px solid rgba(201,168,76,0.1)',
            }}>
              {current.content.explanation}
            </div>
          )}
        </div>

    </>
  )
}
