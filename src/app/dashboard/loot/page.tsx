'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'
import { PixelButton } from '@/components/ui'
import { PageHeader } from '@/components/qf'
import { LOOT_SUGGESTIONS } from '@/lib/constants/suggestions'

// ── Types ─────────────────────────────────────────────────────────────────────
type LootItem = Pick<
  Tables<'loot_store_items'>,
  | 'id' | 'name' | 'description' | 'flavor_text' | 'real_reward_description'
  | 'cost_xp' | 'cost_gold' | 'category' | 'is_available'
>
type LootCategory = 'real_reward' | 'cosmetic' | 'power_up' | 'story_unlock'

interface ItemForm {
  name: string
  real_reward_description: string
  flavor_text: string
  cost_xp: string
  cost_gold: string
  category: LootCategory
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CAT_META: Record<LootCategory, {
  label: string; icon: string; color: string; bg: string; border: string
}> = {
  real_reward:   { label: 'Real Reward',   icon: '🎁', color: '#e8a020', bg: 'rgba(232,160,32,0.1)',  border: 'rgba(232,160,32,0.35)' },
  cosmetic:      { label: 'Cosmetic',      icon: '✨', color: '#b060e0', bg: 'rgba(176,96,224,0.1)',  border: 'rgba(176,96,224,0.35)' },
  power_up:      { label: 'Power-Up',      icon: '⚡', color: '#4d8aff', bg: 'rgba(77,138,255,0.1)',  border: 'rgba(77,138,255,0.35)' },
  story_unlock:  { label: 'Story Unlock',  icon: '📖', color: '#2eb89a', bg: 'rgba(46,184,154,0.1)', border: 'rgba(46,184,154,0.35)' },
}

const CATEGORY_ORDER: LootCategory[] = ['real_reward', 'cosmetic', 'power_up', 'story_unlock']

const FORM_EMPTY: ItemForm = {
  name: '', real_reward_description: '', flavor_text: '',
  cost_xp: '0', cost_gold: '0', category: 'real_reward',
}

// ── Delete button with inline confirmation ────────────────────────────────────
function DeleteBtn({ onConfirm, disabled }: { onConfirm: () => void; disabled: boolean }) {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const t = setTimeout(() => setConfirming(false), 2500)
    return () => clearTimeout(t)
  }, [confirming])

  return confirming ? (
    <PixelButton
      variant="danger"
      size="sm"
      onClick={onConfirm}
      disabled={disabled}
    >
      Sure?
    </PixelButton>
  ) : (
    <PixelButton
      variant="danger"
      size="sm"
      onClick={() => setConfirming(true)}
      disabled={disabled}
    >
      ✕
    </PixelButton>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LootPage() {
  const supabase = createClient()
  const formRef = useRef<HTMLElement>(null)

  const [items,       setItems]       = useState<LootItem[]>([])
  const [householdId, setHouseholdId] = useState('')
  const [userId,      setUserId]      = useState('')
  const [loading,     setLoading]     = useState(true)

  const [form,       setFormState]  = useState<ItemForm>(FORM_EMPTY)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ItemForm, string>>>({})
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError,setSubmitError]= useState<string | null>(null)
  const [submitOk,   setSubmitOk]  = useState<string | null>(null)
  const [filterCat,  setFilterCat]  = useState<'' | LootCategory>('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    const { data: profile } = await supabase
      .from('profiles').select('household_id').eq('id', user.id).single()
    if (!profile) { setLoading(false); return }
    setHouseholdId(profile.household_id)

    const { data } = await supabase
      .from('loot_store_items')
      .select('id, name, description, flavor_text, real_reward_description, cost_xp, cost_gold, category, is_available')
      .order('category', { ascending: true })
      .order('name',     { ascending: true })

    setItems(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // ── Form helpers ────────────────────────────────────────────────────────────
  function setField<K extends keyof ItemForm>(k: K, v: ItemForm[K]) {
    setFormState(p => ({ ...p, [k]: v }))
    setFormErrors(p => ({ ...p, [k]: undefined }))
    setSubmitError(null); setSubmitOk(null)
  }

  function applySuggestion(s: typeof LOOT_SUGGESTIONS[number]) {
    setFormState(p => ({
      ...p,
      name: s.name,
      real_reward_description: s.description,
      flavor_text: '', // clear old flavor
      category: s.category,
      cost_gold: String(s.cost_gold),
      cost_xp: '0',
    }))
    setFormErrors({})
    setSubmitError(null); setSubmitOk(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof ItemForm, string>> = {}
    if (!form.name.trim()) errs.name = 'Name required'
    const xp   = parseInt(form.cost_xp,   10)
    const gold = parseInt(form.cost_gold, 10)
    if (isNaN(xp)   || xp   < 0 || xp   > 99999) errs.cost_xp   = '0–99 999'
    if (isNaN(gold) || gold < 0 || gold > 99999) errs.cost_gold = '0–99 999'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true); setSubmitError(null); setSubmitOk(null)

    const payload = {
      name:                   form.name.trim(),
      real_reward_description: form.real_reward_description.trim(),
      flavor_text:            form.flavor_text.trim(),
      description:            form.real_reward_description.trim(), // mirrors real_reward_description
      cost_xp:                parseInt(form.cost_xp,   10) || 0,
      cost_gold:              parseInt(form.cost_gold, 10) || 0,
      category:               form.category,
    }

    if (editingId) {
      const { error } = await supabase.from('loot_store_items').update(payload).eq('id', editingId)
      if (error) {
        setSubmitError('Failed to update item.')
      } else {
        setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...payload } : i))
        setEditingId(null); setFormState(FORM_EMPTY)
        setSubmitOk('Item updated!')
      }
    } else {
      const { data, error } = await supabase
        .from('loot_store_items')
        .insert({ ...payload, household_id: householdId, created_by: userId, is_available: true })
        .select('id, name, description, flavor_text, real_reward_description, cost_xp, cost_gold, category, is_available')
        .single()
      if (error || !data) {
        setSubmitError('Failed to add item.')
      } else {
        setItems(prev => [...prev, data].sort((a, b) =>
          a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        ))
        setFormState(FORM_EMPTY)
        setSubmitOk(`"${data.name}" added to the Emporium!`)
      }
    }
    setSubmitting(false)
  }

  // ── Edit ────────────────────────────────────────────────────────────────────
  function startEdit(item: LootItem) {
    setEditingId(item.id)
    setFormState({
      name:                   item.name,
      real_reward_description: item.real_reward_description ?? '',
      flavor_text:            item.flavor_text ?? '',
      cost_xp:                String(item.cost_xp),
      cost_gold:              String(item.cost_gold),
      category:               item.category as LootCategory,
    })
    setFormErrors({}); setSubmitError(null); setSubmitOk(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function cancelEdit() {
    setEditingId(null); setFormState(FORM_EMPTY)
    setFormErrors({}); setSubmitError(null); setSubmitOk(null)
  }

  // ── Toggle availability ──────────────────────────────────────────────────────
  async function toggleAvail(id: string, next: boolean) {
    setTogglingId(id)
    const { error } = await supabase
      .from('loot_store_items').update({ is_available: next }).eq('id', id)
    if (!error) setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: next } : i))
    setTogglingId(null)
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setDeletingId(id)
    const { error } = await supabase.from('loot_store_items').delete().eq('id', id)
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id))
      if (editingId === id) cancelEdit()
    }
    setDeletingId(null)
  }

  // ── Filtered items ──────────────────────────────────────────────────────────
  const filtered = items.filter(i => !filterCat || i.category === filterCat)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── shared inputs ── */
        .loot-label {
          display: block;
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.6);
          margin-bottom: 0.35rem;
        }
        .loot-input {
          width: 100%;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 2px;
          color: #e8f0ff;
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 0.88rem;
          padding: 0.58rem 0.8rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .loot-input:focus {
          border-color: rgba(201,168,76,0.5);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.07);
        }
        .loot-input.err { border-color: rgba(220,80,80,0.55) !important; }
        .loot-input::placeholder { color: rgba(200,215,255,0.2); font-style: italic; }
        .loot-input:disabled { opacity: 0.5; cursor: not-allowed; }
        textarea.loot-input { resize: vertical; min-height: 68px; line-height: 1.5; }
        select.loot-input { cursor: pointer; }

        /* ── availability toggle ── */
        .avail-toggle {
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.38rem;
          letter-spacing: 0.05em;
          image-rendering: pixelated;
          padding: 4px 8px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          min-width: 54px;
        }
        .avail-toggle.on {
          background: rgba(46,184,92,0.12);
          border: 1px solid rgba(46,184,92,0.4);
          color: rgba(46,184,92,0.9);
        }
        .avail-toggle.off {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(200,215,255,0.2);
        }
        .avail-toggle:hover:not(:disabled) { opacity: 0.8; }
        .avail-toggle:disabled { cursor: not-allowed; opacity: 0.5; }

        /* ── filter pills ── */
        .f-pill {
          padding: 3px 10px;
          border-radius: 2px;
          border: 1px solid rgba(201,168,76,0.14);
          background: transparent;
          color: rgba(200,215,255,0.28);
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.4rem;
          image-rendering: pixelated;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .f-pill.active {
          border-color: rgba(201,168,76,0.45);
          background: rgba(201,168,76,0.08);
          color: rgba(201,168,76,0.9);
        }
        .f-pill:hover:not(.active) {
          border-color: rgba(201,168,76,0.28);
          color: rgba(200,215,255,0.5);
        }

        /* ── ledger table ── */
        .ledger-row {
          display: grid;
          grid-template-columns: 44px 1fr auto auto auto;
          gap: 0;
          align-items: center;
          border-bottom: 1px solid rgba(201,168,76,0.07);
          transition: background 0.15s;
        }
        .ledger-row:last-child { border-bottom: none; }
        .ledger-row:hover { background: rgba(255,255,255,0.015); }
        .ledger-row.editing-row {
          background: rgba(201,168,76,0.04);
          border-color: rgba(201,168,76,0.18);
        }
        .ledger-cell {
          padding: 0.7rem 0.6rem;
          display: flex;
          align-items: center;
        }
        .ledger-cell:first-child { padding-left: 0.85rem; justify-content: center; }
        .ledger-cell:last-child  { padding-right: 0.85rem; gap: 0.35rem; }

        .ledger-header {
          display: grid;
          grid-template-columns: 44px 1fr auto auto auto;
          gap: 0;
          border-bottom: 1px solid rgba(201,168,76,0.15);
          background: rgba(0,0,0,0.18);
        }
        .ledger-header-cell {
          padding: 0.5rem 0.6rem;
          font-family: var(--font-pixel, 'Press Start 2P', monospace);
          font-size: 0.38rem;
          letter-spacing: 0.1em;
          image-rendering: pixelated;
          color: rgba(201,168,76,0.4);
          text-transform: uppercase;
        }
        .ledger-header-cell:first-child { padding-left: 0.85rem; }
        .ledger-header-cell:last-child  { padding-right: 0.85rem; }

        /* ── form submit ── */
        .stock-btn {
          width: 100%;
          padding: 0.82rem;
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
        .stock-btn:hover:not(:disabled) {
          border-color: rgba(201,168,76,0.65);
          background: linear-gradient(135deg, rgba(30,50,110,0.98), rgba(55,22,115,0.98));
          box-shadow: 0 0 18px rgba(201,168,76,0.1);
        }
        .stock-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 11px; height: 11px;
          border: 2px solid rgba(201,168,76,0.2);
          border-top-color: rgba(201,168,76,0.85);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 5px;
        }
        @keyframes pulse-red {
          0%, 100% { box-shadow: none; }
          50% { box-shadow: 0 0 8px rgba(220,60,60,0.4); }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fadein { animation: fadein 0.25s ease both; }

        @media (max-width: 900px) {
          .loot-layout { grid-template-columns: 1fr !important; }
          .ledger-row, .ledger-header {
            grid-template-columns: 44px 1fr auto auto !important;
          }
          .cost-cell { display: none !important; }
        }
      `}</style>

      <PageHeader
        kicker="ROOK'S WARES"
        title="Loot Emporium"
        sub="Forge real-world rewards, cosmetics, and power-ups for your Emberbearers."
        right={
          <span
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-parchment-muted)',
              letterSpacing: '0.12em',
            }}
          >
            {items.filter(i => i.is_available).length} OF {items.length} AVAILABLE
          </span>
        }
      />

      <div>
        <div
          className="loot-layout"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '2rem', alignItems: 'start' }}
        >

          {/* ══════════════════════════════════════════════════════════════════
              LEFT — Emporium Ledger
          ════════════════════════════════════════════════════════════════════ */}
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
                {LOOT_SUGGESTIONS.map((s, i) => (
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
                    + {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading, Cinzel, serif)',
                fontSize: '0.72rem', fontWeight: 700,
                color: 'rgba(201,168,76,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Emporium Inventory
              </h2>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.2), transparent)' }} />
            </div>

            {/* Category filters */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button className={`f-pill ${filterCat === '' ? 'active' : ''}`} onClick={() => setFilterCat('')}>All</button>
              {CATEGORY_ORDER.map(cat => (
                <button
                  key={cat}
                  className={`f-pill ${filterCat === cat ? 'active' : ''}`}
                  onClick={() => setFilterCat(p => p === cat ? '' : cat)}
                  style={filterCat === cat ? { borderColor: CAT_META[cat].border, color: CAT_META[cat].color, background: CAT_META[cat].bg } : {}}
                >
                  {CAT_META[cat].icon} {CAT_META[cat].label}
                </button>
              ))}
            </div>

            {/* Ledger table */}
            <div style={{
              background: 'rgba(255,255,255,0.018)',
              border: '1px solid rgba(201,168,76,0.1)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              {/* Header row */}
              <div className="ledger-header">
                <div className="ledger-header-cell">Cat</div>
                <div className="ledger-header-cell">Item</div>
                <div className="ledger-header-cell cost-cell" style={{ textAlign: 'right' }}>Cost</div>
                <div className="ledger-header-cell" style={{ textAlign: 'center' }}>Stock</div>
                <div className="ledger-header-cell"></div>
              </div>

              {loading ? (
                <div style={{
                  padding: '3rem', textAlign: 'center',
                  color: 'rgba(200,215,255,0.25)',
                  fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.82rem',
                }}>
                  <span className="spinner" /> Consulting the merchant&apos;s ledger…
                </div>
              ) : filtered.length === 0 ? (
                <div style={{
                  padding: '3rem 2rem', textAlign: 'center',
                  color: 'rgba(200,215,255,0.2)',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }}>💎</div>
                  <p style={{ fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                    {items.length === 0 ? 'The shelves are bare' : 'No items in this category'}
                  </p>
                  {items.length === 0 && (
                    <p style={{ fontFamily: 'var(--font-heading, Cinzel, serif)', fontWeight: 300, fontSize: '0.7rem', marginTop: '0.4rem', color: 'rgba(200,215,255,0.15)' }}>
                      Stock the Emporium using the form →
                    </p>
                  )}
                </div>
              ) : (
                filtered.map(item => {
                  const cat     = item.category as LootCategory
                  const meta    = CAT_META[cat]
                  const isEdit  = editingId === item.id
                  const isBusy  = togglingId === item.id || deletingId === item.id

                  return (
                    <div
                      key={item.id}
                      className={`ledger-row fadein ${isEdit ? 'editing-row' : ''}`}
                    >
                      {/* Category icon */}
                      <div className="ledger-cell" style={{ justifyContent: 'center' }}>
                        <span
                          style={{
                            fontSize: '1.1rem', lineHeight: 1,
                            filter: item.is_available ? 'none' : 'grayscale(1) opacity(0.35)',
                          }}
                          title={meta.label}
                          aria-label={meta.label}
                        >
                          {meta.icon}
                        </span>
                      </div>

                      {/* Name + description */}
                      <div className="ledger-cell" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem', padding: '0.65rem 0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontFamily: 'var(--font-heading, Cinzel, serif)',
                            fontSize: '0.88rem', fontWeight: 600,
                            color: item.is_available ? '#e8f0ff' : 'rgba(200,215,255,0.3)',
                          }}>
                            {item.name}
                          </span>
                          {/* Category badge */}
                          <span style={{
                            fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
                            fontSize: '0.36rem', imageRendering: 'pixelated',
                            padding: '2px 5px', borderRadius: 2,
                            background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color,
                            opacity: item.is_available ? 1 : 0.4,
                          }}>
                            {meta.label}
                          </span>
                          {isEdit && (
                            <span style={{
                              fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
                              fontSize: '0.36rem', imageRendering: 'pixelated',
                              padding: '2px 5px', borderRadius: 2,
                              background: 'rgba(201,168,76,0.1)',
                              border: '1px solid rgba(201,168,76,0.4)',
                              color: 'rgba(201,168,76,0.8)',
                            }}>
                              Editing
                            </span>
                          )}
                        </div>
                        {item.real_reward_description && (
                          <span style={{
                            fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
                            fontSize: '0.8rem', fontStyle: 'italic',
                            color: item.is_available ? 'rgba(200,215,255,0.35)' : 'rgba(200,215,255,0.15)',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {item.real_reward_description}
                          </span>
                        )}
                      </div>

                      {/* Cost */}
                      <div className="ledger-cell cost-cell" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', padding: '0.65rem 0.75rem' }}>
                        {item.cost_xp > 0 && (
                          <span style={{
                            fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
                            fontSize: '0.4rem', imageRendering: 'pixelated',
                            color: 'rgba(201,168,76,0.7)',
                            opacity: item.is_available ? 1 : 0.4,
                          }}>
                            ⬡ {item.cost_xp.toLocaleString()}
                          </span>
                        )}
                        {item.cost_gold > 0 && (
                          <span style={{
                            fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
                            fontSize: '0.4rem', imageRendering: 'pixelated',
                            color: 'rgba(249,200,70,0.65)',
                            opacity: item.is_available ? 1 : 0.4,
                          }}>
                            ◈ {item.cost_gold.toLocaleString()}
                          </span>
                        )}
                        {item.cost_xp === 0 && item.cost_gold === 0 && (
                          <span style={{
                            fontFamily: 'var(--font-heading, Cinzel, serif)',
                            fontSize: '0.68rem', fontStyle: 'italic',
                            color: 'rgba(200,215,255,0.18)',
                          }}>
                            free
                          </span>
                        )}
                      </div>

                      {/* Availability toggle */}
                      <div className="ledger-cell" style={{ justifyContent: 'center', padding: '0.65rem 0.5rem' }}>
                        <button
                          className={`avail-toggle ${item.is_available ? 'on' : 'off'}`}
                          onClick={() => toggleAvail(item.id, !item.is_available)}
                          disabled={isBusy}
                          title={item.is_available ? 'Click to hide from players' : 'Click to show to players'}
                        >
                          {item.is_available ? '● ON' : '○ OFF'}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="ledger-cell" style={{ gap: '0.3rem' }}>
                        <PixelButton
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(item)}
                          disabled={isBusy}
                        >
                          ✎
                        </PixelButton>
                        <DeleteBtn
                          onConfirm={() => handleDelete(item.id)}
                          disabled={isBusy}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Legend */}
            {items.length > 0 && (
              <div style={{
                display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
                marginTop: '0.75rem', paddingLeft: '0.25rem',
              }}>
                {CATEGORY_ORDER.map(cat => {
                  const count = items.filter(i => i.category === cat).length
                  if (count === 0) return null
                  return (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>{CAT_META[cat].icon}</span>
                      <span style={{
                        fontFamily: 'var(--font-heading, Cinzel, serif)',
                        fontSize: '0.65rem', color: 'rgba(200,215,255,0.25)',
                      }}>
                        {CAT_META[cat].label} ({count})
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT — Shop Register (form)
          ════════════════════════════════════════════════════════════════════ */}
          <section ref={formRef} style={{ position: 'sticky', top: '1.5rem' }}>
            <div style={{
              position: 'relative',
              background: 'linear-gradient(170deg, rgba(18,12,2,0.97), rgba(10,8,2,0.97))',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 3,
              padding: '1.75rem',
              boxShadow: 'inset 0 0 60px rgba(201,168,76,0.015)',
            }}>
              {/* Corner ornaments */}
              {([
                { top: -1, left: -1, borderWidth: '2px 0 0 2px' },
                { top: -1, right: -1, borderWidth: '2px 2px 0 0' },
                { bottom: -1, left: -1, borderWidth: '0 0 2px 2px' },
                { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' },
              ] as const).map((c, i) => (
                <div key={i} aria-hidden="true" style={{
                  position: 'absolute', width: 14, height: 14,
                  borderColor: 'rgba(201,168,76,0.38)', borderStyle: 'solid', ...c,
                }} />
              ))}

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.35rem', marginBottom: '0.4rem', opacity: 0.65 }}>🏪</div>
                <h2 style={{
                  fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
                  fontSize: '0.5rem', letterSpacing: '0.1em',
                  color: 'rgba(201,168,76,0.75)', imageRendering: 'pixelated',
                  textShadow: '0 0 14px rgba(201,168,76,0.3)',
                }}>
                  {editingId ? '— Update Ware —' : '— Stock New Ware —'}
                </h2>
                <div style={{ marginTop: '0.75rem', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

                {/* Category */}
                <div>
                  <label className="loot-label" htmlFor="l-category">Category</label>
                  <select
                    id="l-category"
                    className="loot-input"
                    value={form.category}
                    onChange={e => setField('category', e.target.value as LootCategory)}
                    disabled={submitting}
                  >
                    {CATEGORY_ORDER.map(cat => (
                      <option key={cat} value={cat}>{CAT_META[cat].icon} {CAT_META[cat].label}</option>
                    ))}
                  </select>
                </div>

                {/* Item Name */}
                <div>
                  <label className="loot-label" htmlFor="l-name">Item Name</label>
                  <input
                    id="l-name"
                    className={`loot-input${formErrors.name ? ' err' : ''}`}
                    type="text"
                    placeholder="e.g. Screen Time Scroll…"
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    disabled={submitting}
                    autoComplete="off"
                  />
                  {formErrors.name && <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.68rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>{formErrors.name}</p>}
                </div>

                {/* Real-world reward */}
                <div>
                  <label className="loot-label" htmlFor="l-irl">
                    Real-World Reward
                    <span style={{ color: 'rgba(200,215,255,0.2)', fontWeight: 300, marginLeft: 6 }}>(what they actually get)</span>
                  </label>
                  <textarea
                    id="l-irl"
                    className="loot-input"
                    placeholder="e.g. 30 minutes of extra screen time…"
                    value={form.real_reward_description}
                    onChange={e => setField('real_reward_description', e.target.value)}
                    disabled={submitting}
                    rows={2}
                  />
                </div>

                {/* Fantasy flavor text */}
                <div>
                  <label className="loot-label" htmlFor="l-flavor">
                    Fantasy Flavor Text
                    <span style={{ color: 'rgba(200,215,255,0.2)', fontWeight: 300, marginLeft: 6 }}>(optional)</span>
                  </label>
                  <textarea
                    id="l-flavor"
                    className="loot-input"
                    placeholder="e.g. A shimmering scroll that grants one hour of sanctioned leisure in the realm of screens…"
                    value={form.flavor_text}
                    onChange={e => setField('flavor_text', e.target.value)}
                    disabled={submitting}
                    rows={2}
                  />
                </div>

                {/* XP + Gold cost */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label className="loot-label" htmlFor="l-xp">⬡ XP Cost</label>
                    <input
                      id="l-xp"
                      className={`loot-input${formErrors.cost_xp ? ' err' : ''}`}
                      type="number"
                      min={0} max={99999}
                      value={form.cost_xp}
                      onChange={e => setField('cost_xp', e.target.value)}
                      disabled={submitting}
                    />
                    {formErrors.cost_xp && <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.68rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>{formErrors.cost_xp}</p>}
                  </div>
                  <div>
                    <label className="loot-label" htmlFor="l-gold">◈ Gold Cost</label>
                    <input
                      id="l-gold"
                      className={`loot-input${formErrors.cost_gold ? ' err' : ''}`}
                      type="number"
                      min={0} max={99999}
                      value={form.cost_gold}
                      onChange={e => setField('cost_gold', e.target.value)}
                      disabled={submitting}
                    />
                    {formErrors.cost_gold && <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.68rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>{formErrors.cost_gold}</p>}
                  </div>
                </div>

                {/* Suggested prices hint */}
                <div style={{
                  padding: '0.6rem 0.75rem',
                  background: 'rgba(201,168,76,0.04)',
                  border: '1px solid rgba(201,168,76,0.1)',
                  borderRadius: 2,
                }}>
                  <p style={{ fontFamily: 'var(--font-heading, Cinzel, serif)', fontWeight: 300, fontSize: '0.65rem', color: 'rgba(200,215,255,0.28)', lineHeight: 1.6 }}>
                    {form.category === 'real_reward'  && 'Suggested: 100–1000 XP · 30 min leisure = 100 · Movie night = 250 · $5 = 500'}
                    {form.category === 'cosmetic'     && 'Suggested: 50–200 XP · Hair color = 50 · Character title = 75 · Armor set = 200'}
                    {form.category === 'power_up'     && 'Suggested: 100–200 XP · XP Boost +25% = 100 · Boss Bane ×2 = 200'}
                    {form.category === 'story_unlock' && 'Suggested: 50–100 Gold · NPC backstory = 50 · Region map = 75 · Secret lore = 100'}
                  </p>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)' }} />

                {/* Error / success */}
                {submitError && (
                  <div role="alert" style={{
                    background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.22)',
                    borderRadius: 2, padding: '0.55rem 0.75rem',
                    fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.75rem',
                    color: 'rgba(220,100,100,0.85)', display: 'flex', gap: '0.4rem',
                  }}>
                    <span>⚠</span> {submitError}
                  </div>
                )}
                {submitOk && (
                  <div role="status" style={{
                    background: 'rgba(60,180,100,0.08)', border: '1px solid rgba(60,180,100,0.22)',
                    borderRadius: 2, padding: '0.55rem 0.75rem',
                    fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.75rem',
                    color: 'rgba(80,200,120,0.85)', display: 'flex', gap: '0.4rem',
                  }}>
                    <span>✦</span> {submitOk}
                  </div>
                )}

                {/* Submit + cancel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <button type="submit" className="stock-btn" disabled={submitting} aria-busy={submitting}>
                    {submitting
                      ? <><span className="spinner" aria-hidden />Stocking shelves…</>
                      : editingId
                        ? '🏪 Update Ware'
                        : '🏪 Stock the Shelves'
                    }
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{
                        width: '100%', padding: '0.5rem',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 2, color: 'rgba(200,215,255,0.28)',
                        fontFamily: 'var(--font-heading, Cinzel, serif)',
                        fontSize: '0.65rem', fontWeight: 600,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        cursor: 'pointer',
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
