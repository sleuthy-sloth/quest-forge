'use client'

import { motion } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'

/**
 * Gold and health counters with retro icons.
 * - Gold coin bounces up on increase (key={gold}).
 * - Heart pulses red when health is below max.
 */
export default function ResourceCounters() {
  const gold = useQuestStore((s) => s.gold)
  const health = useQuestStore((s) => s.health)
  const maxHealth = useQuestStore((s) => s.maxHealth)

  const isDamaged = health < maxHealth

  return (
    <div className="flex items-center justify-between gap-4">
      {/* ── Gold ─────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <motion.span
          key={gold}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: [0, -6, 0], opacity: [1, 1, 1] }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="font-mono text-[0.65rem] text-[#f0c84c] font-bold leading-none
            border-2 border-black px-1.5 py-0.5 bg-[#1a1a0a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          {gold}
        </motion.span>

        {/* Pixel coin → simple Unicode fallback, wrapped in pixel style */}
        <span className="text-[0.7rem]" aria-label="gold">
          <svg width="14" height="14" viewBox="0 0 14 14" className="block" aria-hidden="true">
            <circle cx="7" cy="7" r="6" fill="#f0c84c" stroke="#000" strokeWidth="1.5" />
            <text x="7" y="10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#000">
              G
            </text>
          </svg>
        </span>
      </div>

      {/* ── HP ───────────────────────────── */}
      <motion.div
        className="flex items-center gap-1.5"
        animate={
          isDamaged
            ? {
                scale: [1, 1.04, 1],
                transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
              }
            : { scale: 1 }
        }
      >
        {/* Heart icon */}
        <motion.span
          className="block text-[0.8rem] leading-none select-none"
          aria-label="health"
          animate={
            isDamaged
              ? {
                  color: ['#e04040', '#ff2020', '#e04040'],
                  filter: [
                    'drop-shadow(0 0 2px rgba(220,40,40,0.6))',
                    'drop-shadow(0 0 6px rgba(220,40,40,0.9))',
                    'drop-shadow(0 0 2px rgba(220,40,40,0.6))',
                  ],
                  transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
                }
              : {}
          }
          style={{ color: isDamaged ? '#e04040' : '#60b860' }}
        >
          ♥
        </motion.span>

        {/* HP text */}
        <span
          className={`font-mono text-[0.65rem] font-bold leading-none
            border-2 border-black px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            ${isDamaged ? 'bg-[#2e0a0a] text-[#e06060]' : 'bg-[#0a1a0a] text-[#60b860]'}`}
        >
          {health}&thinsp;/&thinsp;{maxHealth}
        </span>
      </motion.div>
    </div>
  )
}
