'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard',          label: 'Overview',   icon: '⟡' },
  { href: '/dashboard/players',  label: 'Players',    icon: '⚔' },
  { href: '/dashboard/chores',   label: 'Quests',     icon: '📜' },
  { href: '/dashboard/loot',     label: 'Loot Store', icon: '💎' },
  { href: '/dashboard/story',    label: 'Story',      icon: '📖' },
  { href: '/dashboard/settings', label: 'Settings',   icon: '⚙' },
]

interface DashboardShellProps {
  householdName: string
  displayName: string
  children: React.ReactNode
}

export function DashboardShell({ householdName, displayName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <aside
      className="flex flex-col h-full w-56 border-r relative"
      style={{
        background: 'linear-gradient(180deg, #080510 0%, #050810 100%)',
        borderRightColor: 'rgba(180,50,80,0.18)',
      }}
    >
      {/* Crimson floor glow — atmospheric depth at bottom of sidebar */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{ height: 100, background: 'linear-gradient(0deg, rgba(140,20,50,0.07) 0%, transparent 100%)', zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Brand */}
      <div className="px-5 py-5 relative" style={{ borderBottom: '1px solid rgba(201,168,76,0.18)', zIndex: 1 }}>
        <span
          className="block text-[#c9a84c] text-[0.6rem] tracking-widest leading-relaxed"
          style={{ fontFamily: 'var(--font-pixel), monospace', textShadow: '0 0 18px rgba(201,140,40,0.55), 0 0 6px rgba(201,140,40,0.25)' }}
        >
          Quest Forge
        </span>
        <span
          className="block text-[0.65rem] tracking-wider mt-1"
          style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(200,175,130,0.72)' }}
        >
          Game Master Console
        </span>
        {householdName && (
          <span
            className="block text-[0.7rem] mt-2 truncate"
            style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(201,168,76,0.80)' }}
            title={householdName}
          >
            {householdName}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 relative" style={{ zIndex: 1 }} aria-label="Dashboard navigation">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-[3px]
              text-[0.68rem] font-semibold tracking-widest uppercase
              transition-colors duration-150
              ${isActive(item.href)
                ? 'bg-[#c9a84c]/12 border-l-2'
                : 'sidebar-nav-link hover:bg-[#c9a84c]/5'
              }
            `}
            style={isActive(item.href)
              ? { fontFamily: 'var(--font-heading), serif', color: '#c9a84c', textShadow: '0 0 8px rgba(201,140,40,0.35)', borderLeftColor: 'rgba(201,140,40,0.80)' }
              : { fontFamily: 'var(--font-heading), serif', color: 'rgba(200,185,145,0.72)' }
            }
          >
            <span className="text-sm w-4 text-center" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* GM info + logout */}
      <div className="px-3 py-4 space-y-2 relative" style={{ borderTop: '1px solid rgba(180,50,80,0.20)', zIndex: 1 }}>
        <p
          className="px-3 text-[0.65rem] leading-relaxed"
          style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(200,180,140,0.68)' }}
        >
          Signed in as<br />
          <span style={{ color: '#c9a84c', fontSize: '0.7rem' }}>{displayName}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left text-[0.65rem] tracking-wider uppercase
            sidebar-signout hover:bg-[#e05555]/6 rounded-[3px] transition-colors duration-150"
          style={{
            fontFamily: 'var(--font-heading), serif',
            color: 'rgba(230,80,100,1.0)',
            textShadow: '0 0 10px rgba(200,40,70,0.35)',
          }}
        >
          ⬡ Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-[#040812]">
      {/* Desktop sidebar — fixed */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-40 w-56">
        <SidebarContent />
      </div>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10
          flex flex-col items-center justify-center gap-[5px]
          bg-[#040812] border border-[#c9a84c]/25 rounded-[3px]"
        aria-label="Open navigation menu"
      >
        <span className="w-[18px] h-px bg-[#c9a84c]/65 block" />
        <span className="w-[18px] h-px bg-[#c9a84c]/65 block" />
        <span className="w-[18px] h-px bg-[#c9a84c]/65 block" />
      </button>

      {/* Mobile: overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile: slide-in drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-56
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
