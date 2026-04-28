'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { revalidatePlayCache } from '@/app/actions/cache'
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

type Phase = 'loading' | 'playing' | 'results'
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

function accuracyColor(n: number): string {
  const pct = questions.length ? n / questions.length : 0
  if (pct >= 0.8) return '#2eb85c'
  if (pct >= 0.6) return '#e8a020'
  return '#e05555'
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

  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionSource, setQuestionSource] = useState<QuestionSource | null>(null)
  const [fetchErrorKind, setFetchErrorKind] = useState<FetchErrorKind>(null)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [ironHit, setIronHit] = useState(false)
  const [screenFlash, setScreenFlash] = useState<ScreenFlash>(null)
  const [chosenWrong, setChosenWrong] = useState<string | null>(null)

  const [xpEarned, setXpEarned] = useState(0)
  const [saveError, setSaveError] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  function addTimer(id: ReturnType<typeof setTimeout>) {
    timersRef.current.push(id)
  }

  // ── Fetch questions ──────────────────────────────────────────────────────
  // Runs AI generation and DB fallback IN PARALLEL. Prefers AI results when
  // they arrive quickly; falls back to the DB if AI fails.

  const fetchQuestions = useCallback(async () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setPhase('loading')
    setFetchErrorKind(null)
    setQuestionIndex(0)
    setScore(0)
    setXpEarned(0)
    setAnswers([])
    setFeedback(null)
    setIronHit(false)
    setScreenFlash(null)
    setChosenWrong(null)
    setSaveError(false)
    setQuestionSource(null)

    console.log('[WordForge] ageTier:', ageTier, 'householdId:', householdId?.slice(0, 8))

    // Kick off AI and DB at the same time — the winner may supply questions
    const aiPromise = fetch('/api/edu/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'vocabulary', age_tier: ageTier, count: 5 }),
      signal: AbortSignal.timeout(30000),
    })
      .then(async (res) => {
        if (!res.ok) return null
        const json = (await res.json()) as { questions?: Question[] }
        return json.questions && json.questions.length >= 5 ? json.questions : null
      })
      .catch(() => null)

    // Wrap dbPromise with its own timeout so it can't hang indefinitely.
    // Uses a server API route (which reliably connects) to bypass the
    // browser-side Supabase REST connection issue.
    const dbPromise = (async (): Promise<Question[] | null> => {
      try {
        const res = await fetch(`/api/edu/challenges?subject=vocabulary&age_tier=${ageTier}&count=5`, {
          signal: AbortSignal.timeout(25000),
        })
        if (!res.ok) {
          console.error('[WordForge] API route error:', res.status)
          return null
        }
        const json = (await res.json()) as { questions?: Question[] }
        if (!json.questions || json.questions.length === 0) {
          console.warn('[WordForge] API route returned 0 questions, ageTier:', ageTier)
          return null
        }
        return json.questions
      } catch (err) {
        console.error('[WordForge] API route threw:', err)
        return null
      }
    })()

    // Safety net: 16 s is well above the parallel worst case (max 9 s / 12 s)
    const overallTimeout: Promise<never> = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 32_000),
    )

    try {
      const aiQuestions = await Promise.race([aiPromise, overallTimeout])
      if (aiQuestions) {
        setQuestions(shuffle(aiQuestions).slice(0, 5))
        setQuestionSource('ai')
        setPhase('playing')
        return
      }

      const dbQuestions = await Promise.race<Question[] | null>([dbPromise, overallTimeout])
      if (dbQuestions) {
        setQuestions(shuffle(dbQuestions).slice(0, 5))
        setQuestionSource('db')
        setPhase('playing')
        return
      }

      console.warn('[WordForge] AI + DB both failed, using fallback questions')
      setQuestions(shuffle(fallbackQuestions(ageTier)).slice(0, 5))
      setQuestionSource('fallback')
      setPhase('playing')
    } catch {
      console.error('[WordForge] overall timeout fetching questions')
      setFetchErrorKind('network')
    }
  }, [ageTier, householdId])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

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
  // Inserts one row in edu_completions per answered question. The DB trigger
  // `handle_edu_completed` atomically awards XP and deals boss damage.

  async function recordAnswer(question: Question, isCorrect: boolean) {
    if (!UUID_RE.test(question.id)) return

    const xpToAward = isCorrect ? question.xp_reward : 0
    if (isCorrect) setXpEarned((prev) => prev + xpToAward)

    try {
      const { error } = await supabase.from('edu_completions').insert({
        household_id: householdId,
        challenge_id: question.id,
        player_id:    playerId,
        score:        isCorrect ? 1 : 0,
        completed_at: new Date().toISOString(),
        xp_awarded:   xpToAward,
      })
      if (error) {
        console.error('[WordForge] edu_completions insert failed:', error)
        setSaveError(true)
      }
    } catch (err) {
      console.error('[WordForge] edu_completions insert threw:', err)
      setSaveError(true)
    }
  }

  function handleAnswer(option: string) {
    if (feedback !== null) return

    const current = questions[questionIndex]
    const isCorrect = option === current.content.correct_answer
    const newAnswers = [...answers, option]

    void recordAnswer(current, isCorrect)

    if (isCorrect) {
      const newScore = score + 1
      setScore(newScore)
      setAnswers(newAnswers)
      setFeedback('correct')
      setIronHit(true)
      setScreenFlash('blue')
      arenaRef.current?.triggerPlayerAttack()

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => setIronHit(false), 600))
      addTimer(setTimeout(() => {
        if (questionIndex === questions.length - 1) {
          setAnswers(newAnswers)
          setPhase('results')
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
        }
      }, 1000))
    } else {
      setAnswers(newAnswers)
      setFeedback('wrong')
      setChosenWrong(option)
      setScreenFlash('red')
      arenaRef.current?.triggerEnemyAttack()

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => {
        if (questionIndex === questions.length - 1) {
          setAnswers(newAnswers)
          setPhase('results')
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
          setChosenWrong(null)
        }
      }, 3000))
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        {fetchErrorKind === 'empty' ? (
          <>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', color: '#c9a84c', marginBottom: '16px' }}>
              No challenges available.
            </div>
            <button
              onClick={() => router.push('/play/academy')}
              style={{
                fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#c9a84c',
                background: 'transparent', border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '3px', padding: '9px 14px', cursor: 'pointer',
              }}
            >
              ← BACK TO ACADEMY
            </button>
          </>
        ) : fetchErrorKind === 'network' ? (
          <>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', color: '#e05555', marginBottom: '16px' }}>
              Failed to load questions.
            </div>
            <button
              onClick={fetchQuestions}
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

  // ── Results ──────────────────────────────────────────────────────────────

  if (phase === 'results') {
    const correctCount = score
    return (
      <div className="px-4 py-6" style={{ maxWidth: '480px', margin: '0 auto' }}>
        {saveError && (
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
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#7a6a44', marginBottom: '4px', letterSpacing: '1px' }}>
                FORGE COMPLETE
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: '#f0e6c8' }}>
                {correctCount} / {questions.length}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', color: '#7a6a44', marginTop: '2px' }}>
                {questionSource === 'fallback'
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
              onClick={fetchQuestions}
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
  const vocabWord = extractWord(current.title)
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
          totalQuestions={questions.length}
          questionSource={questionSource}
          screenFlash={screenFlash === 'blue' ? 'green' : screenFlash}
          playerSize={64}
          enemySize={64}
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
            QUESTION {questionIndex + 1} OF {questions.length}
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
