'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

// ── Schemas ───────────────────────────────────────────────────
const GmSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const PlayerSchema = z.object({
  username: z.string().min(1, 'Username is required').max(60, 'Username too long'),
  password: z.string().min(1, 'Password is required'),
})

type GmFields    = z.infer<typeof GmSchema>
type PlayerFields = z.infer<typeof PlayerSchema>
type Tab = 'gm' | 'player'

// ── Star field ────────────────────────────────────────────────
interface Star { id: number; x: number; y: number; size: number; opacity: number; twinkle: number }

// ── Astrolabe (counter-rotates vs signup page) ─────────────────
function AstrolabeRing({ size }: { size: number }) {
  const cx = size / 2, cy = size / 2
  const outerR = size / 2 - 4
  const innerR = outerR - 18

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size} height={size}
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'astro-spin-ccw 70s linear infinite',
        pointerEvents: 'none',
      }}
    >
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(201,168,76,0.18)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(100,160,255,0.09)" strokeWidth="0.75" strokeDasharray="5 12" />
      {[0, 90, 180, 270].map(deg => {
        const rad = (deg - 90) * Math.PI / 180
        return (
          <line key={deg}
            x1={cx + (innerR + 1) * Math.cos(rad)} y1={cy + (innerR + 1) * Math.sin(rad)}
            x2={cx + outerR * Math.cos(rad)} y2={cy + outerR * Math.sin(rad)}
            stroke="rgba(201,168,76,0.5)" strokeWidth="2"
          />
        )
      })}
      {Array.from({ length: 36 }, (_, i) => {
        const rad = (i * 10 - 90) * Math.PI / 180
        const major = i % 3 === 0
        const r1 = major ? innerR + 1 : innerR + 7
        return (
          <line key={i}
            x1={cx + r1 * Math.cos(rad)} y1={cy + r1 * Math.sin(rad)}
            x2={cx + outerR * Math.cos(rad)} y2={cy + outerR * Math.sin(rad)}
            stroke={`rgba(201,168,76,${major ? 0.38 : 0.13})`}
            strokeWidth={major ? 1.2 : 0.5}
          />
        )
      })}
      {[0, 90].map(deg => {
        const rad = deg * Math.PI / 180
        return (
          <line key={deg}
            x1={cx - outerR * Math.cos(rad)} y1={cy - outerR * Math.sin(rad)}
            x2={cx + outerR * Math.cos(rad)} y2={cy + outerR * Math.sin(rad)}
            stroke="rgba(201,168,76,0.05)" strokeWidth="0.75"
          />
        )
      })}
      {/* Marker at bottom (180°) since it counter-rotates */}
      <circle cx={cx} cy={cy + outerR} r={5} fill="#c9a84c" />
      <circle cx={cx} cy={cy + outerR} r={10} fill="none" stroke="rgba(201,168,76,0.32)" strokeWidth="1" />
      <circle cx={cx} cy={cy + outerR} r={15} fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="0.5" />
    </svg>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function LoginPage() {
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('gm')
  const [gm, setGm]         = useState<GmFields>({ email: '', password: '' })
  const [player, setPlayer] = useState<PlayerFields>({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    setStars(Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.93 ? 2.2 : Math.random() > 0.72 ? 1.4 : 0.75,
      opacity: 0.3 + Math.random() * 0.7,
      twinkle: 2 + Math.random() * 6,
    })))
  }, [])

  // Surface ?error=recovery_link_invalid coming back from /auth/callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'recovery_link_invalid') {
      setServerError('That recovery link is invalid or has expired. Request a new one below.')
    }
  }, [])

  // Clear errors when switching tabs
  function switchTab(next: Tab) {
    setTab(next)
    setFieldErrors({})
    setServerError(null)
  }

  // ── GM login ────────────────────────────────────────────────
  async function handleGmLogin(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const result = GmSchema.safeParse(gm)
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.issues.forEach(i => { const k = String(i.path[0]); if (!errs[k]) errs[k] = i.message })
      setFieldErrors(errs)
      document.getElementById(`gm-${Object.keys(errs)[0]}`)?.focus()
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      })
      if (error) {
        setServerError('Invalid email or password.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setServerError('Authentication failed. Please try again.'); return }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        // Sign out so we don't leave a sessionless-profile user in a broken state
        await supabase.auth.signOut()
        setServerError(
          'Your account was found but your profile is missing. ' +
          'This can happen if signup did not complete. Please sign up again or contact support.'
        )
        return
      }

      if (profile.role !== 'gm') {
        await supabase.auth.signOut()
        setServerError('This account is a Player account. Use the Player tab to sign in.')
        return
      }

      const params = new URLSearchParams(window.location.search)
      const to = params.get('redirectTo')
      const safeRedirect = to && to.startsWith('/') && !to.startsWith('//') ? to : '/dashboard'
      window.location.href = safeRedirect
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Player login ─────────────────────────────────────────────
  async function handlePlayerLogin(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const result = PlayerSchema.safeParse(player)
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.issues.forEach(i => { const k = String(i.path[0]); if (!errs[k]) errs[k] = i.message })
      setFieldErrors(errs)
      document.getElementById(`pl-${Object.keys(errs)[0]}`)?.focus()
      return
    }

    setIsLoading(true)
    try {
      // 1. Resolve username → internal email via server route (uses admin client)
      const lookupRes = await fetch('/api/auth/lookup-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: result.data.username }),
      })

      if (!lookupRes.ok) {
        setServerError('Invalid username or password.')
        return
      }

      const { email } = await lookupRes.json() as { email: string }

      // 2. Sign in with the resolved internal email
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: result.data.password,
      })

      if (error) {
        setServerError('Invalid username or password.')
        return
      }

      const params = new URLSearchParams(window.location.search)
      const to = params.get('redirectTo')
      const safeRedirect = to && to.startsWith('/') && !to.startsWith('//') ? to : '/play'
      window.location.href = safeRedirect
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Field helpers ────────────────────────────────────────────
  function setGmField(key: keyof GmFields) {
    return (v: string) => {
      setGm(p => ({ ...p, [key]: v }))
      if (fieldErrors[key]) setFieldErrors(p => ({ ...p, [key]: undefined! }))
    }
  }
  function setPlayerField(key: keyof PlayerFields) {
    return (v: string) => {
      setPlayer(p => ({ ...p, [key]: v }))
      if (fieldErrors[key]) setFieldErrors(p => ({ ...p, [key]: undefined! }))
    }
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes twinkle {
          0%,100% { opacity: var(--op); transform: scale(1); }
          50%      { opacity: calc(var(--op) * 0.28); transform: scale(0.5); }
        }
        @keyframes astro-spin-ccw {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes card-emerge {
          from { opacity: 0; transform: scale(0.94) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes nebula-drift {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,-15px) scale(1.06); }
        }
        @keyframes sigil-pulse {
          0%,100% { box-shadow: 0 0 18px rgba(100,160,255,0.35), 0 0 40px rgba(80,100,255,0.1); }
          50%      { box-shadow: 0 0 28px rgba(100,160,255,0.6), 0 0 60px rgba(80,100,255,0.2); }
        }
        @keyframes tab-slide {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spinner { to { transform: rotate(360deg); } }

        .ob-label {
          display: block;
          font-family: 'Cinzel', serif;
          font-size: 0.63rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.65);
          margin-bottom: 0.4rem;
        }
        .ob-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 2px;
          color: #e8f0ff;
          font-family: 'Raleway', sans-serif;
          font-size: 0.95rem;
          font-weight: 300;
          padding: 0.7rem 0.95rem;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
        }
        .ob-input::placeholder { color: rgba(200,210,255,0.22); }
        .ob-input:focus {
          border-color: rgba(201,168,76,0.5);
          background: rgba(201,168,76,0.035);
          box-shadow: 0 0 0 3px rgba(100,160,255,0.07), 0 0 16px rgba(201,168,76,0.07);
        }
        .ob-input[aria-invalid="true"] {
          border-color: rgba(220,80,80,0.55);
          box-shadow: 0 0 0 3px rgba(220,80,80,0.08);
        }
        .ob-btn {
          width: 100%;
          background: linear-gradient(135deg, rgba(22,40,90,0.95), rgba(45,18,95,0.95));
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 2px;
          color: rgba(201,168,76,0.95);
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          animation: sigil-pulse 3s ease-in-out infinite;
          transition: background 0.3s, color 0.2s, border-color 0.2s;
        }
        .ob-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(32,56,120,0.98), rgba(62,26,130,0.98));
          color: rgba(240,208,100,1);
          border-color: rgba(201,168,76,0.65);
        }
        .ob-btn:disabled { opacity: 0.6; cursor: not-allowed; animation: none; }
        .ob-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(201,168,76,0.25);
          border-top-color: rgba(201,168,76,0.8);
          border-radius: 50%;
          animation: spinner 0.7s linear infinite;
          flex-shrink: 0;
        }
        .tab-panel { animation: tab-slide 0.22s ease both; }
      `}</style>

      {/* Void */}
      <div style={{
        minHeight: '100dvh',
        background: '#040812',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        overflow: 'hidden',
      }}>

        {/* Nebula glows */}
        <div aria-hidden="true" style={{
          position: 'fixed', top: '-15%', right: '-10%', width: '65%', height: '65%',
          background: 'radial-gradient(ellipse, rgba(28,55,160,0.15) 0%, transparent 70%)',
          animation: 'nebula-drift 22s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'fixed', bottom: '-20%', left: '-12%', width: '70%', height: '70%',
          background: 'radial-gradient(ellipse, rgba(100,18,180,0.11) 0%, transparent 70%)',
          animation: 'nebula-drift 30s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />

        {/* Stars */}
        {stars.map(s => (
          <div key={s.id} aria-hidden="true" style={{
            position: 'fixed',
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            borderRadius: '50%',
            background: s.size > 1.8
              ? `rgba(200,220,255,${s.opacity})`
              : `rgba(255,255,255,${s.opacity})`,
            boxShadow: s.size > 1.8 ? `0 0 ${s.size * 3}px rgba(180,210,255,0.45)` : 'none',
            ['--op' as string]: s.opacity,
            animation: `twinkle ${s.twinkle}s ease-in-out ${s.id * 0.05}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Astrolabe + Card */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          animation: 'card-emerge 1s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        }}>

          {/* Counter-rotating astrolabe ring */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
            <AstrolabeRing size={720} />
          </div>

          {/* Card */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(158deg, rgba(7,10,26,0.97) 0%, rgba(10,6,22,0.97) 100%)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '3px',
            padding: 'clamp(2rem, 5vw, 2.8rem)',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 0 80px rgba(20,40,160,0.16), 0 24px 80px rgba(0,0,0,0.55)',
          }}>

            {/* Cardinal diamonds */}
            {[
              { top: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
              { bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
              { left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)' },
              { right: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)' },
            ].map((s, i) => (
              <div key={i} aria-hidden="true" style={{
                position: 'absolute', width: 10, height: 10,
                background: '#c9a84c',
                boxShadow: '0 0 8px rgba(201,168,76,0.6)',
                ...s,
              }} />
            ))}

            {/* ── Header ──────────────────────────────────────── */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="24" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.75" />
                  <circle cx="26" cy="26" r="16" fill="none" stroke="rgba(100,160,255,0.1)" strokeWidth="0.5" strokeDasharray="3 8" />
                  {[0, 90, 180, 270].map(d => {
                    const r = (d - 90) * Math.PI / 180
                    return <circle key={d} cx={26 + 24 * Math.cos(r)} cy={26 + 24 * Math.sin(r)} r="2.2" fill="rgba(201,168,76,0.6)" />
                  })}
                  <circle cx="26" cy="26" r="6" fill="rgba(100,160,255,0.08)" stroke="rgba(201,168,76,0.38)" strokeWidth="1" />
                  <circle cx="26" cy="26" r="2" fill="rgba(201,168,76,0.55)" />
                </svg>
              </div>

              <h1 style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1rem, 3.5vw, 1.35rem)',
                color: '#c9a84c',
                fontWeight: 700,
                letterSpacing: '0.07em',
                marginBottom: '0.4rem',
                textShadow: '0 0 24px rgba(201,168,76,0.25)',
              }}>
                Return to the Gates
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.75rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25))' }} />
                <span style={{ color: 'rgba(201,168,76,0.35)', fontFamily: "'Cinzel', serif", fontSize: '0.48rem', letterSpacing: '0.2em' }}>✦ ✦ ✦</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.25), transparent)' }} />
              </div>
            </div>

            {/* ── Tabs ────────────────────────────────────────── */}
            <div
              role="tablist"
              aria-label="Login type"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0,
                marginBottom: '1.75rem',
                border: '1px solid rgba(201,168,76,0.18)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              {([
                { id: 'gm',     label: 'Game Master', icon: '⟡' },
                { id: 'player', label: 'Player',      icon: '⚔' },
              ] as { id: Tab; label: string; icon: string }[]).map((t, i) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => switchTab(t.id)}
                  style={{
                    background: tab === t.id
                      ? 'linear-gradient(135deg, rgba(22,40,90,0.85), rgba(45,18,95,0.85))'
                      : 'rgba(255,255,255,0.02)',
                    border: 'none',
                    borderLeft: i === 1 ? '1px solid rgba(201,168,76,0.18)' : 'none',
                    color: tab === t.id ? 'rgba(201,168,76,0.95)' : 'rgba(200,215,255,0.3)',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.75rem 0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.25s',
                    position: 'relative',
                  }}
                >
                  {/* Active underline */}
                  {tab === t.id && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent)',
                    }} />
                  )}
                  <span aria-hidden="true" style={{ fontSize: '0.85rem' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── GM Panel ────────────────────────────────────── */}
            {tab === 'gm' && (
              <form
                id="panel-gm"
                role="tabpanel"
                aria-labelledby="tab-gm"
                className="tab-panel"
                onSubmit={handleGmLogin}
                noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
              >
                {[
                  { label: 'Email Address', key: 'email' as const, type: 'email', placeholder: 'your@email.com', autoComplete: 'email' },
                  { label: 'Password',      key: 'password' as const, type: 'password', placeholder: 'Your password...', autoComplete: 'current-password' },
                ].map(f => (
                  <div key={f.key}>
                    <label htmlFor={`gm-${f.key}`} className="ob-label">{f.label}</label>
                    <input
                      id={`gm-${f.key}`}
                      className="ob-input"
                      type={f.type}
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      value={gm[f.key]}
                      onChange={e => setGmField(f.key)(e.target.value)}
                      disabled={isLoading}
                      aria-invalid={!!fieldErrors[f.key]}
                      aria-describedby={fieldErrors[f.key] ? `gm-${f.key}-err` : undefined}
                    />
                    {fieldErrors[f.key] && (
                      <p id={`gm-${f.key}-err`} role="alert" style={errStyle}>
                        <span aria-hidden="true">△</span> {fieldErrors[f.key]}
                      </p>
                    )}
                  </div>
                ))}

                <div style={{ textAlign: 'right', marginTop: '-0.4rem' }}>
                  <Link
                    href="/forgot-password"
                    style={{
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: '0.78rem',
                      color: 'rgba(201,168,76,0.55)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.95)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.55)')}
                  >
                    Forgot password?
                  </Link>
                </div>

                <ServerError msg={serverError} />

                <button type="submit" className="ob-btn" disabled={isLoading} aria-busy={isLoading} style={{ marginTop: '0.25rem' }}>
                  {isLoading
                    ? <><div className="ob-spinner" aria-hidden="true" /> Consulting the Stars...</>
                    : <>⟡ Enter the Chronicle ⟡</>
                  }
                </button>
              </form>
            )}

            {/* ── Player Panel ─────────────────────────────────── */}
            {tab === 'player' && (
              <form
                id="panel-player"
                role="tabpanel"
                aria-labelledby="tab-player"
                className="tab-panel"
                onSubmit={handlePlayerLogin}
                noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
              >
                {[
                  { label: 'Username',  key: 'username' as const, type: 'text',     placeholder: 'Your player name...', autoComplete: 'username' },
                  { label: 'Password',  key: 'password' as const, type: 'password', placeholder: 'Your password...',    autoComplete: 'current-password' },
                ].map(f => (
                  <div key={f.key}>
                    <label htmlFor={`pl-${f.key}`} className="ob-label">{f.label}</label>
                    <input
                      id={`pl-${f.key}`}
                      className="ob-input"
                      type={f.type}
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      value={player[f.key]}
                      onChange={e => setPlayerField(f.key)(e.target.value)}
                      disabled={isLoading}
                      aria-invalid={!!fieldErrors[f.key]}
                      aria-describedby={fieldErrors[f.key] ? `pl-${f.key}-err` : undefined}
                    />
                    {fieldErrors[f.key] && (
                      <p id={`pl-${f.key}-err`} role="alert" style={errStyle}>
                        <span aria-hidden="true">△</span> {fieldErrors[f.key]}
                      </p>
                    )}
                  </div>
                ))}

                <ServerError msg={serverError} />

                <button type="submit" className="ob-btn" disabled={isLoading} aria-busy={isLoading} style={{ marginTop: '0.25rem' }}>
                  {isLoading
                    ? <><div className="ob-spinner" aria-hidden="true" /> Consulting the Stars...</>
                    : <>⚔ Enter the Chronicle ⚔</>
                  }
                </button>
              </form>
            )}

            {/* ── Footer ──────────────────────────────────────── */}
            <p style={{
              textAlign: 'center',
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 300,
              color: 'rgba(200,215,255,0.28)',
              fontSize: '0.82rem',
              marginTop: '1.5rem',
            }}>
              Don&apos;t have a household?{' '}
              <Link
                href="/signup"
                style={{ color: 'rgba(201,168,76,0.62)', textDecoration: 'none', fontWeight: 400, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(201,168,76,1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.62)')}
              >
                Create one
              </Link>
            </p>

          </div>
        </div>
      </div>
    </>
  )
}

// ── Shared sub-components ─────────────────────────────────────
const errStyle: React.CSSProperties = {
  fontFamily: "'Raleway', sans-serif",
  fontWeight: 400,
  fontSize: '0.8rem',
  color: 'rgba(220,100,100,0.85)',
  marginTop: '0.4rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
}

function ServerError({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div role="alert" style={{
      background: 'rgba(220,60,60,0.08)',
      border: '1px solid rgba(220,60,60,0.3)',
      borderRadius: '2px',
      padding: '0.7rem 0.9rem',
      display: 'flex',
      gap: '0.6rem',
      alignItems: 'flex-start',
    }}>
      <span aria-hidden="true" style={{ color: 'rgba(220,100,100,0.8)', flexShrink: 0 }}>⚠</span>
      <p style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 400, color: 'rgba(220,100,100,0.85)', fontSize: '0.88rem' }}>
        {msg}
      </p>
    </div>
  )
}
