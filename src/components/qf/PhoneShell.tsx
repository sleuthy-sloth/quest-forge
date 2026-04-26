'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { playBgm } from '@/lib/audio'
import MuteButton from '@/components/ui/MuteButton'
import WalkthroughOverlay from '@/components/play/WalkthroughOverlay'
import { Embershard } from './Embershard'
import { Embers } from './Embers'
import { Coin } from './Coin'

interface PhoneShellProps {
  children: ReactNode
  statusbarTitle?: string
  goldDisplay?: number | null
  avatarClass?: string | null
}

const TABS = [
  { id: 'home',    href: '/play',          label: 'Hearth'  },
  { id: 'quests',  href: '/play/quests',   label: 'Quests'  },
  { id: 'boss',    href: '/play/boss',     label: 'Boss'    },
  { id: 'academy', href: '/play/academy',  label: 'Academy' },
  { id: 'loot',    href: '/play/loot',     label: 'Loot'    },
] as const

function TabIcon({ id, active }: { id: typeof TABS[number]['id']; active: boolean }) {
  const c = active ? 'var(--qf-gold-300)' : 'var(--qf-parchment-muted)'
  const filter = active ? 'drop-shadow(0 0 4px rgba(232,160,32,0.6))' : 'none'
  const common = {
    width: 22,
    height: 22,
    fill: 'none' as const,
    stroke: c,
    strokeWidth: 1.6,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
    style: { filter },
  }

  switch (id) {
    case 'home':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
        </svg>
      )
    case 'quests':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 4h12l2 3v13H5z" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      )
    case 'boss':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill={c} />
        </svg>
      )
    case 'academy':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 8l9-4 9 4-9 4z" />
          <path d="M7 10v6c0 1 2 2 5 2s5-1 5-2v-6" />
        </svg>
      )
    case 'loot':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 8h16v12H4z" />
          <path d="M4 8l2-3h12l2 3M12 8v12" />
        </svg>
      )
  }
}

export function PhoneShell({
  children,
  statusbarTitle = 'Hearthhold',
  goldDisplay,
  avatarClass = null,
}: PhoneShellProps) {
  const pathname = usePathname()

  // Start hub BGM on mount. Stays playing across all /play/* pages.
  // ZoneManager on academy/boss pages will crossfade to other tracks.
  useEffect(() => {
    playBgm('hub')
  }, [])

  function isActive(href: string) {
    if (href === '/play') return pathname === '/play'
    return pathname.startsWith(href)
  }

  return (
    <div className="qf-phone-shell">
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

      <WalkthroughOverlay avatarClass={avatarClass} />
      <div className="qf-ember-bg" aria-hidden="true" />
      <Embers count={8} />

      {/* Sub-header (was status bar in prototype — real device chrome handles 9:41) */}
      <div
        style={{
          padding: '14px 18px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 4,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Embershard size={14} />
          <div
            className="font-heading"
            style={{
              fontSize: 11,
              color: 'var(--qf-gold-300)',
              letterSpacing: '0.18em',
              fontWeight: 700,
            }}
          >
            {statusbarTitle.toUpperCase()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MuteButton size="text-sm" />
          {goldDisplay !== null && goldDisplay !== undefined && (
            <span
              className="font-pixel"
              style={{
                fontSize: 7,
                color: 'var(--qf-gold-200)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Coin size={10} />
              {goldDisplay.toLocaleString()}
            </span>
          )}
          <Link
            href="/play/profile"
            aria-label="Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--qf-parchment-muted)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--qf-gold-300)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--qf-parchment-muted)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" style={{ flex: 1, position: 'relative', zIndex: 3, overflow: 'auto' }}>
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav
        style={{
          height: 78,
          background: 'rgba(10,11,15,0.92)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid var(--qf-rule)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          position: 'relative',
          zIndex: 6,
          flexShrink: 0,
          padding: '8px 4px 22px',
        }}
        aria-label="Player navigation"
      >
        {TABS.map((t) => {
          const active = isActive(t.href)
          return (
            <Link
              key={t.id}
              href={t.href}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                position: 'relative',
                textDecoration: 'none',
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 2,
                    background: 'var(--qf-gold-400)',
                    boxShadow: '0 0 8px var(--qf-gold-400)',
                  }}
                  aria-hidden="true"
                />
              )}
              <TabIcon id={t.id} active={active} />
              <span
                className="font-pixel"
                style={{
                  fontSize: 6,
                  color: active ? 'var(--qf-gold-300)' : 'var(--qf-parchment-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {t.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default PhoneShell
