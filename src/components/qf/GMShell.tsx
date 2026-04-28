'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, type ReactNode } from 'react'
import { signOut } from '@/app/actions/auth'
import { Embershard } from './Embershard'
import { Embers } from './Embers'
import { HPBar } from './HPBar'
import { useNotifications } from '@/hooks/useNotifications'

interface GMShellProps {
  children: ReactNode
  householdName: string
  displayName: string
  weeklyBoss?: { name: string; hpPct: number; current: number; max: number } | null
  userId: string
  householdId: string
  role: 'gm' | 'player'
}

const NAV = [
  { href: '/dashboard',              label: 'Hearth',        sub: 'Overview' },
  { href: '/dashboard/approvals',    label: 'Approvals',     sub: 'Pending verdicts' },
  { href: '/dashboard/chores',       label: 'Chores',        sub: 'Recurring tasks' },
  { href: '/dashboard/players',      label: 'Emberbearers',  sub: 'Your kids' },
  { href: '/dashboard/loot',         label: 'Loot Emporium', sub: 'Rewards' },
  { href: '/dashboard/redemptions',  label: 'Vouchers',      sub: 'Redeemed loot' },
  { href: '/dashboard/story',        label: 'Chronicle',     sub: 'Story arc' },
  { href: '/dashboard/settings',     label: 'Settings',      sub: '' },
] as const

export function GMShell({ children, householdName, displayName, weeklyBoss, userId, householdId, role }: GMShellProps) {
  const pathname = usePathname()
  const initial = (displayName || '').trim().charAt(0).toUpperCase() || 'G'
  
  // Realtime notification listener
  useNotifications(userId, householdId, role)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const sidebarRef   = useRef<HTMLElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (!e.matches) setSidebarOpen(false)
    }
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Focus management and focus-trap for mobile sidebar.
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return

    // Move focus to the first focusable element inside the sidebar.
    const sidebar = sidebarRef.current
    if (sidebar) {
      const first = sidebar.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      first?.focus()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        hamburgerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return

      const sb = sidebarRef.current
      if (!sb) return
      const focusable = Array.from(
        sb.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, sidebarOpen])

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  function closeNav() {
    if (isMobile) {
      setSidebarOpen(false)
      hamburgerRef.current?.focus()
    }
  }

  return (
    <div className="qf-shell qf-gm-shell">
      {/* Skip-to-content link — visible on keyboard focus only */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 100,
          padding: '6px 14px',
          background: 'var(--qf-gold-400)',
          color: 'var(--qf-bg-void)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 13,
          textDecoration: 'none',
          borderRadius: 2,
          transform: 'translateY(-100px)',
          transition: 'transform 0.1s',
        }}
        onFocus={e => ((e.target as HTMLAnchorElement).style.transform = 'translateY(0)')}
        onBlur={e => ((e.target as HTMLAnchorElement).style.transform = 'translateY(-100px)')}
      >
        Skip to content
      </a>

      <div className="qf-ember-bg" aria-hidden="true" />
      <Embers count={14} />

      {/* Topbar */}
      <header
        style={{
          height: 64,
          borderBottom: '1px solid var(--qf-rule)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          background: 'rgba(15,17,24,0.6)',
          backdropFilter: 'blur(8px)',
          position: 'relative',
          zIndex: 5,
          flexShrink: 0,
        }}
      >
        {/* Hamburger — only visible on mobile */}
        <button
          ref={hamburgerRef}
          onClick={() => setSidebarOpen(o => !o)}
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={sidebarOpen}
          aria-controls="gm-sidebar"
          style={{
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: 'var(--qf-gold-300)',
            cursor: 'pointer',
            padding: 0,
            marginRight: 14,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {sidebarOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Embershard size={22} />
          <div
            className="font-heading"
            style={{
              fontSize: isMobile ? 15 : 18,
              color: 'var(--qf-gold-300)',
              letterSpacing: '0.18em',
              fontWeight: 700,
            }}
          >
            QUEST FORGE
          </div>
          {!isMobile && (
            <>
              <div style={{ width: 1, height: 18, background: 'var(--qf-rule-strong)', margin: '0 8px' }} />
              <div
                className="font-heading"
                style={{
                  fontSize: 13,
                  color: 'var(--qf-parchment-dim)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Game Master
              </div>
            </>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
          {!isMobile && householdName && (
            <div
              className="font-heading"
              style={{ fontSize: 13, color: 'var(--qf-parchment)' }}
            >
              {householdName}
            </div>
          )}
          {isMobile && (
            <div
              className="font-heading"
              style={{
                fontSize: 11,
                color: 'var(--qf-parchment)',
                letterSpacing: '0.04em',
                maxWidth: 90,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </div>
          )}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--qf-gold-500),var(--qf-gold-400))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--qf-bg-void)',
              fontFamily: 'var(--font-heading), Cinzel, serif',
              fontWeight: 700,
              fontSize: 14,
              border: '1px solid var(--qf-gold-300)',
            }}
            title={displayName}
          >
            {initial}
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          position: 'relative',
          zIndex: 4,
        }}
      >
        {/* Overlay backdrop (mobile only) */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => { setSidebarOpen(false); hamburgerRef.current?.focus() }}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 10,
            }}
          />
        )}

        {/* Sidebar */}
        <aside
          id="gm-sidebar"
          ref={sidebarRef}
          role={isMobile ? 'dialog' : undefined}
          aria-modal={isMobile ? true : undefined}
          aria-label={isMobile ? 'Navigation' : undefined}
          style={{
            width: 232,
            background: isMobile ? 'var(--qf-bg-deep)' : 'rgba(10,11,15,0.55)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
            ...(isMobile
              ? {
                  position: 'fixed' as const,
                  top: 64,
                  left: 0,
                  bottom: 0,
                  zIndex: 11,
                  borderRight: '1px solid var(--qf-rule)',
                  transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                  transition: 'transform 0.2s ease',
                  boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
                  visibility: sidebarOpen ? 'visible' : 'hidden',
                }
              : {
                  position: 'relative' as const,
                  borderRight: '1px solid var(--qf-rule)',
                }),
          }}
        >
          <div style={{ padding: '24px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              className="font-pixel"
              style={{
                fontSize: 10,
                color: 'var(--qf-parchment-muted)',
                letterSpacing: '0.18em',
                padding: '0 10px 12px',
              }}
            >
              HEARTHHOLD
            </div>
            {NAV.map((n) => {
              const active = isActive(n.href)
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={closeNav}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    padding: '10px 12px',
                    borderLeft: active
                      ? '2px solid var(--qf-gold-400)'
                      : '2px solid transparent',
                    background: active
                      ? 'linear-gradient(90deg, rgba(232,160,32,0.10), transparent)'
                      : 'transparent',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <div
                    className="font-heading"
                    style={{
                      fontSize: 13,
                      color: active ? 'var(--qf-gold-300)' : 'var(--qf-parchment)',
                      letterSpacing: '0.06em',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {n.label}
                  </div>
                  {n.sub && (
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--qf-parchment-muted)',
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}
                    >
                      {n.sub}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Spacer — shrinks on mobile so boss widget stays reachable */}
          <div style={{ flex: 1, minHeight: isMobile ? 8 : undefined }} />

          {/* Bottom section: boss + identity + sign out */}
          <div style={{ padding: '0 14px 18px', flexShrink: 0 }}>
            {weeklyBoss && (
              <div
                style={{
                  padding: 12,
                  border: '1px solid var(--qf-rule)',
                  background: 'var(--qf-bg-card-alt)',
                  marginBottom: 10,
                }}
              >
                <div
                  className="font-pixel"
                  style={{
                    fontSize: 10,
                    color: 'var(--qf-parchment-muted)',
                    letterSpacing: '0.1em',
                    marginBottom: 6,
                  }}
                >
                  WEEKLY BOSS
                </div>
                <div
                  className="font-heading"
                  style={{
                    fontSize: 12,
                    color: 'var(--qf-gold-300)',
                    marginBottom: 8,
                  }}
                >
                  {weeklyBoss.name}
                </div>
                <HPBar
                  pct={weeklyBoss.hpPct}
                  label="HP"
                  value={`${weeklyBoss.current.toLocaleString()} / ${weeklyBoss.max.toLocaleString()}`}
                />
              </div>
            )}

            {/* Signed-in identity — visible in sidebar on mobile */}
            {isMobile && (
              <div
                style={{
                  padding: '8px 0',
                  marginBottom: 8,
                  borderTop: '1px solid var(--qf-rule)',
                  fontSize: 11,
                  color: 'var(--qf-parchment-muted)',
                  fontFamily: 'var(--font-heading), Cinzel, serif',
                }}
              >
                Signed in as{' '}
                <span style={{ color: 'var(--qf-gold-300)' }}>{displayName}</span>
                {householdName && (
                  <div style={{ fontSize: 10, marginTop: 2, color: 'var(--qf-parchment-muted)', opacity: 0.7 }}>
                    {householdName}
                  </div>
                )}
              </div>
            )}

            <form action={signOut}>
              <button
                type="submit"
                className="qf-btn-ghost"
                style={{ width: '100%', fontSize: 10, padding: '12px 10px' }}
              >
                ⬡ Sign Out
              </button>
            </form>
          </div>
        </aside>

        {/* Content */}
        <main id="main-content" style={{ flex: 1, padding: isMobile ? 16 : 28, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default GMShell
