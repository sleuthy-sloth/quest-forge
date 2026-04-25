'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useQuestStore } from '@/store/useQuestStore'
import { playSfx } from '@/lib/audio'

interface BossFightProps {
  questId: string
  bossSprite: string
  bossMaxHealth: number
  bossCurrentHealth: number
  householdId: string
  onDefeated?: () => void
}

const SPRITE_MAP: Record<string, { emoji: string; label: string }> = {
  demon:  { emoji: '👹', label: 'Demon Lord' },
  dragon: { emoji: '🐉', label: 'Ancient Dragon' },
  slime:  { emoji: '🟢', label: 'King Slime' },
}

const SHAKE = {
  x: [0, -6, 6, -4, 4, -2, 2, 0],
  transition: { duration: 0.4 },
}

function hpColor(pct: number) {
  if (pct > 60) return '#2eb85c'
  if (pct > 30) return '#e8a020'
  return '#e84040'
}

export default function BossFight({
  questId,
  bossSprite,
  bossMaxHealth,
  bossCurrentHealth,
  householdId,
  onDefeated,
}: BossFightProps) {
  const [health, setHealth] = useState(bossCurrentHealth)
  const [shaking, setShaking] = useState(false)
  const [dead, setDead] = useState(false)
  const [flash, setFlash] = useState(false)

  const sprite = SPRITE_MAP[bossSprite] ?? SPRITE_MAP.slime

  const attackBoss = useCallback(async () => {
    if (dead || health <= 0) return

    const damage = Math.floor(Math.random() * 15) + 5
    const newHealth = Math.max(0, health - damage)

    setShaking(true)
    setFlash(true)
    playSfx('attack')

    const supabase = createClient()
    await supabase.from('quests').update({
      boss_current_health: newHealth,
    }).eq('id', questId).eq('household_id', householdId)

    setTimeout(() => {
      setShaking(false)
      setFlash(false)
      setHealth(newHealth)

      if (newHealth <= 0) {
        setDead(true)
        playSfx('victory')
        onDefeated?.()
      }
    }, 400)

    // Overdue mechanic: takeDamage to player
    const { data: quest } = await supabase
      .from('quests')
      .select('created_at')
      .eq('id', questId)
      .single()

    if (quest) {
      const ageHours = (Date.now() - new Date(quest.created_at).getTime()) / 3600000
      if (ageHours > 48) {
        useQuestStore.getState().takeDamage(5)
      }
    }
  }, [health, dead, questId, householdId, onDefeated])

  const pct = bossMaxHealth > 0 ? (health / bossMaxHealth) * 100 : 0

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Sprite */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {dead ? (
            <motion.div
              key="death"
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              animate={{ opacity: 0, scale: 0.3, rotate: 90, y: 60 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeIn' }}
              className="text-8xl [image-rendering:pixelated] select-none"
            >
              💀
            </motion.div>
          ) : (
            <motion.button
              key="alive"
              animate={shaking ? SHAKE : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={attackBoss}
              className={`relative text-8xl [image-rendering:pixelated] select-none cursor-pointer
                transition-shadow duration-150
                ${flash ? 'brightness-200' : ''}`}
              style={{
                filter: flash ? 'brightness(2) saturate(3)' : undefined,
                imageRendering: 'pixelated',
              }}
              aria-label={`Attack ${sprite.label}`}
            >
              <motion.span
                animate={flash ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {sprite.emoji}
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Boss name */}
      <h3 className="text-[#c9a84c] text-lg font-heading tracking-wider">
        {sprite.label}
      </h3>

      {/* Health bar */}
      {!dead && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between mb-1">
            <span className="text-[0.55rem] font-pixel text-[#b09a6e]/60" style={{ imageRendering: 'pixelated' }}>
              HP
            </span>
            <span className="text-[0.55rem] font-pixel text-[#b09a6e]/80" style={{ imageRendering: 'pixelated' }}>
              {health} / {bossMaxHealth}
            </span>
          </div>
          <motion.div
            className="h-4 border border-[#5a3a1a]/60 rounded-sm overflow-hidden bg-[#0a0614]"
            animate={shaking ? { x: [0, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-full rounded-sm"
              style={{
                background: `linear-gradient(90deg, ${hpColor(pct)}, ${pct > 60 ? '#46d070' : pct > 30 ? '#f0b830' : '#f05050'})`,
                boxShadow: `0 0 8px ${hpColor(pct)}`,
              }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </motion.div>
          <motion.div
            className="h-1 mt-1 rounded-sm"
            style={{
              background: `repeating-linear-gradient(90deg, ${hpColor(pct)}33 0px, ${hpColor(pct)}33 8px, transparent 8px, transparent 10px)`,
            }}
            animate={{ opacity: shaking ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Defeated message */}
      {dead && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#2eb85c] font-heading text-sm tracking-wider"
        >
          ✦ Boss Defeated! ✦
        </motion.p>
      )}

      {/* Attack hint */}
      {!dead && (
        <p className="text-[0.55rem] font-pixel text-[#b09a6e]/40" style={{ imageRendering: 'pixelated' }}>
          Click the sprite to attack!
        </p>
      )}
    </div>
  )
}
