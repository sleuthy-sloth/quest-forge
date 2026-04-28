'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Tables } from '@/types/database'
import { PixelBadge, PixelButton } from '@/components/ui'
import { PageHeader } from '@/components/qf'
import { CHORE_SUGGESTIONS } from '@/lib/constants/suggestions'

// ── Types ─────────────────────────────────────────────────────────────────────
type Chore = Pick<
  Tables<'chores'>,
  'id' | 'title' | 'description' | 'xp_reward' | 'gold_reward' |
  'assigned_to' | 'recurrence' | 'difficulty' | 'quest_flavor_text' |
  'is_active' | 'created_at'
>
type Player = Pick<Tables<'profiles'>, 'id' | 'display_name' | 'username'>
type Difficulty = 'easy' | 'medium' | 'hard' | 'epic'
type Recurrence  = 'once' | 'daily' | 'weekly' | 'monthly'

interface ChoreForm {
  title: string
  description: string
  xp_reward: string
  gold_reward: string
  assigned_to: string
  recurrence: Recurrence
  difficulty: Difficulty
  quest_flavor_text: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const XP_PRESETS: Record<Difficulty, number> = { easy: 15, medium: 35, hard: 75, epic: 150 }

const DIFF_META: Record<Difficulty, { label: string; icon: string; color: string; bg: string; border: string; glow: string }> = {
  easy:   { label: 'Easy',   icon: '✦', color: '#2eb85c', bg: 'rgba(46,184,92,0.1)',  border: 'rgba(46,184,92,0.35)',  glow: 'rgba(46,184,92,0.2)'  },
  medium: { label: 'Medium', icon: '✦', color: '#4d8aff', bg: 'rgba(77,138,255,0.1)', border: 'rgba(77,138,255,0.35)', glow: 'rgba(77,138,255,0.2)' },
  hard:   { label: 'Hard',   icon: '✦', color: '#b060e0', bg: 'rgba(176,96,224,0.1)', border: 'rgba(176,96,224,0.35)', glow: 'rgba(176,96,224,0.2)' },
  epic:   { label: 'Epic',   icon: '✦', color: '#e86a20', bg: 'rgba(232,106,32,0.1)', border: 'rgba(232,106,32,0.35)', glow: 'rgba(232,106,32,0.2)' },
}

const REC_META: Record<Recurrence, { label: string; icon: string }> = {
  once:    { label: 'One-time', icon: '◆' },
  daily:   { label: 'Daily',   icon: '↻' },
  weekly:  { label: 'Weekly',  icon: '⟳' },
  monthly: { label: 'Monthly', icon: '☽' },
}

const FORM_EMPTY: ChoreForm = {
  title: '', description: '', xp_reward: '15', gold_reward: '0',
  assigned_to: '', recurrence: 'once', difficulty: 'easy', quest_flavor_text: '',
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChoresPage() {
  const formRef = useRef<HTMLElement>(null)

  const [players,     setPlayers]     = useState<Player[]>([])
  const [chores,      setChores]      = useState<Chore[]>([])
  const [loading,     setLoading]     = useState(true)

  const [form,        setFormState]   = useState<ChoreForm>(FORM_EMPTY)
  const [formErrors,  setFormErrors]  = useState<Partial<Record<keyof ChoreForm, string>>>({})
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [generating,  setGenerating]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitOk,    setSubmitOk]    = useState<string | null>(null)

  const [filterDiff, setFilterDiff] = useState<'' | Difficulty>('')
  const [filterRec,  setFilterRec]  = useState<'' | Recurrence>('')
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  // ── Data fetch via API ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/chores')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { chores: Chore[]; players: Player[] }
      setChores(json.chores)
      setPlayers(json.players)
    } catch (err) {
      console.error('[chores] loadData failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Safety timeout: force loading off after 15s so the user never sees a
  // perpetual spinner if the data fetch fails silently.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 15_000)
    return () => clearTimeout(timer)
  }, [])

  // ── Form helpers ────────────────────────────────────────────────────────────
  function setField<K extends keyof ChoreForm>(k: K, v: ChoreForm[K]) {
    setFormState(p => ({ ...p, [k]: v }))
    setFormErrors(p => ({ ...p, [k]: undefined }))
    setSubmitError(null)
    setSubmitOk(null)
  }

  function setDifficulty(d: Difficulty) {
    setFormState(p => ({ ...p, difficulty: d, xp_reward: String(XP_PRESETS[d]) }))
    setFormErrors(p => ({ ...p, difficulty: undefined, xp_reward: undefined }))
    setSubmitError(null)
    setSubmitOk(null)
  }

  function applySuggestion(s: typeof CHORE_SUGGESTIONS[number]) {
    setFormState(p => ({
      ...p,
      title: s.title,
      description: s.description,
      difficulty: s.difficulty,
      xp_reward: String(XP_PRESETS[s.difficulty]),
      quest_flavor_text: '', // clear old flavor
    }))
    setFormErrors({})
    setSubmitError(null)
    setSubmitOk(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof ChoreForm, string>> = {}
    if (!form.title.trim()) errs.title = 'Title required'
    const xp = parseInt(form.xp_reward, 10)
    if (isNaN(xp) || xp < 1 || xp > 500) errs.xp_reward = '1–500'
    const gold = parseInt(form.gold_reward, 10)
    if (isNaN(gold) || gold < 0 || gold > 9999) errs.gold_reward = '0–9999'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Auto-generate ───────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!form.title.trim()) {
      setFormErrors(p => ({ ...p, title: 'Enter a title first' }))
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/chores/flavor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choreTitle: form.title, choreDescription: form.description }),
      })
      const data = await res.json() as { flavorText?: string }
      if (res.ok && data.flavorText) {
        setFormState(p => ({ ...p, quest_flavor_text: data.flavorText! }))
      }
    } catch { /* silently fail — user can type manually */ }
    setGenerating(false)
  }

  // ── Submit (create or update) via API ───────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true); setSubmitError(null); setSubmitOk(null)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      xp_reward: parseInt(form.xp_reward, 10),
      gold_reward: parseInt(form.gold_reward, 10) || 0,
      assigned_to: form.assigned_to || null,
      recurrence: form.recurrence,
      difficulty: form.difficulty,
      quest_flavor_text: form.quest_flavor_text.trim(),
    }

    try {
      if (editingId) {
        // ── Update ──
        const res = await fetch('/api/chores', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
        const json = await res.json() as { chore?: Chore; error?: string }
        if (!res.ok || !json.chore) {
          throw new Error(json.error ?? 'Failed to update quest.')
        }
        setChores(prev => prev.map(c => c.id === editingId ? { ...c, ...json.chore! } : c))
        setEditingId(null); setFormState(FORM_EMPTY)
        setSubmitOk('Quest updated!')
      } else {
        // ── Create ──
        const res = await fetch('/api/chores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json() as { chore?: Chore; error?: string }
        if (!res.ok || !json.chore) {
          throw new Error(json.error ?? 'Failed to create quest.')
        }
        setChores(prev => [json.chore!, ...prev])
        setFormState(FORM_EMPTY)
        setSubmitOk(`"${json.chore.title}" added to the quest board!`)
      }
    } catch (err) {
      console.error('[chores] submit failed:', err)
      setSubmitError(err instanceof Error ? err.message : 'Failed to save quest.')
    }
    setSubmitting(false)
  }

  // ── Edit ────────────────────────────────────────────────────────────────────
  function startEdit(chore: Chore) {
    setEditingId(chore.id)
    setFormState({
      title: chore.title,
      description: chore.description ?? '',
      xp_reward: String(chore.xp_reward),
      gold_reward: String(chore.gold_reward ?? 0),
      assigned_to: chore.assigned_to ?? '',
      recurrence: chore.recurrence as Recurrence,
      difficulty: chore.difficulty as Difficulty,
      quest_flavor_text: chore.quest_flavor_text ?? '',
    })
    setFormErrors({}); setSubmitError(null); setSubmitOk(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function cancelEdit() {
    setEditingId(null); setFormState(FORM_EMPTY); setFormErrors({})
    setSubmitError(null); setSubmitOk(null)
  }

  // ── Deactivate via API ──────────────────────────────────────────────────────
  async function handleDeactivate(id: string) {
    setDeactivatingId(id)
    try {
      const res = await fetch('/api/chores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setChores(prev => prev.filter(c => c.id !== id))
        if (editingId === id) cancelEdit()
      }
    } catch (err) {
      console.error('[chores] deactivate failed:', err)
    }
    setDeactivatingId(null)
  }

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = chores.filter(c => {
    if (filterDiff && c.difficulty !== filterDiff) return false
    if (filterRec  && c.recurrence  !== filterRec)  return false
    return true
  })

  function playerName(id: string | null): string {
    if (!id) return 'Everyone'
    return players.find(p => p.id === id)?.display_name ?? 'Unknown'
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── shared ── */
        .ch-label {
          display: block;
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.6);
          margin-bottom: 0.35rem;
        }
        .ch-input {
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
        .ch-input:focus {
          border-color: rgba(201,168,76,0.5);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
        }
        .ch-input.err { border-color: rgba(220,80,80,0.55) !important; }
        .ch-input::placeholder { color: rgba(200,215,255,0.2); font-style: italic; }
        .ch-input:disabled { opacity: 0.5; cursor: not-allowed; }
        textarea.ch-input { resize: vertical; min-height: 80px; line-height: 1.5; }

        /* ── difficulty buttons ── */
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

        /* ── recurrence buttons ── */
        .rec-btn {
          flex: 1;
          padding: 0.45rem 0;
          border-radius: 2px;
          border: 1px solid rgba(201,168,76,0.15);
          background: transparent;
          color: rgba(200,215,255,0.35);
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s;
        }
        .rec-btn.active {
          background: rgba(201,168,76,0.1);
          border-color: rgba(201,168,76,0.4);
          color: rgba(201,168,76,0.9);
        }
        .rec-btn:hover:not(.active) {
          border-color: rgba(201,168,76,0.3);
          color: rgba(201,168,76,0.6);
        }

        /* ── filter pills ── */
        .filter-pill {
          padding: 0.3rem 0.7rem;
          border-radius: 2px;
          border: 1px solid rgba(201,168,76,0.15);
          background: transparent;
          color: rgba(200,215,255,0.3);
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.42rem;
          image-rendering: pixelated;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-pill.active {
          border-color: rgba(201,168,76,0.5);
          background: rgba(201,168,76,0.08);
          color: rgba(201,168,76,0.9);
        }
        .filter-pill:hover:not(.active) {
          border-color: rgba(201,168,76,0.3);
          color: rgba(200,215,255,0.55);
        }

        /* ── chore card ── */
        .chore-card {
          position: relative;
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(201,168,76,0.1);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .chore-card:hover { border-color: rgba(201,168,76,0.22); }
        .chore-card.editing {
          border-color: rgba(201,168,76,0.45);
          box-shadow: 0 0 16px rgba(201,168,76,0.08);
        }

        /* ── generate button ── */
        .gen-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.55rem 1rem;
          border-radius: 2px;
          border: 1px solid rgba(100,60,180,0.4);
          background: rgba(80,40,160,0.12);
          color: rgba(180,140,255,0.85);
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .gen-btn:hover:not(:disabled) {
          background: rgba(100,60,200,0.2);
          border-color: rgba(140,100,255,0.55);
        }
        .gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── submit button ── */
        .decree-btn {
          width: 100%;
          padding: 0.85rem;
          border-radius: 2px;
          border: 1px solid rgba(201,168,76,0.4);
          background: linear-gradient(135deg, rgba(20,36,80,0.95), rgba(40,16,85,0.95));
          color: rgba(201,168,76,0.95);
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .decree-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(30,52,110,0.98), rgba(55,22,115,0.98));
          border-color: rgba(201,168,76,0.65);
          box-shadow: 0 0 20px rgba(201,168,76,0.1);
        }
        .decree-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 11px; height: 11px;
          border: 2px solid rgba(201,168,76,0.25);
          border-top-color: rgba(201,168,76,0.85);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 5px;
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slide-in 0.3s ease both; }

        @media (max-width: 767px) {
          .chores-layout {
            grid-template-columns: 1fr !important;
          }
          .chores-layout > section:last-child {
            position: static !important;
          }
        }
      `}</style>

      <PageHeader
        kicker="THE CHORE LEDGER"
        title="Recurring Chores"
        sub="The deeds you ask your Hearthhold to perform — daily, weekly, or one-time."
        right={
          <span
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-parchment-muted)',
              letterSpacing: '0.12em',
            }}
          >
            {chores.length} ACTIVE {chores.length === 1 ? 'CHORE' : 'CHORES'}
          </span>
        }
      />

      <div>
        <div className="chores-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: '2rem', alignItems: 'start' }}>

          {/* ════════════════════════════════════════════════════════════════════
              LEFT COLUMN — Quest Board (list)
          ══════════════════════════════════════════════════════════════════════ */}
          <section>

            {/* Suggestions */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(201,168,76,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Quick Add Suggestions
                </h2>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.2), transparent)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {CHORE_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => applySuggestion(s)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 3,
                      border: '1px solid rgba(201,168,76,0.15)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'rgba(200,215,255,0.6)',
                      fontFamily: 'var(--font-heading, Cinzel, serif)',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                      e.currentTarget.style.color = '#e8f0ff'
                      e.currentTarget.style.background = 'rgba(201,168,76,0.05)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'
                      e.currentTarget.style.color = 'rgba(200,215,255,0.6)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    }}
                  >
                    + {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Section header + filters */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(201,168,76,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Quest Board
                </h2>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.2), transparent)' }} />
              </div>

              {/* Difficulty filters */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <button className={`filter-pill ${filterDiff === '' ? 'active' : ''}`} onClick={() => setFilterDiff('')}>All</button>
                {(['easy', 'medium', 'hard', 'epic'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    className={`filter-pill ${filterDiff === d ? 'active' : ''}`}
                    onClick={() => setFilterDiff(p => p === d ? '' : d)}
                    style={filterDiff === d ? { borderColor: DIFF_META[d].border, color: DIFF_META[d].color, background: DIFF_META[d].bg } : {}}
                  >
                    {DIFF_META[d].label}
                  </button>
                ))}
                <div style={{ width: 1, background: 'rgba(201,168,76,0.1)', margin: '0 0.1rem' }} />
                {(['once', 'daily', 'weekly', 'monthly'] as Recurrence[]).map(r => (
                  <button
                    key={r}
                    className={`filter-pill ${filterRec === r ? 'active' : ''}`}
                    onClick={() => setFilterRec(p => p === r ? '' : r)}
                  >
                    {REC_META[r].icon} {REC_META[r].label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(200,215,255,0.25)', fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.82rem' }}>
                <span className="spinner" /> Consulting the quest archives…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                padding: '3rem 2rem', textAlign: 'center',
                background: 'rgba(255,255,255,0.015)',
                border: '1px dashed rgba(201,168,76,0.1)', borderRadius: 3,
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }}>📜</div>
                <p style={{ fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.78rem', color: 'rgba(200,215,255,0.3)', letterSpacing: '0.06em' }}>
                  {chores.length === 0 ? 'The quest board is empty' : 'No quests match these filters'}
                </p>
                {chores.length === 0 && (
                  <p style={{ fontFamily: 'var(--font-heading, Cinzel, serif)', fontWeight: 300, fontSize: '0.72rem', color: 'rgba(200,215,255,0.18)', marginTop: '0.4rem' }}>
                    Issue your first decree using the form →
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filtered.map(chore => {
                  const diff  = chore.difficulty as Difficulty
                  const rec   = chore.recurrence as Recurrence
                  const meta  = DIFF_META[diff]
                  const isDeactivating = deactivatingId === chore.id

                  return (
                    <div
                      key={chore.id}
                      className={`chore-card slide-in ${editingId === chore.id ? 'editing' : ''}`}
                    >
                      {/* Difficulty accent bar */}
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: meta.color, opacity: 0.7 }} />

                      <div style={{ padding: '0.85rem 0.9rem 0.85rem 1.1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>

                        {/* Body */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                            {/* Difficulty badge */}
                            <PixelBadge variant={diff} />

                            {/* Title */}
                            <span style={{
                              fontFamily: 'var(--font-heading, Cinzel, serif)',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: '#e8f0ff',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {chore.title}
                            </span>

                            {/* Recurrence badge */}
                            <PixelBadge variant={rec} />
                          </div>

                          {/* Meta row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* Assigned */}
                            <span style={{ fontFamily: 'var(--font-heading, Cinzel, serif)', fontWeight: 300, fontSize: '0.7rem', color: 'rgba(200,215,255,0.35)' }}>
                              ⚔ {playerName(chore.assigned_to)}
                            </span>

                            {/* XP */}
                            <span style={{ fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)', fontSize: '0.42rem', color: 'rgba(201,168,76,0.75)', imageRendering: 'pixelated' }}>
                              ⬡ {chore.xp_reward} xp
                            </span>

                            {/* Gold */}
                            {chore.gold_reward > 0 && (
                              <span style={{ fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)', fontSize: '0.42rem', color: 'rgba(249,200,70,0.7)', imageRendering: 'pixelated' }}>
                                ◈ {chore.gold_reward} gp
                              </span>
                            )}
                          </div>

                          {/* Flavor text preview */}
                          {chore.quest_flavor_text && (
                            <p style={{
                              fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
                              fontSize: '0.78rem',
                              color: 'rgba(200,215,255,0.22)',
                              fontStyle: 'italic',
                              marginTop: '0.35rem',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}>
                              {chore.quest_flavor_text}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
                          <PixelButton variant="secondary" size="sm" onClick={() => startEdit(chore)}>
                            ✎ Edit
                          </PixelButton>
                          <PixelButton
                            variant="danger"
                            size="sm"
                            disabled={isDeactivating}
                            onClick={() => handleDeactivate(chore.id)}
                          >
                            {isDeactivating ? '…' : '✕ End'}
                          </PixelButton>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              RIGHT COLUMN — Decree Scroll (form)
          ══════════════════════════════════════════════════════════════════════ */}
          <section ref={formRef} style={{ position: 'sticky', top: '1.5rem' }}>

            {/* Scroll / Parchment */}
            <div style={{
              position: 'relative',
              background: 'linear-gradient(170deg, rgba(20,14,4,0.97) 0%, rgba(14,10,3,0.97) 100%)',
              border: '1px solid rgba(201,168,76,0.28)',
              borderRadius: 3,
              padding: '1.75rem',
              boxShadow: '0 0 40px rgba(201,168,76,0.04), inset 0 0 60px rgba(201,168,76,0.02)',
            }}>
              {/* Corner ornaments */}
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

              {/* Scroll header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem', opacity: 0.6 }}>🪶</div>
                <h2 style={{
                  fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
                  fontSize: '0.52rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(201,168,76,0.75)',
                  imageRendering: 'pixelated',
                  textShadow: '0 0 16px rgba(201,168,76,0.3)',
                }}>
                  {editingId ? '— Amend Decree —' : '— New Quest Decree —'}
                </h2>
                <div style={{ marginTop: '0.75rem', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Title */}
                <div>
                  <label className="ch-label" htmlFor="ch-title">Quest Title</label>
                  <input
                    id="ch-title"
                    className={`ch-input${formErrors.title ? ' err' : ''}`}
                    type="text"
                    placeholder="e.g. Purify the Cleansing Pool…"
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    disabled={submitting}
                    autoComplete="off"
                  />
                  {formErrors.title && <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.7rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>{formErrors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="ch-label" htmlFor="ch-desc">Description <span style={{ color: 'rgba(200,215,255,0.2)', fontWeight: 300 }}>(optional)</span></label>
                  <textarea
                    id="ch-desc"
                    className="ch-input"
                    placeholder="Briefly describe what needs to be done…"
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    disabled={submitting}
                    rows={2}
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="ch-label">Difficulty</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {(['easy', 'medium', 'hard', 'epic'] as Difficulty[]).map(d => {
                      const m = DIFF_META[d]
                      const active = form.difficulty === d
                      return (
                        <button
                          key={d}
                          type="button"
                          className="diff-btn"
                          onClick={() => setDifficulty(d)}
                          style={active ? {
                            background: m.bg,
                            border: `1px solid ${m.border}`,
                            color: m.color,
                            boxShadow: `0 0 8px ${m.glow}`,
                          } : {}}
                        >
                          {m.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* XP + Gold */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="ch-label" htmlFor="ch-xp">
                      XP Reward
                      <span style={{ color: 'rgba(201,168,76,0.35)', fontWeight: 300, marginLeft: 6 }}>
                        preset: {XP_PRESETS[form.difficulty]}
                      </span>
                    </label>
                    <input
                      id="ch-xp"
                      className={`ch-input${formErrors.xp_reward ? ' err' : ''}`}
                      type="number"
                      min={1} max={500}
                      value={form.xp_reward}
                      onChange={e => setField('xp_reward', e.target.value)}
                      disabled={submitting}
                    />
                    {formErrors.xp_reward && <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.7rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>{formErrors.xp_reward}</p>}
                  </div>
                  <div>
                    <label className="ch-label" htmlFor="ch-gold">Gold Reward <span style={{ color: 'rgba(200,215,255,0.2)', fontWeight: 300 }}>(optional)</span></label>
                    <input
                      id="ch-gold"
                      className={`ch-input${formErrors.gold_reward ? ' err' : ''}`}
                      type="number"
                      min={0} max={9999}
                      value={form.gold_reward}
                      onChange={e => setField('gold_reward', e.target.value)}
                      disabled={submitting}
                    />
                    {formErrors.gold_reward && <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.7rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>{formErrors.gold_reward}</p>}
                  </div>
                </div>

                {/* Assign To */}
                <div>
                  <label className="ch-label" htmlFor="ch-assign">Assign To</label>
                  <select
                    id="ch-assign"
                    className="ch-input"
                    value={form.assigned_to}
                    onChange={e => setField('assigned_to', e.target.value)}
                    disabled={submitting}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Everyone in the Hearthhold</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.display_name} (@{p.username})</option>
                    ))}
                  </select>
                </div>

                {/* Recurrence */}
                <div>
                  <label className="ch-label">Recurrence</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {(['once', 'daily', 'weekly', 'monthly'] as Recurrence[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`rec-btn${form.recurrence === r ? ' active' : ''}`}
                        onClick={() => setField('recurrence', r)}
                      >
                        {REC_META[r].icon} {REC_META[r].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flavor Text */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <label className="ch-label" htmlFor="ch-flavor" style={{ margin: 0 }}>
                      Quest Flavor Text <span style={{ color: 'rgba(200,215,255,0.2)', fontWeight: 300 }}>(optional)</span>
                    </label>
                    <button
                      type="button"
                      className="gen-btn"
                      onClick={handleGenerate}
                      disabled={generating || submitting}
                    >
                      {generating
                        ? <><span className="spinner" aria-hidden />Conjuring…</>
                        : <>✨ Auto-Generate</>
                      }
                    </button>
                  </div>
                  <textarea
                    id="ch-flavor"
                    className="ch-input"
                    placeholder="Write epic quest flavor text, or click Auto-Generate…"
                    value={form.quest_flavor_text}
                    onChange={e => setField('quest_flavor_text', e.target.value)}
                    disabled={submitting}
                    rows={4}
                  />
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)', margin: '0.25rem 0' }} />

                {/* Errors / success */}
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
                {submitOk && (
                  <div role="status" style={{
                    background: 'rgba(60,180,100,0.08)', border: '1px solid rgba(60,180,100,0.25)',
                    borderRadius: 2, padding: '0.6rem 0.8rem',
                    fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.78rem', color: 'rgba(80,200,120,0.85)',
                    display: 'flex', gap: '0.4rem',
                  }}>
                    <span>✦</span> {submitOk}
                  </div>
                )}

                {/* Submit + cancel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button type="submit" className="decree-btn" disabled={submitting} aria-busy={submitting}>
                    {submitting
                      ? <><span className="spinner" aria-hidden />Inscribing…</>
                      : editingId
                        ? '📜 Amend Decree'
                        : '📜 Issue Decree'
                    }
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{
                        width: '100%', padding: '0.55rem',
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 2, color: 'rgba(200,215,255,0.3)',
                        fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.68rem',
                        fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </form>
            </div>

          </section>
        </div>
      </div>
    </>
  )
}
