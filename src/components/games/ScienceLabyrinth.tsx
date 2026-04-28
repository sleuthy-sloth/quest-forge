'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BattleArena, { type BattleArenaHandle } from '@/components/games/BattleArena'
import { ENEMY_PRESETS, DEFAULT_AVATAR_CONFIG } from '@/lib/constants/enemies'
import { SLUG_PRESET } from '@/lib/constants/academy'
import type { AnimationPreset } from '@/lib/constants/lpc-animations'
import type { AvatarConfig } from '@/types/avatar'

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

type Phase = 'loading' | 'playing' | 'results'
type Feedback = null | 'correct' | 'wrong'
type ScreenFlash = 'green' | 'red' | null
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Hardcoded fallback questions used when AI + DB both fail. */
function fallbackQuestions(ageTier: 'junior' | 'senior'): Question[] {
  const bank: Question[] = ageTier === 'junior'
    ? [
        { id: 'fb_s1', title: 'Water cycle', content: { question: 'What is the process called when water turns into vapor?', options: ['Condensation', 'Evaporation', 'Precipitation', 'Collection'], correct_answer: 'Evaporation', explanation: 'Evaporation is when water turns into vapor from heat.' }, xp_reward: 25 },
        { id: 'fb_s2', title: 'Planets', content: { question: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correct_answer: 'Mercury', explanation: 'Mercury is the closest planet to the Sun.' }, xp_reward: 25 },
        { id: 'fb_s3', title: 'Mammals', content: { question: 'Which of these is a mammal?', options: ['Snake', 'Frog', 'Whale', 'Lizard'], correct_answer: 'Whale', explanation: 'Whales are mammals that live in the ocean.' }, xp_reward: 20 },
        { id: 'fb_s4', title: 'Gravity', content: { question: 'Who discovered gravity?', options: ['Einstein', 'Newton', 'Galileo', 'Darwin'], correct_answer: 'Newton', explanation: 'Isaac Newton discovered gravity in the 1600s.' }, xp_reward: 20 },
        { id: 'fb_s5', title: 'Leaves', content: { question: 'What gas do plants absorb from the air?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct_answer: 'Carbon dioxide', explanation: 'Plants absorb CO₂ to make food through photosynthesis.' }, xp_reward: 25 },
        { id: 'fb_s6', title: 'Solar system', content: { question: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correct_answer: '8', explanation: 'There are 8 planets in our solar system.' }, xp_reward: 20 },
        { id: 'fb_s7', title: 'Materials', content: { question: 'Which material is a good conductor of electricity?', options: ['Plastic', 'Wood', 'Copper', 'Glass'], correct_answer: 'Copper', explanation: 'Copper is a metal that conducts electricity well.' }, xp_reward: 25 },
        { id: 'fb_s8', title: 'Human body', content: { question: 'How many bones are in the human body?', options: ['106', '206', '306', '406'], correct_answer: '206', explanation: 'An adult human has 206 bones.' }, xp_reward: 25 },
        { id: 'fb_s9', title: 'Weather', content: { question: 'What instrument measures temperature?', options: ['Barometer', 'Thermometer', 'Hygrometer', 'Anemometer'], correct_answer: 'Thermometer', explanation: 'A thermometer measures temperature.' }, xp_reward: 20 },
        { id: 'fb_s10', title: 'Life cycle', content: { question: 'What is the first stage in a butterfly life cycle?', options: ['Caterpillar', 'Pupa', 'Egg', 'Adult'], correct_answer: 'Egg', explanation: 'A butterfly starts life as an egg.' }, xp_reward: 20 },
      ]
    : [
        { id: 'fb_s1', title: 'DNA', content: { question: 'What does DNA stand for?', options: ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Double Nuclear Acid', 'Dextrose Nucleic Acid'], correct_answer: 'Deoxyribonucleic Acid', explanation: 'DNA is deoxyribonucleic acid, the molecule that carries genetic instructions.' }, xp_reward: 35 },
        { id: 'fb_s2', title: 'Photosynthesis', content: { question: 'What is the main product of photosynthesis?', options: ['Oxygen only', 'Glucose', 'Water', 'ATP'], correct_answer: 'Glucose', explanation: 'Photosynthesis produces glucose (sugar) and oxygen from CO₂ and water.' }, xp_reward: 35 },
        { id: 'fb_s3', title: 'Newton\'s laws', content: { question: 'An object at rest stays at rest unless acted upon by a force. Which law is this?', options: ['First', 'Second', 'Third', 'Fourth'], correct_answer: 'First', explanation: 'This is Newton\'s First Law of Motion (inertia).' }, xp_reward: 35 },
        { id: 'fb_s4', title: 'Elements', content: { question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct_answer: 'Au', explanation: 'Au comes from the Latin word "aurum" meaning gold.' }, xp_reward: 30 },
        { id: 'fb_s5', title: 'Velocity', content: { question: 'What is the difference between speed and velocity?', options: ['Velocity has direction', 'Velocity is faster', 'They are the same', 'Velocity is average'], correct_answer: 'Velocity has direction', explanation: 'Velocity is speed with a direction, while speed is scalar.' }, xp_reward: 35 },
        { id: 'fb_s6', title: 'pH scale', content: { question: 'What pH value is neutral?', options: ['0', '7', '14', '1'], correct_answer: '7', explanation: 'A pH of 7 is neutral, like pure water.' }, xp_reward: 30 },
        { id: 'fb_s7', title: 'Mitosis', content: { question: 'How many daughter cells does mitosis produce?', options: ['1', '2', '4', '8'], correct_answer: '2', explanation: 'Mitosis produces 2 identical daughter cells.' }, xp_reward: 35 },
        { id: 'fb_s8', title: 'Electricity', content: { question: 'What is the unit of electric current?', options: ['Volt', 'Ohm', 'Ampere', 'Watt'], correct_answer: 'Ampere', explanation: 'Electric current is measured in amperes (amps).' }, xp_reward: 30 },
        { id: 'fb_s9', title: 'Evolution', content: { question: 'Who proposed the theory of evolution by natural selection?', options: ['Lamarck', 'Darwin', 'Wallace', 'Mendel'], correct_answer: 'Darwin', explanation: 'Charles Darwin proposed evolution by natural selection in "On the Origin of Species".' }, xp_reward: 35 },
        { id: 'fb_s10', title: 'Atoms', content: { question: 'What subatomic particle has a positive charge?', options: ['Electron', 'Neutron', 'Proton', 'Photon'], correct_answer: 'Proton', explanation: 'Protons have a positive charge and are found in the nucleus.' }, xp_reward: 30 },
      ]
  return bank
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
  playerPreset = 'warrior',
}: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Phase + fetch
  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionSource, setQuestionSource] = useState<QuestionSource | null>(null)
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

  // Battle arena ref for triggering attack animations
  const arenaRef = useRef<BattleArenaHandle>(null)

  // Enemy config for this game
  const enemy = ENEMY_PRESETS['science-labyrinth']
  const enemyPreset = SLUG_PRESET['science-labyrinth'] ?? 'warrior'

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  function addTimer(id: ReturnType<typeof setTimeout>) {
    timersRef.current.push(id)
  }

  // ── Fetch questions ────────────────────────────────────────────────────────
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
    setScreenFlash(null)
    setChosenWrong(null)
    setSaveError(false)
    setQuestionSource(null)
    // Reset maze animation state
    setCorridorAdvancing(false)
    setWallVisible(false)
    setWallMounted(false)

    console.log('[ScienceLabyrinth] ageTier:', ageTier, 'householdId:', householdId?.slice(0, 8))

    // Kick off AI and DB at the same time — the winner may supply questions
    const aiPromise = fetch('/api/edu/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'science', age_tier: ageTier, count: 10 }),
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
        const res = await fetch(`/api/edu/challenges?subject=science&age_tier=${ageTier}&count=10`, {
          signal: AbortSignal.timeout(25000),
        })
        if (!res.ok) {
          console.error('[ScienceLabyrinth] API route error:', res.status)
          return null
        }
        const json = (await res.json()) as { questions?: Question[] }
        if (!json.questions || json.questions.length === 0) {
          console.warn('[ScienceLabyrinth] API route returned 0 questions, ageTier:', ageTier)
          return null
        }
        return json.questions
      } catch (err) {
        console.error('[ScienceLabyrinth] API route threw:', err)
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
        setQuestions(shuffle(aiQuestions).slice(0, 10))
        setQuestionSource('ai')
        setPhase('playing')
        return
      }

      const dbQuestions = await Promise.race<Question[] | null>([dbPromise, overallTimeout])
      if (dbQuestions) {
        setQuestions(shuffle(dbQuestions).slice(0, 10))
        setQuestionSource('db')
        setPhase('playing')
        return
      }

      console.warn('[ScienceLabyrinth] AI + DB both failed, using fallback questions')
      setQuestions(shuffle(fallbackQuestions(ageTier)).slice(0, 10))
      setQuestionSource('fallback')
      setPhase('playing')
    } catch {
      console.error('[ScienceLabyrinth] overall timeout fetching questions')
      setFetchErrorKind('network')
    }
  }, [ageTier, householdId])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  useEffect(() => {
    const timers = timersRef.current
    return () => { timers.forEach(clearTimeout) }
  }, [])

  // ── Save handler ───────────────────────────────────────────────────────────
  // Per-question insert; DB trigger handles XP + boss damage atomically.

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
        console.error('[ScienceLabyrinth] edu_completions insert failed:', error)
        setSaveError(true)
      }
    } catch (err) {
      console.error('[ScienceLabyrinth] edu_completions insert threw:', err)
      setSaveError(true)
    }
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
                {questionSource === 'fallback'
                  ? 'Practice round — XP not awarded (offline questions)'
                  : `+${xpEarned} XP · Maze Explored`}
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

    void recordAnswer(current, isCorrect)

    if (isCorrect) {
      const newScore = score + 1
      setScore(newScore)
      setAnswers(newAnswers)
      setFeedback('correct')
      setCorridorAdvancing(true)
      setScreenFlash('green')
      arenaRef.current?.triggerPlayerAttack()

      addTimer(setTimeout(() => setScreenFlash(null), 300))
      addTimer(setTimeout(() => setCorridorAdvancing(false), 600))
      addTimer(setTimeout(() => {
        if (questionIndex === 9) {
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
      setWallMounted(true)
      setWallVisible(true)
      arenaRef.current?.triggerEnemyAttack()

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

  // ── Playing phase render ────────────────────────────────────────────────────

  const current = questions[questionIndex]
  const correctCount = score

  return (
    <>
      <style>{`
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

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
          playerSize={64}
          enemySize={64}
        />

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
    </>
  )
}
