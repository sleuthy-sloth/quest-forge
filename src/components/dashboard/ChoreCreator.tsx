'use client'

import { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import { useChoreManager } from '@/hooks/useChoreManager'
import type { Difficulty, Recurrence, ChoreInput, ChoreResult } from '@/hooks/useChoreManager'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const ChoreSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(200, 'Title too long.'),
  description: z.string().max(500).optional().default(''),
  xpReward: z.coerce
    .number({ message: 'Must be a number.' })
    .int('Must be a whole number.')
    .min(1, 'Minimum 1 XP.')
    .max(500, 'Maximum 500 XP.'),
  goldReward: z.coerce
    .number({ message: 'Must be a number.' })
    .int()
    .min(0, 'Cannot be negative.')
    .max(9999, 'Maximum 9999 Gold.')
    .optional()
    .default(0),
  difficulty: z.enum(['easy', 'medium', 'hard', 'epic'] as const),
  recurrence: z.enum(['once', 'daily', 'weekly', 'monthly'] as const),
  assignedTo: z.string().optional().default(''),
  questFlavorText: z.string().max(2000).optional().default(''),
})

type FormState = z.infer<typeof ChoreSchema>
type FormErrors = Partial<Record<keyof FormState, string>>

// ---------------------------------------------------------------------------
// Presets & metadata
// ---------------------------------------------------------------------------

const XP_PRESETS: Record<Difficulty, number> = {
  easy: 15,
  medium: 35,
  hard: 75,
  epic: 150,
}

const DIFF_META: Record<Difficulty, { label: string; color: string; bg: string; border: string; glow: string }> = {
  easy: { label: 'Easy', color: '#2eb85c', bg: 'rgba(46,184,92,0.1)', border: 'rgba(46,184,92,0.35)', glow: 'rgba(46,184,92,0.2)' },
  medium: { label: 'Medium', color: '#4d8aff', bg: 'rgba(77,138,255,0.1)', border: 'rgba(77,138,255,0.35)', glow: 'rgba(77,138,255,0.2)' },
  hard: { label: 'Hard', color: '#b060e0', bg: 'rgba(176,96,224,0.1)', border: 'rgba(176,96,224,0.35)', glow: 'rgba(176,96,224,0.2)' },
  epic: { label: 'Epic', color: '#e86a20', bg: 'rgba(232,106,32,0.1)', border: 'rgba(232,106,32,0.35)', glow: 'rgba(232,106,32,0.2)' },
}

const REC_META: Record<Recurrence, { label: string; icon: string }> = {
  once: { label: 'One-time', icon: '◆' },
  daily: { label: 'Daily', icon: '↻' },
  weekly: { label: 'Weekly', icon: '⟳' },
  monthly: { label: 'Monthly', icon: '☽' },
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  xpReward: 15,
  goldReward: 0,
  difficulty: 'easy',
  recurrence: 'once',
  assignedTo: '',
  questFlavorText: '',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ChoreCreatorProps {
  householdId: string | null
  userId: string | null
  /** Callback after successful creation, receives the created chore. */
  onCreated?: (chore: ChoreResult) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChoreCreator({
  householdId,
  userId,
  onCreated,
}: ChoreCreatorProps) {
  const formRef = useRef<HTMLDivElement>(null)
  const { players, loadingPlayers, submitting, submitError, createChore, clearError } =
    useChoreManager(householdId, userId)

  // ── Form state ──────────────────────────────────────────────────────

  const [form, setFormState] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [generating, setGenerating] = useState(false)
  const [submitOk, setSubmitOk] = useState<string | null>(null)

  // ── CSS ─────────────────────────────────────────────────────────────

  // Inline styles to avoid dependency on global CSS classes — the component
  // is self-contained and can drop into any dark-themed dashboard page.

  const sharedStyle = (
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes slide-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .cc-label {
        display: block;
        font-family: var(--font-heading, Cinzel, serif);
        font-size: 0.56rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(201,168,76,0.55);
        margin-bottom: 0.35rem;
      }
      .cc-input {
        width: 100%;
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(201,168,76,0.18);
        border-radius: 2px;
        color: #e8f0ff;
        font-family: var(--font-heading, Cinzel, serif);
        font-size: 0.82rem;
        padding: 0.55rem 0.7rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }
      .cc-input:focus {
        border-color: rgba(201,168,76,0.45);
        box-shadow: 0 0 0 3px rgba(201,168,76,0.06);
      }
      .cc-input.err { border-color: rgba(220,80,80,0.5) !important; }
      .cc-input::placeholder { color: rgba(200,215,255,0.18); font-style: italic; }
      .cc-input:disabled { opacity: 0.5; cursor: not-allowed; }
      textarea.cc-input { resize: vertical; min-height: 72px; line-height: 1.5; }
      .cc-diff-btn {
        flex: 1;
        padding: 0.4rem 0;
        border-radius: 2px;
        border: 1px solid rgba(255,255,255,0.07);
        background: transparent;
        color: rgba(200,215,255,0.35);
        font-family: var(--font-heading, Cinzel, serif);
        font-size: 0.58rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.15s;
      }
      .cc-diff-btn:hover:not(:disabled) { opacity: 0.85; }
      .cc-diff-btn:disabled { cursor: not-allowed; }
      .cc-rec-btn {
        flex: 1;
        padding: 0.4rem 0;
        border-radius: 2px;
        border: 1px solid rgba(201,168,76,0.12);
        background: transparent;
        color: rgba(200,215,255,0.3);
        font-family: var(--font-heading, Cinzel, serif);
        font-size: 0.58rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.15s;
      }
      .cc-rec-btn.active {
        background: rgba(201,168,76,0.08);
        border-color: rgba(201,168,76,0.35);
        color: rgba(201,168,76,0.85);
      }
      .cc-rec-btn:hover:not(.active):not(:disabled) {
        border-color: rgba(201,168,76,0.25);
        color: rgba(201,168,76,0.55);
      }
      .cc-rec-btn:disabled { cursor: not-allowed; }
      .cc-gen-btn {
        display: flex; align-items: center; gap: 0.35rem;
        padding: 0.5rem 0.9rem;
        border-radius: 2px;
        border: 1px solid rgba(100,60,180,0.35);
        background: rgba(80,40,160,0.1);
        color: rgba(180,140,255,0.8);
        font-family: var(--font-heading, Cinzel, serif);
        font-size: 0.62rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
      }
      .cc-gen-btn:hover:not(:disabled) {
        background: rgba(100,60,200,0.18);
        border-color: rgba(140,100,255,0.5);
      }
      .cc-gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .cc-submit {
        width: 100%;
        padding: 0.75rem;
        border-radius: 2px;
        border: 1px solid rgba(201,168,76,0.35);
        background: linear-gradient(135deg, rgba(20,36,80,0.95), rgba(40,16,85,0.95));
        color: rgba(201,168,76,0.9);
        font-family: var(--font-heading, Cinzel, serif);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cc-submit:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(30,52,110,0.98), rgba(55,22,115,0.98));
        border-color: rgba(201,168,76,0.6);
        box-shadow: 0 0 20px rgba(201,168,76,0.08);
      }
      .cc-submit:disabled { opacity: 0.55; cursor: not-allowed; }
      .cc-spinner {
        display: inline-block; width: 11px; height: 11px;
        border: 2px solid rgba(201,168,76,0.2);
        border-top-color: rgba(201,168,76,0.8);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        vertical-align: middle; margin-right: 0.3rem;
      }
    `}</style>
  )

  // ── Field helpers ───────────────────────────────────────────────────

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined }))
    clearError()
    setSubmitOk(null)
  }

  function setDifficulty(d: Difficulty) {
    setFormState((p) => ({ ...p, difficulty: d, xpReward: XP_PRESETS[d] }))
    setErrors((p) => ({ ...p, difficulty: undefined, xpReward: undefined }))
    clearError()
    setSubmitOk(null)
  }

  // ── Validation ──────────────────────────────────────────────────────

  function validate(): FormState | null {
    const result = ChoreSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormErrors
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return null
    }
    setErrors({})
    return result.data
  }

  // ── Auto-Flavor ─────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!form.title.trim()) {
      setErrors((p) => ({ ...p, title: 'Enter a title first.' }))
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/chores/flavor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choreTitle: form.title,
          choreDescription: form.description,
        }),
      })
      const data = (await res.json()) as { flavorText?: string }
      if (res.ok && data.flavorText) {
        setField('questFlavorText', data.flavorText)
      }
    } catch {
      /* silently fail — user can type manually */
    }
    setGenerating(false)
  }

  // ── Submit ──────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = validate()
    if (!parsed) return

    const input: ChoreInput = {
      title: parsed.title,
      description: parsed.description || undefined,
      xpReward: parsed.xpReward,
      goldReward: parsed.goldReward,
      difficulty: parsed.difficulty,
      recurrence: parsed.recurrence,
      assignedTo: parsed.assignedTo || null,
      questFlavorText: parsed.questFlavorText || undefined,
    }

    const { data, error } = await createChore(input)
    if (error || !data) {
      // submitError is already set by the hook
      return
    }

    // Success — reset form
    setFormState(EMPTY_FORM)
    setSubmitOk(`"${data.title}" added to the quest board!`)
    onCreated?.(data)

    // Clear success message after a few seconds
    setTimeout(() => setSubmitOk(null), 5000)
  }

  // ── Reset on household change ───────────────────────────────────────

  useEffect(() => {
    setFormState(EMPTY_FORM)
    setErrors({})
    setSubmitOk(null)
    clearError()
  }, [householdId, clearError])

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <>
      {sharedStyle}

      <div ref={formRef} style={{
        position: 'relative',
        background: 'linear-gradient(170deg, rgba(20,14,4,0.97) 0%, rgba(14,10,3,0.97) 100%)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '3px',
        padding: '1.75rem',
        boxShadow: '0 0 40px rgba(201,168,76,0.03), inset 0 0 60px rgba(201,168,76,0.02)',
      }}>
        {/* Corner ornaments */}
        {([
          { top: -1, left: -1, bidrWidth: '2px 0 0 2px' },
          { top: -1, right: -1, bidrWidth: '2px 2px 0 0' },
          { bottom: -1, left: -1, bidrWidth: '0 0 2px 2px' },
          { bottom: -1, right: -1, bidrWidth: '0 2px 2px 0' },
        ] as const).map((c, i) => (
          <div key={i} aria-hidden style={{
            position: 'absolute', width: 14, height: 14,
            borderColor: 'rgba(201,168,76,0.35)', borderStyle: 'solid', ...c,
          }} />
        ))}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.35rem', opacity: 0.55 }}>🪶</div>
          <h2 style={{
            fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
            fontSize: '0.48rem',
            letterSpacing: '0.12em',
            color: 'rgba(201,168,76,0.7)',
            textShadow: '0 0 14px rgba(201,168,76,0.25)',
            margin: 0,
          }}>
            — New Quest Decree —
          </h2>
          <div style={{ marginTop: '0.7rem', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* ── Title ──────────────────────────────────────────── */}
          <div>
            <label className="cc-label" htmlFor="cc-title">Quest Title</label>
            <input
              id="cc-title"
              className={`cc-input${errors.title ? ' err' : ''}`}
              type="text"
              placeholder='e.g. Purify the Cleansing Pool…'
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              disabled={submitting}
              autoComplete="off"
            />
            {errors.title && (
              <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.65rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* ── Description ─────────────────────────────────────── */}
          <div>
            <label className="cc-label" htmlFor="cc-desc">
              Description <span style={{ color: 'rgba(200,215,255,0.18)', fontWeight: 300 }}>(optional)</span>
            </label>
            <textarea
              id="cc-desc"
              className="cc-input"
              placeholder="Briefly describe what needs to be done…"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              disabled={submitting}
              rows={2}
            />
          </div>

          {/* ── Difficulty ──────────────────────────────────────── */}
          <div>
            <label className="cc-label">Difficulty</label>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {(['easy', 'medium', 'hard', 'epic'] as Difficulty[]).map((d) => {
                const m = DIFF_META[d]
                const active = form.difficulty === d
                return (
                  <button
                    key={d}
                    type="button"
                    className="cc-diff-btn"
                    onClick={() => setDifficulty(d)}
                    disabled={submitting}
                    style={active ? {
                      background: m.bg,
                      border: `1px solid ${m.border}`,
                      color: m.color,
                      boxShadow: `0 0 8px ${m.glow}`,
                    } : undefined}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── XP + Gold ───────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="cc-label" htmlFor="cc-xp">
                XP Reward
                <span style={{ color: 'rgba(201,168,76,0.3)', fontWeight: 300, marginLeft: 4 }}>
                  (preset: {XP_PRESETS[form.difficulty]})
                </span>
              </label>
              <input
                id="cc-xp"
                className={`cc-input${errors.xpReward ? ' err' : ''}`}
                type="number"
                min={1} max={500}
                value={form.xpReward}
                onChange={(e) => setField('xpReward', Number(e.target.value))}
                disabled={submitting}
              />
              {errors.xpReward && (
                <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.65rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>
                  {errors.xpReward}
                </p>
              )}
            </div>
            <div>
              <label className="cc-label" htmlFor="cc-gold">
                Gold Reward <span style={{ color: 'rgba(200,215,255,0.18)', fontWeight: 300 }}>(optional)</span>
              </label>
              <input
                id="cc-gold"
                className={`cc-input${errors.goldReward ? ' err' : ''}`}
                type="number"
                min={0} max={9999}
                value={form.goldReward}
                onChange={(e) => setField('goldReward', Number(e.target.value))}
                disabled={submitting}
              />
              {errors.goldReward && (
                <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '0.65rem', marginTop: 3, fontFamily: 'var(--font-heading, Cinzel, serif)' }}>
                  {errors.goldReward}
                </p>
              )}
            </div>
          </div>

          {/* ── Assign To ───────────────────────────────────────── */}
          <div>
            <label className="cc-label" htmlFor="cc-assign">Assign To</label>
            {loadingPlayers ? (
              <p style={{ color: '#7a6a44', fontSize: '0.7rem', fontFamily: 'var(--font-body, Georgia, serif)', fontStyle: 'italic' }}>
                Loading players…
              </p>
            ) : (
              <select
                id="cc-assign"
                className="cc-input"
                value={form.assignedTo}
                onChange={(e) => setField('assignedTo', e.target.value)}
                disabled={submitting}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Everyone in the Hearthhold</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName} (@{p.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ── Recurrence ──────────────────────────────────────── */}
          <div>
            <label className="cc-label">Recurrence</label>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {(['once', 'daily', 'weekly', 'monthly'] as Recurrence[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`cc-rec-btn${form.recurrence === r ? ' active' : ''}`}
                  onClick={() => setField('recurrence', r)}
                  disabled={submitting}
                >
                  {REC_META[r].icon} {REC_META[r].label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Flavor Text ─────────────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <label className="cc-label" htmlFor="cc-flavor" style={{ margin: 0 }}>
                Quest Flavor Text <span style={{ color: 'rgba(200,215,255,0.18)', fontWeight: 300 }}>(optional)</span>
              </label>
              <button
                type="button"
                className="cc-gen-btn"
                onClick={handleGenerate}
                disabled={generating || submitting}
              >
                {generating
                  ? <><span className="cc-spinner" />Conjuring…</>
                  : <>✨ Auto-Flavor</>
                }
              </button>
            </div>
            <textarea
              id="cc-flavor"
              className="cc-input"
              placeholder="Write epic quest flavor text, or click Auto-Flavor…"
              value={form.questFlavorText}
              onChange={(e) => setField('questFlavorText', e.target.value)}
              disabled={submitting}
              rows={3}
            />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)', margin: '0.2rem 0' }} />

          {/* ── Feedback ────────────────────────────────────────── */}
          {submitError && (
            <div role="alert" style={{
              background: 'rgba(220,60,60,0.06)', border: '1px solid rgba(220,60,60,0.2)',
              borderRadius: 2, padding: '0.55rem 0.75rem',
              fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.72rem',
              color: 'rgba(220,100,100,0.8)', display: 'flex', gap: '0.35rem',
            }}>
              <span>⚠</span> {submitError}
            </div>
          )}
          {submitOk && (
            <div role="status" style={{
              background: 'rgba(60,180,100,0.06)', border: '1px solid rgba(60,180,100,0.2)',
              borderRadius: 2, padding: '0.55rem 0.75rem',
              fontFamily: 'var(--font-heading, Cinzel, serif)', fontSize: '0.72rem',
              color: 'rgba(80,200,120,0.8)', display: 'flex', gap: '0.35rem',
              animation: 'slide-in 0.3s ease both',
            }}>
              <span>✦</span> {submitOk}
            </div>
          )}

          {/* ── Submit ──────────────────────────────────────────── */}
          <button type="submit" className="cc-submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? <><span className="cc-spinner" />Inscribing…</> : '📜 Issue Decree'}
          </button>
        </form>
      </div>
    </>
  )
}
