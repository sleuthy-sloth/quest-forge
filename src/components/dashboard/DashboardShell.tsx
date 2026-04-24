'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import MobileNav from '@/components/ui/MobileNav'

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
        <form action={signOut}>
          <button
            type="submit"
            className="w-full px-3 py-2 text-center text-[0.65rem] tracking-wider uppercase
              rounded-[3px] transition-all duration-150 cursor-pointer
              hover:bg-[#e05555]/15 active:scale-[0.97]"
            style={{
              fontFamily: 'var(--font-heading), serif',
              color: 'rgba(230,80,100,1.0)',
              textShadow: '0 0 10px rgba(200,40,70,0.35)',
              border: '1px solid rgba(230,80,100,0.45)',
              boxShadow: '0 0 8px rgba(200,40,70,0.15)',
            }}
          >
            ⬡ Sign Out
          </button>
        </form>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-[#040812]">
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
