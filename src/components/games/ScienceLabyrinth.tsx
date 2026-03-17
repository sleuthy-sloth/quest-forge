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
                +{xpEarned} XP · Maze Explored{hasBoss ? ` · −${xpEarned} Boss HP` : ''}
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

  // ── Playing phase (rendered below in Task 3) ───────────────────────────────
  return <div />
}
