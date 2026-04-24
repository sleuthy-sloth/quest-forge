'use client'

import { motion } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'

/**
 * Character portrait + level badge.
 * Flashes the border and bounces the portrait on level-up.
 */
export default function AvatarPlate() {
  const level = useQuestStore((s) => s.level)

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      {/* Portrait frame */}
      <motion.div
        key={level}
        initial={false}
        animate={{
          scale: [1, 1.12, 0.95, 1.05, 1],
          borderColor: [
            'rgba(255,255,255,0.6)',
            'rgba(255,200,50,1)',
            'rgba(255,200,50,1)',
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
          ],
        }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="w-14 h-14 border-4 border-black overflow-hidden flex items-center justify-center
          bg-[#1a0e2e]"
      >
        {/* Letterboxed pixel-art hero place-holder */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/avatars/hero.png"
          alt="Hero"
          className="w-full h-full object-contain [image-rendering:pixelated]"
          onError={(e) => {
            // Replace broken image with an inline placeholder
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </motion.div>

      {/* Level badge */}
      <span
        className="px-2 py-px text-[0.55rem] font-mono font-bold leading-tight
          border-2 border-black bg-[#1a1a2e] text-[#c9a84c] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        Lv&nbsp;{level}
      </span>
    </div>
  )
}
