'use client'

import AvatarPlate from './AvatarPlate'
import AnimatedXpBar from './AnimatedXpBar'
import ResourceCounters from './ResourceCounters'

/**
 * Fixed HUD pinned to the top of the viewport.
 * Wraps avatar plate, XP bar, and resource counters in a blocky retro panel.
 */
export default function PlayerStatusBoard() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-3 pt-[env(safe-area-inset-top,8px)] pb-2
        bg-[#040812]/85 backdrop-blur-[2px]"
    >
      <div
        className="mx-auto max-w-3xl border-4 border-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#0e0a1a]"
      >
        <div className="flex items-center gap-3 px-3 py-2">
          <AvatarPlate />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <AnimatedXpBar />
            <ResourceCounters />
          </div>
        </div>
      </div>
    </header>
  )
}
