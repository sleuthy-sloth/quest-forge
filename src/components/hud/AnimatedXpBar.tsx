'use client'

import { motion } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'

/** XP needed to reach level N (1-indexed). */
function xpForLevel(level: number): number {
  return (50 * level * (level + 1)) / 2
}

/**
 * Blocky retro XP bar.
 * Animates the fill width over 500ms whenever XP changes.
 */
export default function AnimatedXpBar() {
  const xp = useQuestStore((s) => s.xp)
  const level = useQuestStore((s) => s.level)

  const currentFloor = xpForLevel(level)
  const nextCeiling = xpForLevel(level + 1)
  const range = nextCeiling - currentFloor
  const progress = range > 0 ? (xp - currentFloor) / range : 0
  const pct = Math.min(Math.max(progress * 100, 0), 100)

  return (
    <div className="flex flex-col gap-0.5">
      {/* Label row */}
      <div className="flex justify-between text-[0.5rem] font-mono text-[#b09a6e] px-0.5">
        <span>XP</span>
        <span>
          {xp - currentFloor}&thinsp;/&thinsp;{range}
        </span>
      </div>

      {/* Bar track */}
      <div className="h-4 border-4 border-black bg-[#0a0a14] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <motion.div
          className="h-full bg-[#3bc95e]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
