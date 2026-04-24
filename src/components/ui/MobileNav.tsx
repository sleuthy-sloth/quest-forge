'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MuteButton from '@/components/ui/MuteButton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MobileNavItem {
  href: string
  label: string
  icon: string
}

interface MobileNavProps {
  items: MobileNavItem[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Fixed bottom navigation bar visible only on mobile (< md).
 * Designed to replace the desktop sidebar for touch-friendly screens.
 *
 * Usage:
 *   <MobileNav items={[{ href: '/dashboard', label: 'Home', icon: '⟡' }]} />
 */
export default function MobileNav({ items }: MobileNavProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16
        bg-[#040812]/95 border-t border-[#c9a84c]/10
        flex items-stretch"
      style={{ backdropFilter: 'blur(8px)', paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
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
              {item.icon}
            </span>
            <span
              className="text-[0.42rem] leading-none tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-heading), serif' }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}

      {/* Mute toggle */}
      <div className="flex items-center justify-center min-w-[48px]">
        <MuteButton size="text-base" />
      </div>
    </nav>
  )
}
