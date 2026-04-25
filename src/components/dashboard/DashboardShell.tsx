'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import MobileNav from '@/components/ui/MobileNav'
import MuteButton from '@/components/ui/MuteButton'

const NAV = [
  { href: '/dashboard',              label: 'Overview',    icon: '⟡' },
  { href: '/dashboard/players',      label: 'Players',     icon: '⚔' },
  { href: '/dashboard/quests',       label: 'Quests',      icon: '⚔' },
  { href: '/dashboard/chores',       label: 'Chores',      icon: '📜' },
  { href: '/dashboard/loot',         label: 'Loot Store',  icon: '💎' },
  { href: '/dashboard/redemptions',  label: 'Vouchers',    icon: '🎁' },
  { href: '/dashboard/story',        label: 'Story',       icon: '📖' },
  { href: '/dashboard/settings',     label: 'Settings',    icon: '⚙' },
]

interface DashboardShellProps {
  householdName: string
  displayName: string
  children: React.ReactNode
}

export function DashboardShell({ householdName, displayName, children }: DashboardShellProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const mobileNavItems = NAV.map(item => ({ href: item.href, label: item.label, icon: item.icon }))

  const sidebarContent = (
    <aside
      className="flex flex-col h-full w-56 border-r relative"
      style={{
        background: 'linear-gradient(180deg, #ece2c8 0%, #f4ecd8 100%)',
        borderRightColor: 'rgba(140,90,30,0.25)',
      }}
    >
      {/* Warm floor glow — subtle parchment depth at bottom of sidebar */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{ height: 100, background: 'linear-gradient(0deg, rgba(180,130,40,0.10) 0%, transparent 100%)', zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Brand */}
      <div className="px-5 py-5 relative" style={{ borderBottom: '1px solid rgba(140,90,30,0.22)', zIndex: 1 }}>
        <span
          className="block text-[0.6rem] tracking-widest leading-relaxed"
          style={{ fontFamily: 'var(--font-pixel), monospace', color: '#8c5a14', textShadow: '0 0 12px rgba(201,140,40,0.18)' }}
        >
          Quest Forge
        </span>
        <span
          className="block text-[0.65rem] tracking-wider mt-1"
          style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(80,55,20,0.80)' }}
        >
          Game Master Console
        </span>
        {householdName && (
          <span
            className="block text-[0.7rem] mt-2 truncate"
            style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(120,80,20,0.95)' }}
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
              className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-[3px]
              text-[0.68rem] font-semibold tracking-widest uppercase
              transition-colors duration-150
              ${isActive(item.href)
                ? 'bg-[#c9a84c]/20 border-l-2'
                : 'sidebar-nav-link hover:bg-[#c9a84c]/12'
              }
            `}
            style={isActive(item.href)
              ? { fontFamily: 'var(--font-heading), serif', color: '#8c5a14', textShadow: '0 0 6px rgba(201,140,40,0.25)', borderLeftColor: 'rgba(140,90,30,0.85)' }
              : { fontFamily: 'var(--font-heading), serif', color: 'rgba(80,55,20,0.85)' }
            }
          >
            <span className="text-sm w-4 text-center" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* GM info + logout */}
      <div className="px-3 py-4 space-y-2 relative" style={{ borderTop: '1px solid rgba(140,90,30,0.22)', zIndex: 1 }}>
        <div className="flex items-center justify-between px-3">
          <p
            className="text-[0.65rem] leading-relaxed"
            style={{ fontFamily: 'var(--font-heading), serif', color: 'rgba(80,55,20,0.78)' }}
          >
            Signed in as<br />
            <span style={{ color: '#8c5a14', fontSize: '0.7rem' }}>{displayName}</span>
          </p>
          <MuteButton size="text-base" />
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full px-3 py-2 text-center text-[0.65rem] tracking-wider uppercase
              rounded-[3px] transition-all duration-150 cursor-pointer
              hover:bg-[#c44545]/12 active:scale-[0.97]"
            style={{
              fontFamily: 'var(--font-heading), serif',
              color: 'rgba(170,50,60,1.0)',
              border: '1px solid rgba(170,50,60,0.45)',
              background: 'rgba(170,50,60,0.04)',
            }}
          >
            ⬡ Sign Out
          </button>
        </form>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-[var(--bg-void)]">
      {/* Desktop sidebar — fixed left */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-40 w-56">
        {sidebarContent}
      </div>

      {/* Main content — pushes above the mobile nav bar */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen pb-16 md:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav — replaces sidebar on small screens */}
      <MobileNav items={mobileNavItems} />
    </div>
  )
}
