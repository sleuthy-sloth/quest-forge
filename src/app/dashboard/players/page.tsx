'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'
import { PageHeader, PageDivider } from '@/components/qf'

type PlayerProfile = Pick<
  Tables<'profiles'>,
  'id' | 'display_name' | 'username' | 'age' | 'level' | 'xp_total' | 'xp_available' | 'gold' | 'created_at'
>

// ── XP maths (from CLAUDE.md: level N costs 50 × N × (N+1) / 2 total XP) ──
function xpForLevel(n: number) { return 50 * n * (n + 1) / 2 }
function levelProgress(xpTotal: number, level: number) {
  const prev = xpForLevel(level - 1)
  const needed = 50 * level // xpForLevel(level) - xpForLevel(level-1)
  const current = xpTotal - prev
  return { current: Math.max(0, current), needed, pct: Math.min(100, (Math.max(0, current) / needed) * 100) }
}

// ── Deterministic avatar color from username ─────────────────
const AVATAR_PALETTES = [
  { bg: 'rgba(100,30,140,0.85)', glow: 'rgba(160,80,220,0.4)',  text: '#d4a8f0' },
  { bg: 'rgba(20,60,140,0.85)',  glow: 'rgba(60,120,220,0.4)',  text: '#8ab4f8' },
  { bg: 'rgba(20,100,70,0.85)',  glow: 'rgba(40,180,120,0.4)',  text: '#6ed9a8' },
  { bg: 'rgba(140,60,20,0.85)',  glow: 'rgba(220,110,40,0.4)',  text: '#f0a86e' },
  { bg: 'rgba(130,20,50,0.85)',  glow: 'rgba(210,50,90,0.4)',   text: '#f08aaa' },
  { bg: 'rgba(20,100,120,0.85)', glow: 'rgba(40,160,200,0.4)',  text: '#6ecef0' },
  { bg: 'rgba(100,95,20,0.85)',  glow: 'rgba(200,180,40,0.4)',  text: '#f0dc6e' },
  { bg: 'rgba(60,20,100,0.85)',  glow: 'rgba(120,50,200,0.4)',  text: '#b08af0' },
]
function avatarPalette(username: string) {
  let h = 0
  for (const c of username) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length]
}

// ── Avatar placeholder ────────────────────────────────────────
function AvatarCircle({ name, username, size = 48 }: { name: string; username: string; size?: number }) {
  const pal = avatarPalette(username)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: pal.bg,
      border: `2px solid ${pal.glow.replace('0.4', '0.6')}`,
      boxShadow: `0 0 12px ${pal.glow}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: size * 0.28,
        color: pal.text,
        lineHeight: 1,
        imageRendering: 'pixelated',
      }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

// ── XP bar ────────────────────────────────────────────────────
function XpBar({ xpTotal, level }: { xpTotal: number; level: number }) {
  const { pct, current, needed } = levelProgress(xpTotal, level)
  return (
    <div>
      <div style={{
        height: 6, borderRadius: 3,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(201,168,76,0.12)',
        overflow: 'hidden',
        width: '100%',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, rgba(201,168,76,0.6), rgba(201,168,76,0.9))',
          borderRadius: 3,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 300,
        fontSize: '0.68rem',
        color: 'rgba(200,215,255,0.35)',
        marginTop: 3,
      }}>
        {current} / {needed} XP to Lv.{level + 1}
      </div>
    </div>
  )
}

// ── Inline reset-password form ────────────────────────────────
function ResetForm({ playerId, onDone }: { playerId: string; onDone: () => void }) {
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError(null)
    const res = await fetch('/api/auth/create-child', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, newPassword: pw }),
    })
    const data = await res.json() as { success?: boolean; error?: string }
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Failed to reset password.'); return }
    setDone(true)
    setTimeout(onDone, 1200)
  }

  if (done) return (
    <div style={{ padding: '0.75rem 1rem', color: 'rgba(90,200,120,0.85)', fontFamily: "'Raleway', sans-serif", fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span>✓</span> Password updated.
    </div>
  )

  return (
    <form onSubmit={submit} style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(201,168,76,0.08)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <input
          type="password"
          placeholder="New password (min 6 chars)..."
          value={pw}
          onChange={e => { setPw(e.target.value); setError(null) }}
          disabled={loading}
          autoFocus
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 2,
            color: '#e8f0ff',
            fontFamily: "'Raleway', sans-serif",
            fontWeight: 300,
            fontSize: '0.88rem',
            padding: '0.5rem 0.75rem',
            outline: 'none',
          }}
        />
        {error && <p style={{ color: 'rgba(220,100,100,0.85)', fontFamily: "'Raleway', sans-serif", fontSize: '0.75rem', marginTop: 4 }}>{error}</p>}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button type="submit" disabled={loading} style={{
          background: 'rgba(22,40,90,0.9)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 2,
          color: 'rgba(201,168,76,0.9)',
          fontFamily: "'Cinzel', serif",
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0.5rem 0.85rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? '...' : 'Confirm'}
        </button>
        <button type="button" onClick={onDone} style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
          color: 'rgba(200,215,255,0.4)',
          fontFamily: "'Cinzel', serif",
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0.5rem 0.75rem',
          cursor: 'pointer',
        }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Create player form ────────────────────────────────────────
interface CreateForm { displayName: string; username: string; password: string; age: string }
const FORM_EMPTY: CreateForm = { displayName: '', username: '', password: '', age: '' }

// ── Main page ─────────────────────────────────────────────────
export default function PlayersPage() {
  // useMemo stabilises the client reference so the fetchPlayers useCallback
  // doesn't regenerate on every render, which would trigger an infinite loop.
  const supabase = useMemo(() => createClient(), [])

  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [form, setForm] = useState<CreateForm>(FORM_EMPTY)
  const [formErrors, setFormErrors] = useState<Partial<CreateForm>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const [resetTarget, setResetTarget] = useState<string | null>(null)

  const fetchPlayers = useCallback(async () => {
    setLoading(true); setFetchError(null)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, age, level, xp_total, xp_available, gold, created_at')
      .eq('role', 'player')
      .order('created_at', { ascending: true })
    if (error) {
      setFetchError('Could not load players.')
    } else {
      setPlayers(data ?? [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchPlayers() }, [fetchPlayers])

  function setField(key: keyof CreateForm) {
    return (v: string) => {
      setForm(p => ({ ...p, [key]: v }))
      if (formErrors[key]) setFormErrors(p => ({ ...p, [key]: undefined }))
      setSubmitError(null)
      setSubmitSuccess(null)
    }
  }

  function validateForm(): boolean {
    const errs: Partial<CreateForm> = {}
    if (form.displayName.trim().length < 2) errs.displayName = 'At least 2 characters'
    if (!/^[a-z0-9_]{2,30}$/i.test(form.username.trim())) errs.username = '2–30 letters, numbers, or underscores'
    if (form.password.length < 6) errs.password = 'At least 6 characters'
    const age = parseInt(form.age, 10)
    if (isNaN(age) || age < 4 || age > 17) errs.age = 'Must be between 4 and 17'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitting(true); setSubmitError(null); setSubmitSuccess(null)

    const res = await fetch('/api/auth/create-child', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: form.displayName.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        age: parseInt(form.age, 10),
      }),
    })

    const data = await res.json() as { profile?: PlayerProfile; error?: string }
    setSubmitting(false)

    if (!res.ok) {
      setSubmitError(data.error ?? 'Something went wrong.')
      return
    }

    if (data.profile) {
      setPlayers(prev => [...prev, data.profile!])
      setSubmitSuccess(`${data.profile.display_name} has joined the Hearthhold!`)
      setForm(FORM_EMPTY)
    }
  }

  const FIELD_BASE: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(201,168,76,0.18)',
    borderRadius: 2,
    color: '#e8f0ff',
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 300,
    fontSize: '0.92rem',
    padding: '0.65rem 0.9rem',
    outline: 'none',
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap');

        .pl-input { transition: border-color 0.25s, box-shadow 0.25s, background 0.25s; }
        .pl-input:focus {
          border-color: rgba(201,168,76,0.5) !important;
          background: rgba(201,168,76,0.035) !important;
          box-shadow: 0 0 0 3px rgba(100,160,255,0.07) !important;
        }
        .pl-input.err { border-color: rgba(220,80,80,0.5) !important; }

        .player-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(201,168,76,0.1);
          border-radius: 4px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .player-card:hover { border-color: rgba(201,168,76,0.2); }

        .reset-btn {
          background: transparent;
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 2px;
          color: rgba(201,168,76,0.5);
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.35rem 0.7rem;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .reset-btn:hover {
          color: rgba(201,168,76,0.85);
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.05);
        }
        .reset-btn.active {
          color: rgba(220,100,100,0.8);
          border-color: rgba(220,100,100,0.3);
        }

        .create-btn {
          width: 100%;
          background: linear-gradient(135deg, rgba(22,40,90,0.95), rgba(45,18,95,0.95));
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 2px;
          color: rgba(201,168,76,0.95);
          font-family: 'Cinzel', serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.85rem;
          cursor: pointer;
          transition: background 0.3s, border-color 0.2s;
        }
        .create-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(32,56,120,0.98), rgba(62,26,130,0.98));
          border-color: rgba(201,168,76,0.65);
        }
        .create-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes spinner { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block;
          width: 12px; height: 12px;
          border: 2px solid rgba(201,168,76,0.25);
          border-top-color: rgba(201,168,76,0.8);
          border-radius: 50%;
          animation: spinner 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slide-in 0.2s ease both; }
      `}</style>

      <PageHeader
        kicker="THE EMBERBEARERS"
        title="Players"
        sub="Forge child accounts. No email is ever collected — username + secret word only."
        right={
          <span
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-parchment-muted)',
              letterSpacing: '0.12em',
            }}
          >
            {players.length} {players.length === 1 ? 'ADVENTURER' : 'ADVENTURERS'}
          </span>
        }
      />

      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Player Roster ── */}
          <section>
            <PageDivider>Adventurer Roster</PageDivider>

            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(200,215,255,0.3)', fontFamily: "'Raleway', sans-serif", fontWeight: 300, fontSize: '0.88rem' }}>
                <span className="spinner" /> Consulting the stars...
              </div>
            )}

            {fetchError && (
              <div style={{ padding: '1rem', background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.25)', borderRadius: 3, color: 'rgba(220,100,100,0.85)', fontFamily: "'Raleway', sans-serif", fontSize: '0.88rem' }}>
                ⚠ {fetchError}
              </div>
            )}

            {!loading && !fetchError && players.length === 0 && (
              <div style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.015)',
                border: '1px dashed rgba(201,168,76,0.12)',
                borderRadius: 4,
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.4 }}>⚔</div>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.78rem', color: 'rgba(200,215,255,0.3)', letterSpacing: '0.06em' }}>
                  No adventurers yet
                </p>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 300, fontSize: '0.82rem', color: 'rgba(200,215,255,0.2)', marginTop: '0.4rem' }}>
                  Create your first player using the form →
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {players.map(player => (
                <div key={player.id} className="player-card slide-in">
                  {/* Main row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1rem' }}>

                    {/* Avatar */}
                    <AvatarCircle name={player.display_name} username={player.username} size={48} />

                    {/* Identity */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.88rem', fontWeight: 600, color: '#e8f0ff', letterSpacing: '0.02em' }}>
                          {player.display_name}
                        </span>
                        <span style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 300, fontSize: '0.75rem', color: 'rgba(200,215,255,0.35)' }}>
                          @{player.username}
                        </span>
                        {player.age != null && (
                          <span style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 300, fontSize: '0.72rem', color: 'rgba(200,215,255,0.25)' }}>
                            · Age {player.age}
                          </span>
                        )}
                      </div>

                      {/* Level + XP */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                        <span style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '0.55rem',
                          color: '#c9a84c',
                          background: 'rgba(201,168,76,0.08)',
                          border: '1px solid rgba(201,168,76,0.2)',
                          padding: '2px 6px',
                          borderRadius: 2,
                          imageRendering: 'pixelated',
                          flexShrink: 0,
                        }}>
                          Lv.{player.level}
                        </span>
                        <div style={{ flex: 1, minWidth: 80 }}>
                          <XpBar xpTotal={player.xp_total} level={player.level} />
                        </div>
                        <span style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 300, fontSize: '0.72rem', color: 'rgba(201,168,76,0.5)', flexShrink: 0 }}>
                          {player.gold}g
                        </span>
                      </div>
                    </div>

                    {/* Reset button */}
                    <button
                      className={`reset-btn${resetTarget === player.id ? ' active' : ''}`}
                      onClick={() => setResetTarget(resetTarget === player.id ? null : player.id)}
                      aria-expanded={resetTarget === player.id}
                    >
                      {resetTarget === player.id ? '✕ Cancel' : '🔑 Reset PW'}
                    </button>
                  </div>

                  {/* Inline reset form */}
                  {resetTarget === player.id && (
                    <ResetForm
                      playerId={player.id}
                      onDone={() => setResetTarget(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Create Player Form ── */}
          <section style={{ position: 'sticky', top: '1.5rem' }}>
            <div style={{
              background: 'linear-gradient(158deg, rgba(7,10,26,0.97) 0%, rgba(10,6,22,0.97) 100%)',
              border: '1px solid rgba(201,168,76,0.22)',
              borderRadius: 3,
              padding: '1.75rem',
              boxShadow: '0 0 40px rgba(20,40,160,0.1)',
              position: 'relative',
            }}>
              {/* Corner accents */}
              {[
                { top: -1, left: -1, borderWidth: '2px 0 0 2px' },
                { top: -1, right: -1, borderWidth: '2px 2px 0 0' },
                { bottom: -1, left: -1, borderWidth: '0 0 2px 2px' },
                { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' },
              ].map((c, i) => (
                <div key={i} aria-hidden="true" style={{
                  position: 'absolute', width: 18, height: 18,
                  borderColor: 'rgba(201,168,76,0.35)', borderStyle: 'solid',
                  ...c,
                }} />
              ))}

              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#c9a84c',
                  letterSpacing: '0.07em',
                  textShadow: '0 0 16px rgba(201,168,76,0.22)',
                  marginBottom: '0.25rem',
                }}>
                  Recruit an Adventurer
                </h2>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)' }} />
                <p style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: 'rgba(200,215,255,0.35)', marginTop: '0.5rem' }}>
                  Create a player account for a child in your household.
                </p>
              </div>

              <form onSubmit={handleCreate} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {([
                  { label: 'Display Name', key: 'displayName' as const, type: 'text', placeholder: 'e.g. Aria the Bold', auto: 'off' },
                  { label: 'Username', key: 'username' as const, type: 'text', placeholder: 'lowercase, no spaces', auto: 'off' },
                  { label: 'Password', key: 'password' as const, type: 'password', placeholder: 'Min 6 characters', auto: 'new-password' },
                  { label: 'Age', key: 'age' as const, type: 'number', placeholder: '4 – 17', auto: 'off' },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label style={{
                      display: 'block',
                      fontFamily: "'Cinzel', serif",
                      fontSize: '0.6rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(201,168,76,0.6)',
                      marginBottom: '0.35rem',
                    }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      autoComplete={f.auto}
                      value={form[f.key]}
                      onChange={e => setField(f.key)(e.target.value)}
                      disabled={submitting}
                      className={`pl-input${formErrors[f.key] ? ' err' : ''}`}
                      min={f.key === 'age' ? 4 : undefined}
                      max={f.key === 'age' ? 17 : undefined}
                      style={{ ...FIELD_BASE, borderColor: formErrors[f.key] ? 'rgba(220,80,80,0.5)' : undefined }}
                    />
                    {formErrors[f.key] && (
                      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.72rem', color: 'rgba(220,100,100,0.8)', marginTop: 3 }}>
                        {formErrors[f.key]}
                      </p>
                    )}
                  </div>
                ))}

                {submitError && (
                  <div role="alert" style={{
                    background: 'rgba(220,60,60,0.08)',
                    border: '1px solid rgba(220,60,60,0.28)',
                    borderRadius: 2,
                    padding: '0.6rem 0.8rem',
                    fontFamily: "'Raleway', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.82rem',
                    color: 'rgba(220,100,100,0.85)',
                    display: 'flex',
                    gap: '0.4rem',
                  }}>
                    <span>⚠</span> {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div role="status" style={{
                    background: 'rgba(60,180,100,0.08)',
                    border: '1px solid rgba(60,180,100,0.25)',
                    borderRadius: 2,
                    padding: '0.6rem 0.8rem',
                    fontFamily: "'Raleway', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.82rem',
                    color: 'rgba(80,200,120,0.85)',
                    display: 'flex',
                    gap: '0.4rem',
                  }}>
                    <span>✦</span> {submitSuccess}
                  </div>
                )}

                <button type="submit" className="create-btn" disabled={submitting} aria-busy={submitting}>
                  {submitting ? <><span className="spinner" aria-hidden="true" />Forging Account...</> : '⚔ Create Player'}
                </button>
              </form>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
