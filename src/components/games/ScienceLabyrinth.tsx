'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AvatarPreview from '@/components/avatar/AvatarPreview'

// ── Types ──────────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────────

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
  if (accuracy === 1.0) return Math.round(potential * 1.0)
  if (accuracy >= 0.8)  return Math.round(potential * 0.8)
  if (accuracy >= 0.6)  return Math.round(potential * 0.5)
  return 10
}

function accuracyColor(n: number): string {
  const pct = n / 10
  if (pct >= 0.8) return '#2eb85c'
  if (pct >= 0.6) return '#e8a020'
  return '#e05555'
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ScienceLabyrinth({
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

  // Phase + fetch
  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [fetchErrorKind, setFetchErrorKind] = useState<FetchErrorKind>(null)

  // Playing state
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [screenFlash, setScreenFlash] = useState<ScreenFlash>(null)
  const [chosenWrong, setChosenWrong] = useState<string | null>(null)

  // Maze animation state
  const [corridorAdvancing, setCorridorAdvancing] = useState(false)
  const [wallVisible, setWallVisible] = useState(false)  // drives drop/lift animation class
  const [wallMounted, setWallMounted] = useState(false)  // controls DOM presence

  // Results state
  const [xpEarned, setXpEarned] = useState(0)
  const [saveError, setSaveError] = useState(false)
  const [hasBoss, setHasBoss] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  function addTimer(id: ReturnType<typeof setTimeout>) {
    timersRef.current.push(id)
  }

  // ── Fetch questions ────────────────────────────────────────────────────────

  const fetchQuestions = useCallback(async () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setPhase('loading')
    setFetchErrorKind(null)
    setQuestionIndex(0)
    setScore(0)
    setAnswers([])
    setFeedback(null)
    setScreenFlash(null)
    setChosenWrong(null)
    setSaveError(false)
    // Reset maze animation state
    setCorridorAdvancing(false)
    setWallVisible(false)
    setWallMounted(false)

    const { data, error } = await supabase
      .from('edu_challenges')
      .select('id, title, content, xp_reward')
      .eq('subject', 'science')
      .eq('age_tier', ageTier)
      .eq('is_active', true)
      .order('id')
      .limit(50)

    if (error) { setFetchErrorKind('network'); return }
    if (!data || data.length === 0) { setFetchErrorKind('empty'); return }

    setQuestions(shuffle(data as Question[]).slice(0, 10))
    setPhase('playing')
  }, [supabase, ageTier])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  useEffect(() => {
    const timers = timersRef.current
    return () => { timers.forEach(clearTimeout) }
  }, [])

  // ── Save & results ─────────────────────────────────────────────────────────

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

  // ── Loading phase ──────────────────────────────────────────────────────────

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
                background: 'linear-gradient(135deg,#1e8a4a,#0f5a30)',
                border: '1px solid rgba(30,138,74,0.5)', borderRadius: '3px',
                padding: '10px 16px', cursor: 'pointer',
              }}
            >
              TRY AGAIN
            </button>
          </>
        ) : (
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#c9a84c', letterSpacing: '2px' }}>
            Charting the Labyrinth…
          </div>
        )}
      </div>
    )
  }

  // ── Saving phase ───────────────────────────────────────────────────────────

  if (phase === 'saving') {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#c9a84c', letterSpacing: '2px' }}>
          MAPPING YOUR ROUTE…
        </div>
      </div>
    )
  }

  // ── Results phase ──────────────────────────────────────────────────────────

  if (phase === 'results') {
    const correctCount = score
    const cleared = correctCount >= 6
    return (
      <div className="px-4 py-6" style={{ maxWidth: '480px', margin: '0 auto' }}>
        {saveError && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '12px', color: '#e05555',
            background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.3)',
            borderRadius: '3px', padding: '8px 12px', marginBottom: '12px', textAlign: 'center',
          }}>
            Results may not have saved — check your connection.
          </div>
        )}

        <div style={{
          background: 'linear-gradient(180deg,#0d0f1c,#070910)',
          border: '1px solid rgba(30,138,74,0.2)', borderRadius: '4px',
          padding: '16px 14px', marginBottom: '12px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#1e8a4a', marginBottom: '4px', letterSpacing: '1px' }}>
                {cleared ? 'LABYRINTH CLEARED' : 'LABYRINTH ATTEMPTED'}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: '#f0e6c8' }}>
                {correctCount} / 10
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', color: '#7a6a44', marginTop: '2px' }}>
                +{xpEarned} XP · Maze Explored{hasBoss ? ` · −${xpEarned} Boss HP` : ' · No active threat'}
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
                    background: wasCorrect ? 'rgba(30,138,74,0.06)' : 'rgba(224,85,85,0.06)',
                    borderLeft: `2px solid ${wasCorrect ? '#1e8a4a' : '#e05555'}`,
                    borderRadius: '0 2px 2px 0', padding: '5px 8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: wasCorrect ? '#1e8a4a' : '#e05555', fontSize: '12px', flexShrink: 0 }}>
                      {wasCorrect ? '✓' : '✗'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: wasCorrect ? '#1e8a4a' : '#e05555', flexShrink: 0 }}>
                      {wasCorrect ? 'Path clear' : 'Dead end'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#b09a6e' }}>
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
                background: 'linear-gradient(135deg,#1e8a4a,#0f5a30)',
                border: '1px solid rgba(30,138,74,0.5)', borderRadius: '3px',
                fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#f0e6c8', cursor: 'pointer',
              }}
            >
              🧪 ENTER AGAIN
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

  // ── Answer handler ─────────────────────────────────────────────────────────

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
      setCorridorAdvancing(true)
      setScreenFlash('green')

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => setCorridorAdvancing(false), 600))
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
      setWallMounted(true)
      setWallVisible(true)

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => {
        // Start wall lift
        setWallVisible(false)
        // Remove wall from DOM after lift completes (300ms) so it can't eat pointer events
        addTimer(setTimeout(() => setWallMounted(false), 300))
        // Advance question
        if (questionIndex === 9) {
          setFeedback(null)
          setChosenWrong(null)
          finishGame(score, newAnswers, questions)
        } else {
          setQuestionIndex(qi => qi + 1)
          setFeedback(null)
          setChosenWrong(null)
        }
      }, 3000))
    }
  }

  // ── Playing phase render ────────────────────────────────────────────────────

  const current = questions[questionIndex]
  const correctCount = score

  return (
    <>
      <style>{`
        @keyframes corridor-advance {
          0%   { transform: scale(1);    opacity: 1; }
          40%  { transform: scale(1.18); opacity: 0.7; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes dead-end-drop {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(0%); }
        }
        @keyframes dead-end-lift {
          0%   { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="px-4 pt-4 pb-8" style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* ── Arena bar ──────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(180deg,#0d0f1c,#070910)',
          border: '1px solid rgba(30,138,74,0.2)',
          borderLeft: '3px solid #1e8a4a',
          borderRadius: '3px', padding: '10px',
          marginBottom: '12px', overflow: 'hidden',
        }}>

          {/* Screen flash overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: screenFlash === 'green'
              ? 'rgba(30,138,74,0.25)'
              : screenFlash === 'red'
              ? 'rgba(224,85,85,0.25)'
              : 'transparent',
            transition: 'background 0.1s',
            zIndex: 10,
          }} />

          {/* Left: Player */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <AvatarPreview avatarConfig={avatarConfig} size={64} />
            <div style={{
              fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#c9a84c',
              maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {displayName}
            </div>
            <div style={{ width: '64px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#2eb85c,#5aab6e)', borderRadius: '2px' }} />
            </div>
          </div>

          {/* Center: VS + pips + counter */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{
              fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#1e8a4a',
              background: 'rgba(30,138,74,0.12)', border: '1px solid rgba(30,138,74,0.3)',
              borderRadius: '2px', padding: '3px 6px',
            }}>
              VS
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{
                  width: '7px', height: '7px', borderRadius: '1px',
                  background: i < correctCount ? '#1e8a4a' : 'transparent',
                  border: `1px solid ${i < correctCount ? '#1e8a4a' : 'rgba(30,138,74,0.3)'}`,
                }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#7a6a44' }}>
              Q{questionIndex + 1} / 10
            </div>
          </div>

          {/* Right: First-person corridor */}
          <div style={{ flexShrink: 0, position: 'relative', width: 64, height: 64, background: '#0a0c14', borderRadius: '2px', overflow: 'hidden' }}>

            {/* Corridor inner group — target of corridor-advance animation */}
            <div style={{
              position: 'absolute', inset: 0,
              animation: corridorAdvancing ? 'corridor-advance 0.4s ease-in-out forwards' : 'none',
            }}>
              {/* Floor */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0, height: '50%',
                clipPath: 'polygon(0% 100%, 100% 100%, 75% 0%, 25% 0%)',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)',
                borderTop: '1px solid rgba(30,138,74,0.15)',
              }} />
              {/* Ceiling */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '50%',
                clipPath: 'polygon(0% 0%, 100% 0%, 75% 100%, 25% 100%)',
                background: 'linear-gradient(180deg, #0a0a14 0%, #0d0d1a 100%)',
                borderBottom: '1px solid rgba(30,138,74,0.1)',
              }} />
              {/* Left wall */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '25%', height: '100%',
                clipPath: 'polygon(0% 0%, 100% 25%, 100% 75%, 0% 100%)',
                background: 'linear-gradient(90deg, #0d1a0d 0%, #142814 100%)',
                borderRight: '1px solid rgba(30,138,74,0.12)',
              }} />
              {/* Right wall */}
              <div style={{
                position: 'absolute',
                top: 0, right: 0, width: '25%', height: '100%',
                clipPath: 'polygon(0% 25%, 100% 0%, 100% 100%, 0% 75%)',
                background: 'linear-gradient(270deg, #0d1a0d 0%, #142814 100%)',
                borderLeft: '1px solid rgba(30,138,74,0.12)',
              }} />
              {/* Inner corridor frame lines */}
              <div style={{
                position: 'absolute',
                top: '25%', left: '25%', right: '25%', bottom: '25%',
                border: '1px solid rgba(30,138,74,0.2)',
              }} />
              {/* Vanishing-point glow */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 20, height: 20,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(30,138,74,0.6) 0%, transparent 100%)',
              }} />
            </div>

            {/* Dead-end wall overlay — mounted when wallMounted, animates on wallVisible */}
            {wallMounted && (
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: 64, height: 64,
                zIndex: 5,
                background: '#3a3530',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,0,0,0.15) 6px, rgba(0,0,0,0.15) 7px)',
                animation: wallVisible
                  ? 'dead-end-drop 0.3s ease-in forwards'
                  : 'dead-end-lift 0.3s ease-out forwards',
              }}>
                {/* Stone crack SVG */}
                <svg
                  viewBox="0 0 64 64"
                  width={64} height={64}
                  style={{ position: 'absolute', inset: 0, opacity: 0.3 }}
                  aria-hidden="true"
                >
                  <polyline points="32,4 28,20 34,28 26,44 30,60" fill="none" stroke="#1a0e08" strokeWidth="1.5" strokeLinejoin="round" />
                  <polyline points="36,8 40,22 35,30" fill="none" stroke="#1a0e08" strokeWidth="1" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            {/* Label */}
            <div style={{
              position: 'absolute', bottom: 2, left: 0, right: 0,
              fontFamily: 'var(--font-pixel)', fontSize: '5px',
              color: '#1e8a4a', textAlign: 'center', letterSpacing: '1px',
              pointerEvents: 'none',
            }}>
              LABYRINTH
            </div>
          </div>
        </div>

        {/* ── Question card ────────────────────────────────────────── */}
        <div
          key={questionIndex}
          style={{
            background: 'rgba(13,15,28,0.9)',
            border: '1px solid rgba(201,168,76,0.18)', borderRadius: '3px',
            padding: '14px 12px',
            animation: 'card-rise 0.25s ease',
          }}
        >
          {/* Card header */}
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: '7px',
            color: '#1e8a4a', textAlign: 'center',
            marginBottom: '4px', letterSpacing: '2px',
          }}>
            🧪 SCIENCE QUESTION
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: '5px',
            color: '#7a6a44', textAlign: 'center',
            marginBottom: '10px', letterSpacing: '1px',
          }}>
            QUESTION {questionIndex + 1} OF 10
          </div>

          {/* Question text */}
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: '9px', color: '#f0e6c8',
            textAlign: 'center', lineHeight: 1.9, marginBottom: '16px',
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
                if (isCorrect)     borderColor = '#2eb85c'
                else if (isChosen) borderColor = '#e05555'
              } else if (feedback === 'correct' && isCorrect) {
                borderColor = '#1e8a4a'
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

          {/* Explanation — wrong answers only */}
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
