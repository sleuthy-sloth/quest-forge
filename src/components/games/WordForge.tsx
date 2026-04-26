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
type ScreenFlash = 'blue' | 'red' | null
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

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
  const pct = n / 10
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
  xpTotal,
  xpAvailable,
}: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
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
  const [hasBoss, setHasBoss] = useState(false)

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
    setAnswers([])
    setFeedback(null)
    setIronHit(false)
    setScreenFlash(null)
    setChosenWrong(null)
    setSaveError(false)

    // Kick off AI and DB at the same time — the winner may supply questions
    const aiPromise = fetch('/api/edu/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'vocabulary', age_tier: ageTier, count: 10 }),
      signal: AbortSignal.timeout(9000),
    })
      .then(async (res) => {
        if (!res.ok) return null
        const json = (await res.json()) as { questions?: Question[] }
        return json.questions && json.questions.length >= 5 ? json.questions : null
      })
      .catch(() => null)

    const dbPromise = (async (): Promise<Question[] | null> => {
      try {
        const { data, error } = await supabase
          .from('edu_challenges')
          .select('id, title, content, xp_reward')
          .eq('subject', 'vocabulary')
          .eq('age_tier', ageTier)
          .eq('is_active', true)
          .order('id')
          .limit(50)
          .abortSignal(AbortSignal.timeout(12000))
        if (error || !data || data.length === 0) return null
        return data as Question[]
      } catch {
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

      // 3. Neither source delivered
      setFetchErrorKind('network')
    } catch {
      console.error('[WordForge] overall timeout fetching questions')
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
    if (feedback !== null) return

    const current = questions[questionIndex]
    const isCorrect = option === current.content.correct_answer
    const newAnswers = [...answers, option]

    if (isCorrect) {
      const newScore = score + 1
      setScore(newScore)
      setAnswers(newAnswers)
      setFeedback('correct')
      setIronHit(true)
      setScreenFlash('blue')

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => setIronHit(false), 600))
      addTimer(setTimeout(() => {
        if (questionIndex === 9) {
          finishGame(newScore, newAnswers, questions)
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

  // ── Save & results ───────────────────────────────────────────────────────

  async function finishGame(finalScore: number, finalAnswers: string[], qs: Question[]) {
    const earned = calcXp(finalScore, qs)
    setXpEarned(earned)
    setAnswers(finalAnswers)
    setPhase('saving')

    let anySaveError = false

    try {
      await supabase.from('edu_completions').insert({
        household_id: householdId,
        challenge_id: qs[0].id,
        player_id:    playerId,
        score:        finalScore,
        completed_at: new Date().toISOString(),
        xp_awarded:   earned,
      })
    } catch { anySaveError = true }

    try {
      await supabase
        .from('profiles')
        .update({ xp_total: xpTotal + earned, xp_available: xpAvailable + earned })
        .eq('id', playerId)
    } catch { anySaveError = true }

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
    } catch { anySaveError = true }

    setHasBoss(foundBoss)
    if (anySaveError) setSaveError(true)
    setPhase('results')
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

  // ── Saving ───────────────────────────────────────────────────────────────

  if (phase === 'saving') {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#c9a84c', letterSpacing: '2px' }}>
          SAVING RESULTS…
        </div>
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
  const heatLevel = correctCount / 10

  return (
    <>
      <style>{`
        @keyframes iron-heat {
          0%   { background: #555; box-shadow: none; }
          30%  { background: #ff8c00; box-shadow: 0 0 10px #ff4400; }
          60%  { background: #fff0c0; box-shadow: 0 0 18px #ffaa00, 0 0 6px #fff; }
          100% { background: #cc5500; box-shadow: 0 0 6px rgba(204,85,0,0.4); }
        }
        @keyframes letter-forge {
          0%   { color: #fff8e0; text-shadow: 0 0 20px #fff, 0 0 40px #ffcc00, 0 0 60px #ff6600; }
          40%  { color: #ffaa00; text-shadow: 0 0 14px #ffcc00, 0 0 28px #ff6600; }
          80%  { color: #c9a84c; text-shadow: 0 0 8px rgba(201,168,76,0.6); }
          100% { color: #c9a84c; text-shadow: 0 0 4px rgba(201,168,76,0.3); }
        }
      `}</style>

      <div className="px-4 pt-4 pb-8" style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* ── Arena bar ──────────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(180deg,#0d0f1c,#070910)',
          borderLeft: '3px solid #1a5c9e',
          border: '1px solid rgba(26,92,158,0.2)',
          borderRadius: '3px', padding: '10px 10px',
          marginBottom: '12px', overflow: 'hidden',
        }}>

          {/* Screen flash overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: screenFlash === 'blue'
              ? 'rgba(26,92,158,0.25)'
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
            <div style={{ width: '64px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#2eb85c,#5aab6e)', borderRadius: '2px' }} />
            </div>
          </div>

          {/* Center: VS + pips + counter */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{
              fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#1a5c9e',
              background: 'rgba(26,92,158,0.12)', border: '1px solid rgba(26,92,158,0.3)',
              borderRadius: '2px', padding: '3px 6px',
            }}>
              VS
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{
                  width: '7px', height: '7px', borderRadius: '1px',
                  background: i < correctCount ? '#c9a84c' : 'transparent',
                  border: `1px solid ${i < correctCount ? '#c9a84c' : 'rgba(201,168,76,0.3)'}`,
                }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#7a6a44' }}>
              Q{questionIndex + 1} / 10
            </div>
          </div>

          {/* Right: Anvil */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            {/* Iron bar */}
            <div style={{
              width: '56px', height: '9px',
              background: ironHit ? undefined : ironBarColor(heatLevel),
              borderRadius: '1px', border: '1px solid #666',
              animation: ironHit ? 'iron-heat 0.6s ease forwards' : 'none',
            }} />
            {/* Anvil body (CSS pixel art) */}
            <div style={{ width: '64px', height: '48px', position: 'relative' }}>
              {/* Anvil horn (top-left protrusion) */}
              <div style={{
                position: 'absolute', top: 0, left: 4, width: '18px', height: '12px',
                background: 'linear-gradient(180deg,#4a3520,#2a1a08)',
                border: '1px solid rgba(201,168,76,0.4)', borderRadius: '1px 4px 0 0',
              }} />
              {/* Anvil face (top flat surface) */}
              <div style={{
                position: 'absolute', top: 0, left: 18, right: 4, height: '14px',
                background: 'linear-gradient(180deg,#5a4020,#3a2810)',
                border: '1px solid rgba(201,168,76,0.4)', borderRadius: '1px',
              }} />
              {/* Anvil waist */}
              <div style={{
                position: 'absolute', top: 14, left: 14, right: 14, height: '10px',
                background: '#3a2810',
              }} />
              {/* Anvil base */}
              <div style={{
                position: 'absolute', bottom: 0, left: 2, right: 2, height: '20px',
                background: 'linear-gradient(180deg,#4a3018,#2a1a08)',
                border: '1px solid rgba(201,168,76,0.35)', borderRadius: '0 0 3px 3px',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#1a5c9e' }}>
              FORGE
            </div>
            {/* Heat bar — fills as correct answers accumulate */}
            <div style={{ width: '64px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${(correctCount / 10) * 100}%`,
                background: 'linear-gradient(90deg,#ff4400,#ffaa00)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>

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

      </div>
    </>
  )
}
