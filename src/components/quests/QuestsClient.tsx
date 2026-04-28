'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarPreview from '@/components/avatar/AvatarPreview'

// ── Types ─────────────────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'medium' | 'hard' | 'epic'
type Recurrence  = 'once' | 'daily' | 'weekly' | 'monthly'
type QuestState  = 'available' | 'pending' | 'verified'

interface Chore {
  id: string
  title: string
  description: string
  xp_reward: number
  gold_reward: number
  recurrence: Recurrence
  difficulty: Difficulty
  quest_flavor_text: string
  assigned_to: string | null
}

interface Completion {
  id: string
  chore_id: string
  verified: boolean
  xp_awarded: number
  gold_awarded: number
  completed_at: string
}

interface QuestCard extends Chore {
  state: QuestState
  completion: Completion | null
}

interface Props {
  userId: string
  householdId: string
  initialAvatarConfig: Record<string, unknown> | null
}

// ── Display metadata ──────────────────────────────────────────────────────────

const DIFF_META: Record<Difficulty, { label: string; color: string; bg: string; border: string }> = {
  easy:   { label: 'Easy',   color: '#2eb85c', bg: 'rgba(46,184,92,0.12)',   border: 'rgba(46,184,92,0.4)'   },
  medium: { label: 'Medium', color: '#4d8aff', bg: 'rgba(77,138,255,0.12)',  border: 'rgba(77,138,255,0.4)'  },
  hard:   { label: 'Hard',   color: '#b060e0', bg: 'rgba(176,96,224,0.12)',  border: 'rgba(176,96,224,0.4)'  },
  epic:   { label: 'Epic',   color: '#e86a20', bg: 'rgba(232,106,32,0.12)',  border: 'rgba(232,106,32,0.4)'  },
}

const REC_META: Record<Recurrence, { label: string; icon: string }> = {
  once:    { label: 'One-time', icon: '◆' },
  daily:   { label: 'Daily',    icon: '↻' },
  weekly:  { label: 'Weekly',   icon: '⟳' },
  monthly: { label: 'Monthly',  icon: '☽' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPeriodStart(rec: Recurrence): Date {
  const now  = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (rec) {
    case 'once':    return new Date(0)
    case 'daily':   return today
    case 'weekly': {
      const mon = new Date(today)
      mon.setDate(today.getDate() - ((now.getDay() + 6) % 7))
      return mon
    }
    case 'monthly': return new Date(now.getFullYear(), now.getMonth(), 1)
  }
}

const STATE_ORDER: Record<QuestState, number> = { pending: 0, available: 1, verified: 2 }

function buildCards(chores: Chore[], completions: Completion[]): QuestCard[] {
  return chores
    .map(chore => {
      const cutoff = getPeriodStart(chore.recurrence)
      const rel    = completions.find(
        c => c.chore_id === chore.id && new Date(c.completed_at) >= cutoff,
      ) ?? null
      const state: QuestState = rel ? (rel.verified ? 'verified' : 'pending') : 'available'
      return { ...chore, state, completion: rel }
    })
    .sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state])
}

function fmtCountdown(msLeft: number): string {
  const h = Math.floor(msLeft / 3_600_000)
  const m = Math.floor((msLeft % 3_600_000) / 60_000)
  const s = Math.floor((msLeft % 60_000) / 1_000)
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function GemIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" style={{ imageRendering: 'pixelated' }} aria-hidden="true">
      <polygon points="12,2 21,8 21,14 12,22 3,14 3,8" fill={color} opacity="0.9" />
      <polygon points="12,2 21,8 12,9.5 3,8"           fill="white"  opacity="0.28" />
      <line x1="3" y1="8" x2="21" y2="8"              stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
    </svg>
  )
}

function XpIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0" style={{ imageRendering: 'pixelated' }} aria-hidden="true">
      <polygon points="8,1 14,6 14,10 8,15 2,10 2,6" fill="#6eb5ff" stroke="#3a7acc" strokeWidth="0.5" />
      <polygon points="8,1 14,6 8,7 2,6"             fill="#9fd0ff" opacity="0.8" />
    </svg>
  )
}

function GoldIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0" style={{ imageRendering: 'pixelated' }} aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="#c9a84c" stroke="#9c7b2e" strokeWidth="0.5" />
      <circle cx="8" cy="8" r="4.5" fill="#e8c55a" opacity="0.7" />
      <text x="8" y="11" textAnchor="middle" fontSize="6" fill="#9c7b2e" fontWeight="bold">G</text>
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuestsClient({ userId, householdId, initialAvatarConfig }: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [chores,      setChores]      = useState<Chore[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading,     setLoading]     = useState(true)
  const [completing,  setCompleting]  = useState<Set<string>>(new Set())
  const [msToMid,     setMsToMid]     = useState(0)

  // Countdown timer (ticks every second)
  useEffect(() => {
    function tick() {
      const now      = new Date()
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      setMsToMid(midnight.getTime() - now.getTime())
    }
    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [])

  // Fetch chores and completions — userId and householdId come from server props
  const loadData = useCallback(async () => {
    setLoading(true)
    const [{ data: choreData }, { data: completionData }] = await Promise.all([
      supabase
        .from('chores')
        .select('id, title, description, xp_reward, gold_reward, recurrence, difficulty, quest_flavor_text, assigned_to')
        .eq('household_id', householdId)
        .eq('is_active', true)
        .or(`assigned_to.eq.${userId},assigned_to.is.null`)
        .order('created_at', { ascending: false }),
      supabase
        .from('chore_completions')
        .select('id, chore_id, verified, xp_awarded, gold_awarded, completed_at')
        .eq('household_id', householdId)
        .eq('player_id', userId),
    ])
    setChores((choreData ?? []) as Chore[])
    setCompletions((completionData ?? []) as Completion[])
    setLoading(false)
  }, [supabase, userId, householdId])

  useEffect(() => { loadData() }, [loadData])

  // Mark a quest complete
  async function handleComplete(chore: Chore) {
    setCompleting(prev => { const n = new Set(prev); n.add(chore.id); return n })
    const { data, error } = await supabase
      .from('chore_completions')
      .insert({
        chore_id:     chore.id,
        player_id:    userId,
        household_id: householdId,
        xp_awarded:   chore.xp_reward,
        gold_awarded: chore.gold_reward,
      })
      .select('id, chore_id, verified, xp_awarded, gold_awarded, completed_at')
      .single()
    if (!error && data) {
      setCompletions(prev => [...prev, data as Completion])
    }
    setCompleting(prev => { const n = new Set(prev); n.delete(chore.id); return n })
  }

  // Derived state
  const cards = buildCards(chores, completions)
  const availableCount = cards.filter(c => c.state === 'available').length
  const hasDailyActive = cards.some(c => c.recurrence === 'daily' && c.state !== 'available')

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes quest-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .quest-card { animation: quest-in 0.25s ease both; }
        .complete-btn {
          width: 100%; padding: 0.9rem 1rem; border-radius: 2px;
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.48rem; letter-spacing: 0.14em; text-transform: uppercase;
          image-rendering: pixelated; cursor: pointer; transition: all 0.15s;
        }
        .complete-btn:hover:not(:disabled) { filter: brightness(1.15); box-shadow: var(--btn-glow, none); }
        .complete-btn:active:not(:disabled) { transform: scale(0.98); }
        .complete-btn:disabled { cursor: not-allowed; opacity: 0.65; }
      `}</style>

      <div className="px-4 py-5">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flexShrink: 0, lineHeight: 0 }}>
              <AvatarPreview avatarConfig={initialAvatarConfig} size={64} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.52rem', letterSpacing: '0.14em', color: 'rgba(201,168,76,0.85)', imageRendering: 'pixelated', textShadow: '0 0 18px rgba(201,168,76,0.35)' }}>
                ⚔ Quest Board
              </h1>
              <p style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 300, fontSize: '0.7rem', color: 'rgba(200,215,255,0.25)', marginTop: '0.2rem' }}>
                {loading ? '…' : `${availableCount} quest${availableCount !== 1 ? 's' : ''} available`}
              </p>
            </div>
          </div>

          {hasDailyActive && msToMid > 0 && (
            <div className="text-right">
              <p style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.36rem', color: 'rgba(200,215,255,0.28)', imageRendering: 'pixelated', marginBottom: '0.15rem' }}>
                DAILY RESET IN
              </p>
              <p style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.48rem', color: 'rgba(201,168,76,0.7)', imageRendering: 'pixelated', fontVariantNumeric: 'tabular-nums' }}>
                {fmtCountdown(msToMid)}
              </p>
            </div>
          )}
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div className="text-center py-16" style={{ fontFamily: 'var(--font-heading), serif', fontSize: '0.82rem', color: 'rgba(200,215,255,0.2)' }}>
            Consulting the quest archives…
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && cards.length === 0 && (
          <div className="text-center py-16 rounded-sm" style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(201,168,76,0.1)' }}>
            <div className="text-4xl mb-3 opacity-25">📜</div>
            <p style={{ fontFamily: 'var(--font-heading), serif', fontSize: '0.82rem', color: 'rgba(200,215,255,0.3)' }}>No quests await you.</p>
            <p style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(200,215,255,0.18)', marginTop: '0.35rem' }}>
              Ask your Game Master to issue new decrees.
            </p>
          </div>
        )}

        {/* ── Quest cards ── */}
        {!loading && cards.length > 0 && (
          <div className="flex flex-col gap-4">
            {cards.map((card, idx) => {
              const diff         = DIFF_META[card.difficulty]
              const rec          = REC_META[card.recurrence]
              const isCompleting = completing.has(card.id)
              const showTimer    = card.recurrence === 'daily' && card.state !== 'available' && msToMid > 0

              const stateGlow =
                card.state === 'pending'  ? { border: 'rgba(251,191,36,0.4)',  shadow: '0 0 24px rgba(251,191,36,0.10)', tint: 'rgba(251,191,36,0.025)' } :
                card.state === 'verified' ? { border: 'rgba(46,184,92,0.35)',  shadow: '0 0 24px rgba(46,184,92,0.09)',  tint: 'rgba(46,184,92,0.025)'  } :
                                            { border: 'rgba(201,168,76,0.15)', shadow: '0 2px 8px rgba(0,0,0,0.45)',     tint: 'transparent' }

              return (
                <article
                  key={card.id}
                  className="quest-card"
                  style={{
                    position: 'relative', animationDelay: `${idx * 0.04}s`,
                    background: 'linear-gradient(170deg, #1a1208 0%, #0c0803 55%, #181006 100%)',
                    border: `1px solid ${stateGlow.border}`, borderRadius: 3,
                    overflow: 'hidden', boxShadow: stateGlow.shadow, transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  {/* Difficulty colour bar */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: diff.color, opacity: 0.75 }} />

                  {/* Parchment tint */}
                  <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 180% 60% at 50% 0%, ${stateGlow.tint}, transparent 65%)`, pointerEvents: 'none' }} />

                  <div style={{ padding: '1rem 1rem 1rem 1.25rem', position: 'relative' }}>

                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.7rem' }}>
                      <GemIcon color={diff.color} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                          <span style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 700, fontSize: '0.95rem', color: '#f0e6c8', lineHeight: 1.25 }}>
                            {card.title}
                          </span>
                          {card.state === 'pending' && (
                            <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.36rem', imageRendering: 'pixelated', padding: '2px 6px', borderRadius: 2, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.45)', color: 'rgba(251,191,36,0.9)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                              Awaiting Verification
                            </span>
                          )}
                          {card.state === 'verified' && (
                            <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.36rem', imageRendering: 'pixelated', padding: '2px 6px', borderRadius: 2, background: 'rgba(46,184,92,0.12)', border: '1px solid rgba(46,184,92,0.4)', color: 'rgba(46,184,92,0.9)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                              Verified ✓
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.36rem', imageRendering: 'pixelated', padding: '1px 5px', borderRadius: 2, background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}>
                            {diff.label.toUpperCase()}
                          </span>
                          <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.36rem', imageRendering: 'pixelated', padding: '1px 5px', borderRadius: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(200,215,255,0.35)' }}>
                            {rec.icon} {rec.label.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Flavor text */}
                    <div style={{ marginLeft: '1.6rem', marginBottom: '0.8rem', paddingLeft: '0.75rem', borderLeft: '1px solid rgba(201,168,76,0.1)' }}>
                      <p style={{ fontFamily: 'var(--font-body), serif', fontSize: '0.83rem', color: 'rgba(240,230,200,0.72)', fontStyle: 'italic', lineHeight: 1.65 }}>
                        {card.quest_flavor_text || card.title}
                      </p>
                      {card.description && (
                        <p style={{ fontFamily: 'var(--font-body), serif', fontSize: '0.73rem', color: 'rgba(200,215,255,0.28)', marginTop: '0.4rem', lineHeight: 1.55 }}>
                          {card.description}
                        </p>
                      )}
                    </div>

                    {/* Rewards row */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1.6rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <XpIcon />
                        <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.42rem', imageRendering: 'pixelated', color: card.state === 'verified' ? 'rgba(80,210,130,0.9)' : 'rgba(201,168,76,0.85)' }}>
                          {card.state === 'verified' && card.completion ? `+${card.completion.xp_awarded}` : card.xp_reward} XP
                        </span>
                      </div>
                      {card.gold_reward > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <GoldIcon />
                          <span style={{ fontFamily: 'var(--font-pixel), monospace', fontSize: '0.42rem', imageRendering: 'pixelated', color: card.state === 'verified' ? 'rgba(201,168,76,0.9)' : 'rgba(201,168,76,0.7)' }}>
                            {card.state === 'verified' && card.completion ? `+${card.completion.gold_awarded}` : card.gold_reward} GP
                          </span>
                        </div>
                      )}
                      {showTimer && (
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-pixel), monospace', fontSize: '0.36rem', imageRendering: 'pixelated', color: 'rgba(200,215,255,0.28)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          resets in {fmtCountdown(msToMid)}
                        </span>
                      )}
                    </div>

                    {/* Action area */}
                    {card.state === 'available' && (
                      <button
                        className="complete-btn"
                        onClick={() => handleComplete(card)}
                        disabled={isCompleting}
                        aria-busy={isCompleting}
                        style={{ border: `1px solid ${diff.border}`, background: 'linear-gradient(160deg, rgba(22,15,5,0.98), rgba(14,9,2,0.98))', color: diff.color, boxShadow: `0 0 10px ${diff.color}20`, '--btn-glow': `0 0 18px ${diff.color}35` } as React.CSSProperties}
                      >
                        {isCompleting ? '⚔ Marking Complete…' : '⚔ Complete Quest'}
                      </button>
                    )}
                    {card.state === 'pending' && (
                      <div style={{ padding: '0.85rem 1rem', borderRadius: 2, border: '1px solid rgba(251,191,36,0.22)', background: 'rgba(251,191,36,0.04)', textAlign: 'center', fontFamily: 'var(--font-pixel), monospace', fontSize: '0.42rem', letterSpacing: '0.1em', color: 'rgba(251,191,36,0.55)', imageRendering: 'pixelated' }}>
                        ⏳ Awaiting Game Master Verification
                      </div>
                    )}
                    {card.state === 'verified' && (
                      <div style={{ padding: '0.85rem 1rem', borderRadius: 2, border: '1px solid rgba(46,184,92,0.22)', background: 'rgba(46,184,92,0.04)', textAlign: 'center', fontFamily: 'var(--font-pixel), monospace', fontSize: '0.42rem', letterSpacing: '0.1em', color: 'rgba(46,184,92,0.7)', imageRendering: 'pixelated' }}>
                        ✓ Quest Complete — +{card.completion?.xp_awarded ?? card.xp_reward} XP Earned
                      </div>
                    )}

                  </div>
                </article>
              )
            })}
          </div>
        )}

      </div>
    </>
  )
}
