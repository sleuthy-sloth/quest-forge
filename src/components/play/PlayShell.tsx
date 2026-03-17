'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

const TABS = [
  { href: '/play',         label: 'Home',    icon: '⟡' },
  { href: '/play/quests',  label: 'Quests',  icon: '📜' },
  { href: '/play/academy', label: 'Academy', icon: '⚗' },
  { href: '/play/story',   label: 'Story',   icon: '📖' },
  { href: '/play/loot',    label: 'Loot',    icon: '💎' },
  { href: '/play/profile', label: 'Profile', icon: '👤' },
]

interface PlayShellProps {
  displayName: string
  level: number
  children: React.ReactNode
}

export function PlayShell({ displayName, level, children }: PlayShellProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/play') return pathname === '/play'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#040812]">
      {/* Top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14
          bg-[#040812]/95 border-b border-[#c9a84c]/10
          flex items-center justify-between px-4"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <span
          className="text-[#c9a84c] text-[0.5rem] tracking-widest"
          style={{
            fontFamily: 'var(--font-pixel), monospace',
            textShadow: '0 0 12px rgba(201,168,76,0.4)',
          }}
        >
          Quest Forge
        </span>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p
              className="text-[#f0e6c8] text-xs font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-heading), serif' }}
            >
              {displayName}
            </p>
            <p
              className="text-[#c9a84c]/65 text-[0.42rem] leading-tight mt-0.5"
              style={{ fontFamily: 'var(--font-pixel), monospace' }}
            >
              Lv. {level}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-8 h-8 flex items-center justify-center rounded-[3px]
                border border-[#9c5e04]/30 text-[#b09a6e]/50 text-xs
                hover:text-[#e05555] hover:border-[#e05555]/40 transition-colors duration-150"
              aria-label="Sign out"
              title="Sign out"
            >
              ⬡
            </button>
          </form>
        </div>
      </header>

      {/* Scrollable page content */}
      <main className="flex-1 pt-14 pb-16 overflow-y-auto">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16
          bg-[#040812]/95 border-t border-[#c9a84c]/10
          flex items-stretch"
        style={{ backdropFilter: 'blur(8px)' }}
        aria-label="Main navigation"
      >
        {TABS.map(tab => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1
                min-h-[48px] transition-colors duration-150
                ${active
                  ? 'text-[#c9a84c]'
                  : 'text-[#b09a6e]/35 hover:text-[#c9a84c]/65'
                }`}
            >
              {/* Active indicator line at top */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#c9a84c] rounded-full" />
              )}
              <span className="text-base leading-none" aria-hidden="true">
                {tab.icon}
              </span>
              <span
                className="text-[0.48rem] leading-none tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-heading), serif' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
