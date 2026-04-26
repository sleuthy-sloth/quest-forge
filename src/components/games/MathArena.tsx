'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AvatarPreview from '@/components/avatar/AvatarPreview'

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

type Phase = 'loading' | 'playing' | 'saving' | 'results'
type Feedback = null | 'correct' | 'wrong'
type ScreenFlash = 'green' | 'red' | null
type FetchErrorKind = 'network' | 'empty' | null

interface Props {
  ageTier: 'junior' | 'senior'
  householdId: string
  playerId: string
  avatarConfig: Record<string, unknown> | null
  displayName: string
  xpTotal: number
  xpAvailable: number
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

// ── XP calculation ────────────────────────────────────────────────────────────

function calcXp(correct: number, questions: Question[]): number {
  const potential = questions.reduce((sum, q) => sum + q.xp_reward, 0)
  const accuracy = correct / 10
  let multiplier: number
  if (accuracy === 1.0) multiplier = 1.0
  else if (accuracy >= 0.8) multiplier = 0.8
  else if (accuracy >= 0.6) multiplier = 0.5
  else return 10
  return Math.round(potential * multiplier)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MathArena({
  ageTier,
  householdId,
  playerId,
  avatarConfig,
  displayName,
  xpTotal,
  xpAvailable,
}: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Phase
  const [phase, setPhase] = useState<Phase>('loading')

  // Questions
  const [questions, setQuestions] = useState<Question[]>([])
  const [fetchErrorKind, setFetchErrorKind] = useState<FetchErrorKind>(null)

  // Playing state
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [dummyHit, setDummyHit] = useState(false)
  const [screenFlash, setScreenFlash] = useState<ScreenFlash>(null)
  const [chosenWrong, setChosenWrong] = useState<string | null>(null)

  // Timer refs for cleanup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function addTimer(id: ReturnType<typeof setTimeout>) {
    timersRef.current.push(id)
  }

  // Results
  const [xpEarned, setXpEarned] = useState(0)
  const [saveError, setSaveError] = useState(false)
  const [hasBoss, setHasBoss] = useState(false)

  // ── Fetch questions ──────────────────────────────────────────────────────
  // Runs AI generation and DB fallback IN PARALLEL. Prefers AI results when
  // they arrive quickly; falls back to the DB if AI fails. A 16 s safety
  // timeout caps the total wait regardless of source.

  const fetchQuestions = useCallback(async () => {
    setPhase('loading')
    setFetchErrorKind(null)
    setQuestionIndex(0)
    setScore(0)
    setAnswers([])
    setFeedback(null)
    setDummyHit(false)
    setScreenFlash(null)
    setChosenWrong(null)
    setSaveError(false)

    console.log('[MathArena] ageTier:', ageTier, 'householdId:', householdId?.slice(0, 8))

    // Kick off AI and DB at the same time — the winner may supply questions
    const aiPromise = fetch('/api/edu/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'math', age_tier: ageTier, count: 10 }),
      signal: AbortSignal.timeout(9000),
    })
      .then(async (res) => {
        if (!res.ok) return null
        const json = (await res.json()) as { questions?: Question[] }
        return json.questions && json.questions.length >= 5 ? json.questions : null
      })
      .catch(() => null)

    // Wrap dbPromise with its own timeout so it can't hang indefinitely.
    const dbPromise = (async (): Promise<Question[] | null> => {
      try {
        const queryPromise = supabase
          .from('edu_challenges')
          .select('id, title, content, xp_reward')
          .eq('subject', 'math')
          .eq('age_tier', ageTier)
          .eq('is_active', true)
          .limit(50)

        const result = await Promise.race([
          queryPromise,
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('db timeout')), 10_000),
          ),
        ])
        if (!result) return null
        const { data, error } = result as Awaited<typeof queryPromise>
        if (error) {
          console.error('[MathArena] DB query error:', JSON.stringify(error))
          return null
        }
        if (!data || data.length === 0) {
          console.warn('[MathArena] DB query returned 0 rows, ageTier:', ageTier)
          return null
        }
        return data as Question[]
      } catch (err) {
        console.error('[MathArena] DB query threw:', err)
        return null
      }
    })()

    // Safety net: 16 s is well above the parallel worst case (max 9 s / 12 s)
    const overallTimeout: Promise<never> = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 16_000),
    )

    try {
      // 1. Try AI first (may already be settled)
      const aiQuestions = await Promise.race([aiPromise, overallTimeout])
      if (aiQuestions) {
        setQuestions(shuffle(aiQuestions).slice(0, 10))
        setPhase('playing')
        return
      }

      // 2. AI fell through — wait for DB (which was running in parallel)
      const dbQuestions = await Promise.race<Question[] | null>([dbPromise, overallTimeout])
      if (dbQuestions) {
        setQuestions(shuffle(dbQuestions).slice(0, 10))
        setPhase('playing')
        return
      }

      // 3. Neither source delivered — use hardcoded fallback
      console.warn('[MathArena] AI + DB both failed, using fallback questions')
      setQuestions(shuffle(fallbackQuestions(ageTier)).slice(0, 10))
      setPhase('playing')
    } catch {
      console.error('[MathArena] overall timeout fetching questions')
      setFetchErrorKind('network')
    }
  }, [supabase, ageTier])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  useEffect(() => {
    const timers = timersRef.current
    return () => { timers.forEach(clearTimeout) }
  }, [])

  // ── Answer handler ───────────────────────────────────────────────────────

  function handleAnswer(option: string) {
    if (feedback !== null) return // debounce

    const current = questions[questionIndex]
    const correct = option === current.content.correct_answer
    const newAnswers = [...answers, option]

    if (correct) {
      const newScore = score + 1
      setScore(newScore)
      setAnswers(newAnswers)
      setFeedback('correct')
      setDummyHit(true)
      setScreenFlash('green')

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => setDummyHit(false), 500))
      addTimer(setTimeout(() => {
        if (questionIndex === 9) {
          finishGame(newScore, newAnswers, questions)
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
        }
      }, 800))
    } else {
      setAnswers(newAnswers)
      setFeedback('wrong')
      setChosenWrong(option)
      setScreenFlash('red')

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => {
        if (questionIndex === 9) {
          finishGame(score, newAnswers, questions)
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
          setChosenWrong(null)
        }
      }, 3000))
    }
  }

  // ── Save & transition to results ─────────────────────────────────────────

  async function finishGame(finalScore: number, finalAnswers: string[], qs: Question[]) {
    const earned = calcXp(finalScore, qs)
    setXpEarned(earned)
    setAnswers(finalAnswers)
    setPhase('saving')

    let anySaveError = false

    // 1. edu_completions
    try {
      await supabase.from('edu_completions').insert({
        household_id: householdId,
        challenge_id: qs[0].id,
        player_id:    playerId,
        score:        finalScore,
        completed_at: new Date().toISOString(),
        xp_awarded:   earned,
      })
    } catch {
      anySaveError = true
    }

    // 2. XP update
    try {
      await supabase
        .from('profiles')
        .update({
          xp_total:     xpTotal     + earned,
          xp_available: xpAvailable + earned,
        })
        .eq('id', playerId)
    } catch {
      anySaveError = true
    }

    // 3. Boss damage
    let foundBoss = false
    try {
      const { data: boss } = await supabase
        .from('story_chapters')
        .select('id, boss_current_hp')
        .eq('household_id', householdId)
        .eq('is_unlocked', false)
        .gt('boss_current_hp', 0)
        .order('week_number', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (boss) {
        foundBoss = true
        await supabase
          .from('story_chapters')
          .update({ boss_current_hp: Math.max(0, boss.boss_current_hp - earned) })
          .eq('id', boss.id)
      }
    } catch {
      anySaveError = true
    }

    setHasBoss(foundBoss)
    if (anySaveError) setSaveError(true)

    setPhase('results')
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  const current = questions[questionIndex]
  const correctCount = score

  // Accuracy badge color
  function accuracyColor(n: number): string {
    const pct = n / 10
    if (pct >= 0.8) return '#2eb85c'
    if (pct >= 0.6) return '#e8a020'
    return '#e05555'
  }

  // ── Loading phase ────────────────────────────────────────────────────────

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
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.3)', borderRadius: '3px',
                padding: '9px 14px', cursor: 'pointer',
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

  // ── Saving phase ─────────────────────────────────────────────────────────

  if (phase === 'saving') {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#c9a84c', letterSpacing: '2px' }}>
          SAVING RESULTS…
        </div>
      </div>
    )
  }

  // ── Results phase ─────────────────────────────────────────────────────────

  if (phase === 'results') {
    return (
      <div className="px-4 py-6" style={{ maxWidth: '480px', margin: '0 auto' }}>
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
                +{xpEarned} XP · {hasBoss ? `−${xpEarned} Boss HP` : 'No active boss'}
              </div>
            </div>
            <div style={{
              background: `rgba(${correctCount >= 8 ? '46,184,92' : correctCount >= 6 ? '232,160,32' : '224,85,85'},0.12)`,
              border: `1px solid rgba(${correctCount >= 8 ? '46,184,92' : correctCount >= 6 ? '232,160,32' : '224,85,85'},0.4)`,
              borderRadius: '3px', padding: '8px 12px',
              fontFamily: 'var(--font-pixel)', fontSize: '8px',
              color: accuracyColor(correctCount),
            }}>
              {Math.round(correctCount / 10 * 100)}%
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
              onClick={fetchQuestions}
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
              onClick={() => router.push('/play/academy')}
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
      <style>{`
        @keyframes dummy-hit {
          0%   { transform: translateX(0);    border-color: rgba(196,58,0,0.4); }
          25%  { transform: translateX(-4px); border-color: #e05555; }
          50%  { transform: translateX(4px);  border-color: #e05555; }
          75%  { transform: translateX(-2px); border-color: #e05555; }
          100% { transform: translateX(0);    border-color: rgba(196,58,0,0.4); }
        }
      `}</style>

      <div className="px-4 pt-4 pb-8" style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* ── Arena bar ─────────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(180deg,#0d0f1c,#070910)',
          borderLeft: '3px solid #c43a00',
          border: '1px solid rgba(196,58,0,0.2)',
          borderRadius: '3px', padding: '10px 10px',
          marginBottom: '12px', overflow: 'hidden',
        }}>

          {/* Screen flash overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: screenFlash === 'green'
              ? 'rgba(46,184,92,0.25)'
              : screenFlash === 'red'
              ? 'rgba(224,85,85,0.25)'
              : 'transparent',
            transition: 'background 0.1s',
            zIndex: 10,
          }} />

          {/* Left: Player */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <AvatarPreview avatarConfig={avatarConfig} size={64} />
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#c9a84c', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            {/* Player HP bar — always full (cosmetic) */}
            <div style={{ width: '64px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#2eb85c,#5aab6e)', borderRadius: '2px' }} />
            </div>
          </div>

          {/* Center: VS + score pips + counter */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{
              fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#c43a00',
              background: 'rgba(196,58,0,0.12)', border: '1px solid rgba(196,58,0,0.3)',
              borderRadius: '2px', padding: '3px 6px',
            }}>
              VS
            </div>
            {/* Score pips */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: '7px', height: '7px', borderRadius: '1px',
                    background: i < correctCount ? '#c9a84c' : 'transparent',
                    border: `1px solid ${i < correctCount ? '#c9a84c' : 'rgba(201,168,76,0.3)'}`,
                  }}
                />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#7a6a44' }}>
              Q{questionIndex + 1} / 10
            </div>
          </div>

          {/* Right: Training dummy */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            {/* Dummy sprite */}
            <div style={{
              width: '64px', height: '64px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
              background: 'linear-gradient(135deg,#1a0a0a,#2e0808)',
              border: '2px solid rgba(196,58,0,0.4)', borderRadius: '2px',
              animation: dummyHit ? 'dummy-hit 0.4s ease' : 'none',
            }}>
              <div style={{ width: '18px', height: '18px', background: '#5a2a0a', borderRadius: '50%' }} />
              <div style={{ width: '24px', height: '28px', background: '#5a2a0a', borderRadius: '2px' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#c43a00' }}>
              TARGET
            </div>
            {/* Dummy HP bar — depletes with correct answers */}
            <div style={{ width: '64px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${Math.max(0, (10 - correctCount) / 10 * 100)}%`,
                background: 'linear-gradient(90deg,#e05555,#ff7070)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>

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
