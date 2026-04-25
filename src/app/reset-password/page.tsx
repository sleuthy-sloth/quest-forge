'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

// ── Schema ────────────────────────────────────────────────────
const ResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
  confirm: z.string(),
}).refine(v => v.password === v.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

type ResetFields = z.infer<typeof ResetSchema>
type FieldErrors = Partial<Record<keyof ResetFields, string>>

// ── Star field ────────────────────────────────────────────────
interface Star { id: number; x: number; y: number; size: number; opacity: number; twinkle: number }

// ── Astrolabe (cw, matches signup) ────────────────────────────
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
        animation: 'astro-spin 65s linear infinite',
        pointerEvents: 'none',
      }}
    >
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(100,160,255,0.1)" strokeWidth="0.75" strokeDasharray="5 12" />
      {[0, 90, 180, 270].map(deg => {
        const rad = (deg - 90) * Math.PI / 180
        return (
          <line key={deg}
            x1={cx + (innerR + 1) * Math.cos(rad)} y1={cy + (innerR + 1) * Math.sin(rad)}
            x2={cx + outerR * Math.cos(rad)} y2={cy + outerR * Math.sin(rad)}
            stroke="rgba(201,168,76,0.55)" strokeWidth="2"
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
            stroke={`rgba(201,168,76,${major ? 0.4 : 0.15})`}
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
            stroke="rgba(201,168,76,0.06)" strokeWidth="0.75"
          />
        )
      })}
      <circle cx={cx} cy={cy - outerR} r={5} fill="#c9a84c" />
      <circle cx={cx} cy={cy - outerR} r={10} fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1" />
      <circle cx={cx} cy={cy - outerR} r={15} fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.5" />
    </svg>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function ResetPasswordPage() {
  const supabase = createClient()

  const [form, setForm] = useState<ResetFields>({ password: '', confirm: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)
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

  // Verify the user has a (recovery) session. The /auth/callback handler
  // should have already exchanged the code and set cookies before
  // redirecting here.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      setHasSession(!!user)
      setSessionChecked(true)
    })()
    return () => { cancelled = true }
  }, [supabase])

  function setField(key: keyof ResetFields) {
    return (v: string) => {
      setForm(p => ({ ...p, [key]: v }))
      if (fieldErrors[key]) setFieldErrors(p => ({ ...p, [key]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const result = ResetSchema.safeParse(form)
    if (!result.success) {
      const errs: FieldErrors = {}
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof ResetFields
        if (!errs[field]) errs[field] = issue.message
      })
      setFieldErrors(errs)
      document.getElementById(Object.keys(errs)[0])?.focus()
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: result.data.password })
      if (error) {
        setServerError(error.message || 'Could not update password. Please try again.')
        return
      }
      window.location.href = '/dashboard'
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes twinkle {
          0%,100% { opacity: var(--op); transform: scale(1); }
          50%      { opacity: calc(var(--op) * 0.3); transform: scale(0.55); }
        }
        @keyframes astro-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
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
      `}</style>

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

        <div aria-hidden="true" style={{
          position: 'fixed', top: '-15%', left: '-10%', width: '65%', height: '65%',
          background: 'radial-gradient(ellipse, rgba(28,55,160,0.16) 0%, transparent 70%)',
          animation: 'nebula-drift 20s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'fixed', bottom: '-20%', right: '-12%', width: '70%', height: '70%',
          background: 'radial-gradient(ellipse, rgba(100,18,180,0.12) 0%, transparent 70%)',
          animation: 'nebula-drift 28s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />

        {stars.map(s => (
          <div key={s.id} aria-hidden="true" style={{
            position: 'fixed',
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            borderRadius: '50%',
            background: s.size > 1.8 ? `rgba(200,220,255,${s.opacity})` : `rgba(255,255,255,${s.opacity})`,
            boxShadow: s.size > 1.8 ? `0 0 ${s.size * 3}px rgba(180,210,255,0.45)` : 'none',
            ['--op' as string]: s.opacity,
            animation: `twinkle ${s.twinkle}s ease-in-out ${s.id * 0.05}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          animation: 'card-emerge 1s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        }}>

          <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
            <AstrolabeRing size={760} />
          </div>

          <div style={{
            position: 'relative',
            background: 'linear-gradient(158deg, rgba(7,10,26,0.97) 0%, rgba(10,6,22,0.97) 100%)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '3px',
            padding: 'clamp(2rem, 5vw, 2.8rem)',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 0 80px rgba(20,40,160,0.18), 0 24px 80px rgba(0,0,0,0.55)',
          }}>

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

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-block', marginBottom: '1.1rem' }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(201,168,76,0.22)" strokeWidth="0.75" />
                  <circle cx="28" cy="28" r="18" fill="none" stroke="rgba(100,160,255,0.12)" strokeWidth="0.5" strokeDasharray="3 8" />
                  {[0, 90, 180, 270].map(d => {
                    const r = (d - 90) * Math.PI / 180
                    return <circle key={d} cx={28 + 26 * Math.cos(r)} cy={28 + 26 * Math.sin(r)} r="2.5" fill="rgba(201,168,76,0.65)" />
                  })}
                  <circle cx="28" cy="28" r="6" fill="rgba(100,160,255,0.1)" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />
                  <circle cx="28" cy="28" r="2.2" fill="rgba(201,168,76,0.55)" />
                  <line x1="28" y1="2" x2="28" y2="54" stroke="rgba(201,168,76,0.08)" strokeWidth="0.5" />
                  <line x1="2" y1="28" x2="54" y2="28" stroke="rgba(201,168,76,0.08)" strokeWidth="0.5" />
                </svg>
              </div>

              <h1 style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1.1rem, 3.5vw, 1.45rem)',
                color: '#c9a84c',
                fontWeight: 700,
                letterSpacing: '0.07em',
                lineHeight: 1.25,
                marginBottom: '0.5rem',
                textShadow: '0 0 24px rgba(201,168,76,0.28)',
              }}>
                Forge a New Passphrase
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.8rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.28))' }} />
                <span style={{ color: 'rgba(201,168,76,0.38)', fontFamily: "'Cinzel', serif", fontSize: '0.5rem', letterSpacing: '0.2em' }}>✦ ✦ ✦</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.28), transparent)' }} />
              </div>

              <p style={{
                fontFamily: "'Raleway', sans-serif",
                fontWeight: 300,
                color: 'rgba(200,215,255,0.4)',
                fontSize: '0.87rem',
                letterSpacing: '0.04em',
              }}>
                Choose a new password for your Game Master account.
              </p>
            </div>

            {!sessionChecked ? (
              <p style={{
                textAlign: 'center',
                fontFamily: "'Raleway', sans-serif",
                fontWeight: 300,
                color: 'rgba(200,215,255,0.4)',
                fontSize: '0.9rem',
                padding: '1rem',
              }}>
                Verifying recovery link...
              </p>
            ) : !hasSession ? (
              <div role="alert" style={{
                background: 'rgba(220,60,60,0.08)',
                border: '1px solid rgba(220,60,60,0.3)',
                borderRadius: '2px',
                padding: '1rem 1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span aria-hidden="true" style={{ color: 'rgba(220,100,100,0.8)', flexShrink: 0 }}>⚠</span>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 400, color: 'rgba(220,100,100,0.9)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    This recovery link is invalid or has expired. Request a new one and try again.
                  </p>
                </div>
                <Link
                  href="/forgot-password"
                  style={{
                    alignSelf: 'flex-start',
                    color: 'rgba(201,168,76,0.85)',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.78rem',
                    letterSpacing: '0.1em',
                    textDecoration: 'underline',
                  }}
                >
                  Request a new recovery link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {[
                  { label: 'New Password', key: 'password' as const, placeholder: 'At least 8 characters...', autoComplete: 'new-password' },
                  { label: 'Confirm Password', key: 'confirm' as const, placeholder: 'Re-enter your password...', autoComplete: 'new-password' },
                ].map(f => (
                  <div key={f.key}>
                    <label htmlFor={f.key} className="ob-label">{f.label}</label>
                    <input
                      id={f.key}
                      className="ob-input"
                      type="password"
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      value={form[f.key]}
                      onChange={e => setField(f.key)(e.target.value)}
                      disabled={isLoading}
                      aria-invalid={!!fieldErrors[f.key]}
                      aria-describedby={fieldErrors[f.key] ? `${f.key}-err` : undefined}
                    />
                    {fieldErrors[f.key] && (
                      <p id={`${f.key}-err`} role="alert" style={{
                        fontFamily: "'Raleway', sans-serif",
                        fontWeight: 400,
                        fontSize: '0.8rem',
                        color: 'rgba(220,100,100,0.85)',
                        marginTop: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}>
                        <span aria-hidden="true">△</span> {fieldErrors[f.key]}
                      </p>
                    )}
                  </div>
                ))}

                {serverError && (
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
                      {serverError}
                    </p>
                  </div>
                )}

                <button type="submit" className="ob-btn" disabled={isLoading} aria-busy={isLoading} style={{ marginTop: '0.25rem' }}>
                  {isLoading
                    ? <><div className="ob-spinner" aria-hidden="true" /> Forging New Passphrase...</>
                    : <>⟡ Update Password ⟡</>
                  }
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
