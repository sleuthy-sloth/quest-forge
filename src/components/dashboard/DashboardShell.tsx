'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <aside className="flex flex-col h-full w-56 bg-[#040812] border-r border-[#c9a84c]/10">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#c9a84c]/10">
        <span
          className="block text-[#c9a84c] text-[0.6rem] tracking-widest leading-relaxed"
          style={{ fontFamily: 'var(--font-pixel), monospace', textShadow: '0 0 16px rgba(201,168,76,0.3)' }}
        >
          Quest Forge
        </span>
        <span
          className="block text-[#b09a6e]/45 text-[0.65rem] tracking-wider mt-1"
          style={{ fontFamily: 'var(--font-heading), serif' }}
        >
          Game Master Console
        </span>
        {householdName && (
          <span
            className="block text-[#c9a84c]/50 text-[0.7rem] mt-2 truncate"
            style={{ fontFamily: 'var(--font-heading), serif' }}
            title={householdName}
          >
            {householdName}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3" aria-label="Dashboard navigation">
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
                ? 'text-[#c9a84c] bg-[#c9a84c]/8'
                : 'text-[#b09a6e]/40 hover:text-[#c9a84c]/75 hover:bg-[#c9a84c]/5'
              }
            `}
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            <span className="text-sm w-4 text-center" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* GM info + logout */}
      <div className="px-3 py-4 border-t border-[#c9a84c]/10 space-y-2">
        <p
          className="px-3 text-[0.65rem] text-[#b09a6e]/35 leading-relaxed"
          style={{ fontFamily: 'var(--font-heading), serif' }}
        >
          Signed in as<br />
          <span className="text-[#c9a84c]/55">{displayName}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left text-[0.65rem] tracking-wider uppercase
            text-[#e05555]/50 hover:text-[#e05555] hover:bg-[#e05555]/6
            rounded-[3px] transition-colors duration-150"
          style={{ fontFamily: 'var(--font-heading), serif' }}
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
