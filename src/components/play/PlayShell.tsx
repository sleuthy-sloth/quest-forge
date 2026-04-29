'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { playBgm } from '@/lib/audio'
import WalkthroughOverlay from '@/components/play/WalkthroughOverlay'
import { Embershard } from '@/components/qf/Embershard'
import { Embers } from '@/components/qf/Embers'
import { Coin } from '@/components/qf/Coin'
import { useNotifications } from '@/hooks/useNotifications'

const NAV_ITEMS = [
  { href: '/play',         label: 'Home',    icon: '/images/ui/icons/icon_hearthhold.png', sub: 'Hearthhold Center' },
  { href: '/play/quests',  label: 'Quests',  icon: '/images/ui/icons/icon_class.png', sub: 'Daily Deeds' },
  { href: '/play/academy', label: 'Academy', icon: '/images/ui/icons/icon_embershard.png', sub: 'Educational Duels' },
  { href: '/play/story',   label: 'Story',   icon: '/images/ui/icons/icon_regions.png', sub: 'Chronicle Hall' },
  { href: '/play/world',   label: 'World',   icon: '/images/ui/icons/icon_world.png', sub: 'Embervale Guide' },
  { href: '/play/loot',    label: 'Loot',    icon: '/images/ui/icons/icon_embershard.png', sub: 'The Emporium' },
  { href: '/play/profile', label: 'Profile', icon: '/images/ui/icons/icon_characters.png', sub: 'Your Progress' },
]

interface PlayShellProps {
  displayName: string
  level: number
  gold: number
  avatarClass: string | null
  userId: string
  householdId: string
  role: 'gm' | 'player'
  children: React.ReactNode
}

export function PlayShell({ 
  displayName, 
  level, 
  gold,
  avatarClass, 
  userId,
  householdId,
  role,
  children 
}: PlayShellProps) {
  const pathname = usePathname()
  const bgmStarted = useRef(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  // Realtime notification listener
  useNotifications(userId, householdId, role)

  // Start hub BGM on first mount
  useEffect(() => {
    if (bgmStarted.current) return
    bgmStarted.current = true
    playBgm('hub')
  }, [])

  // Focus management and Esc key for sidebar
  useEffect(() => {
    if (!sidebarOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        hamburgerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  function isActive(href: string) {
    if (href === '/play') return pathname === '/play'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#040812] relative overflow-hidden">
      <WalkthroughOverlay avatarClass={avatarClass} />
      
      {/* Dynamic Background */}
      <div className="qf-ember-bg pointer-events-none" aria-hidden="true">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.18, zIndex: -1 }}>
          <img
            src="/images/backgrounds/dashboard.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Golden morning glow */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, rgba(201,168,76,0.15) 0%, transparent 70%)' }} />
          {/* Bottom vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #040812 0%, transparent 40%)' }} />
        </div>
      </div>
      <Embers count={6} />

      {/* Top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-[60] h-14
          bg-[#040812]/95 border-b border-[#c9a84c]/10
          flex items-center justify-between px-4"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-3">
          <button
            ref={hamburgerRef}
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full
              text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors duration-150"
            aria-label="Open Navigation"
            aria-expanded={sidebarOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <Embershard size={16} />
            <span
              className="text-[#c9a84c] text-[0.68rem] tracking-[0.2em] uppercase hidden sm:block"
              style={{
                fontFamily: 'var(--font-pixel), monospace',
                textShadow: '0 0 12px rgba(201,168,76,0.4)',
              }}
            >
              Quest Forge
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Gold Display */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-full">
            <Coin size={12} />
            <span className="font-pixel text-[0.68rem] text-[#c9a84c] tracking-widest">
              {gold.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <p
              className="text-[#f0e6c8] text-xs font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-heading), serif' }}
            >
              {displayName}
            </p>
            <p
              className="text-[#c9a84c]/65 text-[0.65rem] leading-tight mt-0.5"
              style={{ fontFamily: 'var(--font-pixel), monospace' }}
            >
              Lv. {level}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full border border-[#c9a84c]/20 bg-[#c9a84c]/5 flex items-center justify-center text-[#c9a84c] text-xs font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Side Navigation Drawer */}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Player Navigation"
        className={`fixed top-0 left-0 bottom-0 z-[80] w-[260px] bg-[#080c14] border-r border-[#c9a84c]/20
          transform transition-transform duration-300 ease-out shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#c9a84c]/10">
            <div className="flex items-center gap-3 mb-4">
              <Embershard size={24} />
              <div className="font-heading text-lg text-[#c9a84c] tracking-widest uppercase">
                Menu
              </div>
            </div>
            <p className="text-[0.65rem] font-pixel text-[#b09a6e]/50 uppercase tracking-widest">
              Journey of {displayName}
            </p>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-150
                    ${active 
                      ? 'bg-[#c9a84c]/10 border border-[#c9a84c]/20' 
                      : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <span className="text-xl shrink-0" aria-hidden="true">
                    <img src={item.icon} alt="" className="w-8 h-8 object-contain" />
                  </span>
                  <div>
                    <div className={`text-sm font-heading tracking-wide
                      ${active ? 'text-[#c9a84c]' : 'text-[#f0e6c8]'}`}>
                      {item.label}
                    </div>
                    <div className="text-[0.75rem] text-[#b09a6e]/50 italic">
                      {item.sub}
                    </div>
                  </div>
                  {active && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-[#c9a84c]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#c9a84c]/10 space-y-3">
            <div className="px-4 py-2 bg-[#1a0e04] border border-[#5a3a1a]/30 rounded text-center">
              <span className="text-[0.65rem] font-pixel text-[#c9a84c]/60 uppercase tracking-widest">
                Emberbearer Lv. {level}
              </span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3
                  text-[0.65rem] font-pixel text-[#b09a6e]/50 hover:text-[#e05555]
                  transition-colors uppercase tracking-widest"
              >
                <span>⬡</span> Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pt-14 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
