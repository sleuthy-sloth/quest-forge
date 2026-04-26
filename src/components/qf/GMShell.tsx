'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { signOut } from '@/app/actions/auth'
import { Embershard } from './Embershard'
import { Embers } from './Embers'
import { HPBar } from './HPBar'

interface GMShellProps {
  children: ReactNode
  householdName: string
  displayName: string
  weeklyBoss?: { name: string; hpPct: number; current: number; max: number } | null
}

const NAV = [
  { href: '/dashboard',              label: 'Hearth',        sub: 'Overview' },
  { href: '/dashboard/approvals',    label: 'Approvals',     sub: 'Pending verdicts' },
  { href: '/dashboard/quests',       label: 'Quests',        sub: 'Quest board' },
  { href: '/dashboard/chores',       label: 'Chores',        sub: 'Recurring tasks' },
  { href: '/dashboard/players',      label: 'Emberbearers',  sub: 'Your kids' },
  { href: '/dashboard/loot',         label: 'Loot Emporium', sub: 'Rewards' },
  { href: '/dashboard/redemptions',  label: 'Vouchers',      sub: 'Redeemed loot' },
  { href: '/dashboard/story',        label: 'Chronicle',     sub: 'Story arc' },
  { href: '/dashboard/settings',     label: 'Settings',      sub: '' },
] as const

export function GMShell({ children, householdName, displayName, weeklyBoss }: GMShellProps) {
  const pathname = usePathname()
  const initial = (displayName || '').trim().charAt(0).toUpperCase() || 'G'

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="qf-shell qf-gm-shell">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Embershard size={22} />
          <div
            className="font-heading"
            style={{
              fontSize: 18,
              color: 'var(--qf-gold-300)',
              letterSpacing: '0.18em',
              fontWeight: 700,
            }}
          >
            QUEST FORGE
          </div>
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
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {householdName && (
            <div
              className="font-heading"
              style={{ fontSize: 13, color: 'var(--qf-parchment)' }}
            >
              {householdName}
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
        {/* Sidebar */}
        <aside
          style={{
            width: 232,
            borderRight: '1px solid var(--qf-rule)',
            padding: '24px 14px',
            background: 'rgba(10,11,15,0.55)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <div
            className="font-pixel"
            style={{
              fontSize: 7,
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
          <div style={{ flex: 1 }} />
          {weeklyBoss && (
            <div
              style={{
                padding: 12,
                border: '1px solid var(--qf-rule)',
                background: 'var(--qf-bg-card-alt)',
                marginTop: 8,
              }}
            >
              <div
                className="font-pixel"
                style={{
                  fontSize: 7,
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
          <form action={signOut} style={{ marginTop: 12 }}>
            <button
              type="submit"
              className="qf-btn-ghost"
              style={{ width: '100%', fontSize: 10, padding: '8px 10px' }}
            >
              ⬡ Sign Out
            </button>
          </form>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: 28, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  )
}

export default GMShell
