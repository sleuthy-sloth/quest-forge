'use client'

import { useState } from 'react'

export default function InviteGmForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setError('All fields are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/invite-gm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, displayName: displayName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setSuccess(`Co-GM "${displayName.trim()}" created! They can now sign in with their email and password.`)
        setEmail('')
        setPassword('')
        setDisplayName('')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(201,168,76,0.18)',
    borderRadius: 2,
    color: '#e8f0ff',
    fontFamily: 'var(--font-heading, Cinzel, serif)',
    fontSize: '0.85rem',
    padding: '0.55rem 0.75rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-heading, Cinzel, serif)',
    fontSize: '0.56rem',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,76,0.6)',
    marginBottom: '0.3rem',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div>
        <label style={labelStyle} htmlFor="cogm-name">Display Name</label>
        <input
          id="cogm-name"
          type="text"
          placeholder="e.g. Mom"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          disabled={submitting}
          autoComplete="off"
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.07)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="cogm-email">Email</label>
        <input
          id="cogm-email"
          type="email"
          placeholder="parent@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={submitting}
          autoComplete="off"
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.07)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="cogm-pw">Password</label>
        <input
          id="cogm-pw"
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={submitting}
          autoComplete="new-password"
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.07)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </div>

      {error && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'rgba(220,60,60,0.08)',
          border: '1px solid rgba(220,60,60,0.3)',
          borderRadius: 2,
          color: 'rgba(220,100,100,0.9)',
          fontFamily: 'var(--font-heading, Cinzel, serif)',
          fontSize: '0.78rem',
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'rgba(46,184,92,0.08)',
          border: '1px solid rgba(46,184,92,0.3)',
          borderRadius: 2,
          color: 'rgba(46,184,92,0.9)',
          fontFamily: 'var(--font-heading, Cinzel, serif)',
          fontSize: '0.78rem',
        }}>
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '0.7rem',
          borderRadius: 2,
          border: '1px solid rgba(201,168,76,0.4)',
          background: 'linear-gradient(135deg, rgba(20,36,80,0.95), rgba(40,16,85,0.95))',
          color: 'rgba(201,168,76,0.95)',
          fontFamily: 'var(--font-heading, Cinzel, serif)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.55 : 1,
          transition: 'all 0.2s',
        }}
      >
        {submitting ? 'Creating…' : '⬡ Create Co-GM Account'}
      </button>
    </form>
  )
}
