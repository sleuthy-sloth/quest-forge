'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useQuestStore } from '@/store/useQuestStore'
import { playSfx } from '@/lib/audio'

type Difficulty = 'easy' | 'medium' | 'hard'

interface Player {
  id: string
  display_name: string
}

const DIFF_META: Record<Difficulty, { label: string; xp: number; gold: number; color: string }> = {
  easy:   { label: 'Easy',   xp: 10,  gold: 5,  color: '#2eb85c' },
  medium: { label: 'Medium', xp: 30,  gold: 15, color: '#4d8aff' },
  hard:   { label: 'Hard',   xp: 60,  gold: 30, color: '#b060e0' },
}

const BOSS_SPRITES = [
  { key: 'demon',  emoji: '👹', label: 'Demon' },
  { key: 'dragon', emoji: '🐉', label: 'Dragon' },
  { key: 'slime',  emoji: '🟢', label: 'Slime' },
]

interface QuestForm {
  title: string
  description: string
  xp_reward: string
  gold_reward: string
  assigned_to: string
  difficulty: Difficulty
  is_boss: boolean
  boss_health: string
  boss_sprite: string
}

const FORM_EMPTY: QuestForm = {
  title: '',
  description: '',
  xp_reward: '10',
  gold_reward: '5',
  assigned_to: '',
  difficulty: 'easy',
  is_boss: false,
  boss_health: '200',
  boss_sprite: 'slime',
}

export default function NewQuestPage() {
  const router = useRouter()
  const supabase = createClient()

  const [players, setPlayers] = useState<Player[]>([])
  const [householdId, setHouseholdId] = useState('')
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState<QuestForm>(FORM_EMPTY)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof QuestForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('[quests/new] no authenticated user')
        return
      }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('household_id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        console.error('[quests/new] no profile found for user')
        return
      }
      setHouseholdId(profile.household_id)

      const { data: pData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('role', 'player')
        .order('created_at', { ascending: true })

      setPlayers(pData ?? [])
    }
    init()
  }, [supabase])

  function setField<K extends keyof QuestForm>(k: K, v: QuestForm[K]) {
    setForm(p => ({ ...p, [k]: v }))
    setFormErrors(p => ({ ...p, [k]: undefined }))
    setSubmitError(null)
  }

  function setDifficulty(d: Difficulty) {
    const meta = DIFF_META[d]
    setForm(p => ({
      ...p,
      difficulty: d,
      xp_reward: String(meta.xp),
      gold_reward: String(meta.gold),
    }))
    setFormErrors(p => ({ ...p, difficulty: undefined, xp_reward: undefined, gold_reward: undefined }))
    setSubmitError(null)
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof QuestForm, string>> = {}
    if (!form.title.trim()) errs.title = 'Title required'
    const xp = parseInt(form.xp_reward, 10)
    if (isNaN(xp) || xp < 1 || xp > 500) errs.xp_reward = '1–500'
    const gold = parseInt(form.gold_reward, 10)
    if (isNaN(gold) || gold < 0 || gold > 9999) errs.gold_reward = '0–9999'
    if (form.is_boss) {
      const bh = parseInt(form.boss_health, 10)
      if (isNaN(bh) || bh < 100 || bh > 500) errs.boss_health = '100–500'
      if (!form.boss_sprite) errs.boss_sprite = 'Select a boss sprite'
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)

    const bossHp = form.is_boss ? parseInt(form.boss_health, 10) : null

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      xp_reward: parseInt(form.xp_reward, 10),
      gold_reward: parseInt(form.gold_reward, 10) || 0,
      assigned_to: form.assigned_to || null,
      difficulty: form.difficulty,
      is_boss: form.is_boss,
      boss_health: bossHp,
      boss_current_health: bossHp,
      boss_sprite: form.is_boss ? form.boss_sprite : null,
      household_id: householdId,
      created_by: userId,
      is_active: true,
    }

    const { error } = await supabase.from('quests').insert(payload as never)

    if (error) {
      setSubmitError(error.message)
      setSubmitting(false)
      return
    }

    playSfx('coin')
    router.push('/dashboard/quests')
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .qf-label {
          display: block;
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.6);
          margin-bottom: 0.35rem;
        }
        .qf-input {
          width: 100%;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 2px;
          color: #e8f0ff;
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.9rem;
          padding: 0.6rem 0.8rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .qf-input:focus {
          border-color: rgba(201,168,76,0.5);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
        }
        .qf-input.err { border-color: rgba(220,80,80,0.55) !important; }
        .qf-input::placeholder { color: rgba(200,215,255,0.2); font-style: italic; }
        .qf-input:disabled { opacity: 0.5; cursor: not-allowed; }
        textarea.qf-input { resize: vertical; min-height: 80px; line-height: 1.5; }
        .qf-toggle {
          position: relative;
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(201,168,76,0.2);
          cursor: pointer;
          transition: background 0.2s;
        }
        .qf-toggle.active {
          background: rgba(200,60,60,0.35);
          border-color: rgba(200,60,60,0.5);
        }
        .qf-toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(200,215,255,0.4);
          transition: all 0.2s;
        }
        .qf-toggle.active .qf-toggle-knob {
          left: 22px;
          background: rgba(230,80,80,0.9);
        }
        .diff-btn {
          flex: 1;
          padding: 0.45rem 0;
          border-radius: 2px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(200,215,255,0.4);
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s;
        }
        .diff-btn:hover { opacity: 0.85; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 11px; height: 11px;
          border: 2px solid rgba(201,168,76,0.25);
          border-top-color: rgba(201,168,76,0.85);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 5px;
        }
      `}</style>

      <div className="dash-topbar">
        <span className="dash-page-title">⚔ Forge New Quest</span>
        <Link
          href="/dashboard/quests"
          className="text-[0.65rem] font-heading tracking-wider text-[#c9a84c]/60 hover:text-[#c9a84c] uppercase transition-colors"
        >
          ← Back to Quests
        </Link>
      </div>

      <div className="dash-content" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(170deg, rgba(20,14,4,0.97), rgba(14,10,3,0.97))',
          border: '1px solid rgba(201,168,76,0.28)',
          borderRadius: 3,
          padding: '1.75rem',
          boxShadow: '0 0 40px rgba(201,168,76,0.04), inset 0 0 60px rgba(201,168,76,0.02)',
          position: 'relative',
        }}>
          {([
            { top: -1, left: -1, borderWidth: '2px 0 0 2px' },
            { top: -1, right: -1, borderWidth: '2px 2px 0 0' },
            { bottom: -1, left: -1, borderWidth: '0 0 2px 2px' },
            { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' },
          ] as const).map((c, i) => (
            <div key={i} aria-hidden="true" style={{
              position: 'absolute', width: 16, height: 16,
              borderColor: 'rgba(201,168,76,0.4)', borderStyle: 'solid', ...c,
            }} />
          ))}

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem', opacity: 0.6 }}>⚔</div>
            <h2 style={{
              fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
              fontSize: '0.52rem', letterSpacing: '0.12em',
              color: 'rgba(201,168,76,0.75)',
              imageRendering: 'pixelated',
            }}>
              — Quest Decree —
            </h2>
            <div style={{ marginTop: '0.75rem', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Title */}
            <div>
              <label className="qf-label" htmlFor="q-title">Quest Title</label>
              <input
                id="q-title"
                className={`qf-input${formErrors.title ? ' err' : ''}`}
                placeholder="e.g. Slay the Goblin King"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                disabled={submitting}
              />
              {formErrors.title && <p className="text-[0.7rem] font-heading mt-1" style={{ color: 'rgba(220,100,100,0.8)' }}>{formErrors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="qf-label" htmlFor="q-desc">Description</label>
              <textarea
                id="q-desc"
                className="qf-input"
                placeholder="Describe the quest..."
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                disabled={submitting}
                rows={2}
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="qf-label">Difficulty</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
                  const m = DIFF_META[d]
                  const active = form.difficulty === d
                  return (
                    <button
                      key={d}
                      type="button"
                      className="diff-btn"
                      onClick={() => { playSfx('click'); setDifficulty(d) }}
                      style={active ? {
                        background: `${m.color}18`,
                        border: `1px solid ${m.color}55`,
                        color: m.color,
                        boxShadow: `0 0 8px ${m.color}30`,
                      } : {}}
                    >
                      {m.label} ({m.xp}xp / {m.gold}g)
                    </button>
                  )
                })}
              </div>
            </div>

            {/* XP + Gold */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="qf-label" htmlFor="q-xp">XP Reward</label>
                <input
                  id="q-xp"
                  className={`qf-input${formErrors.xp_reward ? ' err' : ''}`}
                  type="number" min={1} max={500}
                  value={form.xp_reward}
                  onChange={e => setField('xp_reward', e.target.value)}
                  disabled={submitting}
                />
                {formErrors.xp_reward && <p className="text-[0.7rem] font-heading mt-1" style={{ color: 'rgba(220,100,100,0.8)' }}>{formErrors.xp_reward}</p>}
              </div>
              <div>
                <label className="qf-label" htmlFor="q-gold">Gold Reward</label>
                <input
                  id="q-gold"
                  className={`qf-input${formErrors.gold_reward ? ' err' : ''}`}
                  type="number" min={0} max={9999}
                  value={form.gold_reward}
                  onChange={e => setField('gold_reward', e.target.value)}
                  disabled={submitting}
                />
                {formErrors.gold_reward && <p className="text-[0.7rem] font-heading mt-1" style={{ color: 'rgba(220,100,100,0.8)' }}>{formErrors.gold_reward}</p>}
              </div>
            </div>

            {/* Assign To */}
            <div>
              <label className="qf-label" htmlFor="q-assign">Assign To</label>
              <select
                id="q-assign"
                className="qf-input"
                value={form.assigned_to}
                onChange={e => setField('assigned_to', e.target.value)}
                disabled={submitting}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Everyone</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.display_name}</option>
                ))}
              </select>
            </div>

            {/* Boss Toggle */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label className="qf-label" style={{ margin: 0, cursor: 'pointer' }} htmlFor="q-boss">
                  Boss Encounter
                </label>
                <button
                  id="q-boss"
                  type="button"
                  className={`qf-toggle${form.is_boss ? ' active' : ''}`}
                  onClick={() => { playSfx('click'); setField('is_boss', !form.is_boss) }}
                  role="switch"
                  aria-checked={form.is_boss}
                >
                  <div className="qf-toggle-knob" />
                </button>
              </div>

              {/* Boss options (revealed) */}
              {form.is_boss && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    border: '1px solid rgba(200,60,60,0.2)',
                    borderRadius: 2,
                    background: 'rgba(200,60,60,0.04)',
                  }}
                >
                  {/* Boss Health slider */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="qf-label" htmlFor="q-boss-hp">
                      Boss Health: {form.boss_health || 200} HP
                    </label>
                    <input
                      id="q-boss-hp"
                      type="range"
                      min={100}
                      max={500}
                      step={50}
                      value={form.boss_health}
                      onChange={e => setField('boss_health', e.target.value)}
                      disabled={submitting}
                      style={{ width: '100%', accentColor: '#e84040' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-pixel, monospace)', fontSize: '0.42rem', color: 'rgba(200,215,255,0.3)' }}>
                      <span>100</span>
                      <span>500</span>
                    </div>
                    {formErrors.boss_health && <p className="text-[0.7rem] font-heading mt-1" style={{ color: 'rgba(220,100,100,0.8)' }}>{formErrors.boss_health}</p>}
                  </div>

                  {/* Sprite Selector */}
                  <div>
                    <label className="qf-label">Boss Sprite</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {BOSS_SPRITES.map(s => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => { playSfx('click'); setField('boss_sprite', s.key) }}
                          className="text-3xl p-2 border rounded-sm transition-all"
                          style={{
                            border: `1px solid ${form.boss_sprite === s.key ? 'rgba(200,60,60,0.5)' : 'rgba(255,255,255,0.08)'}`,
                            background: form.boss_sprite === s.key ? 'rgba(200,60,60,0.1)' : 'transparent',
                            imageRendering: 'pixelated',
                          }}
                          aria-label={s.label}
                        >
                          {s.emoji}
                        </button>
                      ))}
                    </div>
                    {formErrors.boss_sprite && <p className="text-[0.7rem] font-heading mt-1" style={{ color: 'rgba(220,100,100,0.8)' }}>{formErrors.boss_sprite}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)' }} />

            {/* Error */}
            {submitError && (
              <div role="alert" style={{
                background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.25)',
                borderRadius: 2, padding: '0.6rem 0.8rem',
                fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.78rem', color: 'rgba(220,100,100,0.85)',
                display: 'flex', gap: '0.4rem',
              }}>
                <span>⚠</span> {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '0.85rem', borderRadius: 2,
                border: '1px solid rgba(201,168,76,0.4)',
                background: 'linear-gradient(135deg, rgba(20,36,80,0.95), rgba(40,16,85,0.95))',
                color: 'rgba(201,168,76,0.95)',
                fontFamily: 'var(--font-heading, Cinzel, serif)',
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {submitting
                ? <><span className="spinner" />Forging…</>
                : '⚔ Issue Quest Decree'
              }
            </button>

          </form>
        </div>
      </div>
    </>
  )
}
