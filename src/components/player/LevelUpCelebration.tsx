'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CelebrationEffect from '@/components/games/CelebrationEffect'
import worldData from '@/lore/world.json'
import classesData from '@/lore/classes.json'
import { playSfx } from '@/lib/audio'

interface LevelUpEvent {
  newLevel: number
  previousLevel: number
}

const MOTIVATIONAL_LINES = [
  "The Emberlight within you burns brighter.",
  "The Hollow felt that.",
  "Hearthhold stands a little safer tonight.",
  "Your legend grows across Embervale.",
  "The flame of courage is unyielding.",
]

export default function LevelUpCelebration({ 
  avatarClass 
}: { 
  avatarClass: string | null 
}) {
  const [active, setActive] = useState(false)
  const [level, setLevel] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)

  useEffect(() => {
    function handleLevelUp(e: any) {
      const { newLevel } = e.detail as LevelUpEvent
      setLevel(newLevel)
      setLineIdx(Math.floor(Math.random() * MOTIVATIONAL_LINES.length))
      setActive(true)
      playSfx('victory')

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setActive(false)
      }, 5000)

      return () => clearTimeout(timer)
    }

    window.addEventListener('player:level-up', handleLevelUp)
    return () => window.removeEventListener('player:level-up', handleLevelUp)
  }, [])

  if (!active) return null

  const cls = (classesData.classes as any[]).find(c => c.id === avatarClass)
  const shardState = (worldData.embershard_states as any[]).find(
    s => level >= s.level_range[0] && level <= s.level_range[1]
  )

  const classIcon = cls?.icon === 'sword' ? '⚔️' :
                    cls?.icon === 'book-open' ? '📖' :
                    cls?.icon === 'eye-off' ? '👤' :
                    cls?.icon === 'flame' ? '🔥' :
                    cls?.icon === 'zap' ? '⚡' :
                    cls?.icon === 'shield' ? '🛡️' : '✨'

  return (
    <div
      onClick={() => setActive(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2,4,12,0.85)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
      }}
    >
      <CelebrationEffect trigger={1} />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        style={{
          width: '100%',
          maxWidth: 320,
          textAlign: 'center',
          padding: '2rem',
          background: 'linear-gradient(160deg, rgba(30,20,60,0.95), rgba(15,10,30,0.95))',
          border: '2px solid #c9a84c',
          borderRadius: 8,
          boxShadow: '0 0 50px rgba(201,168,76,0.3)',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{classIcon}</div>
        
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.8rem',
          color: '#c9a84c',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}>
          Level Up!
        </h3>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: '4rem',
            fontFamily: 'var(--font-heading)',
            color: '#fff',
            textShadow: '0 0 20px rgba(201,168,76,0.5)',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          {level}
        </motion.div>

        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          color: '#f0e6c8',
          marginBottom: '0.25rem',
        }}>
          {cls?.name || 'Emberbearer'}
        </div>

        {shardState && (
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'rgba(201,168,76,0.8)',
            fontStyle: 'italic',
            marginBottom: '1.5rem',
          }}>
            Embershard: {shardState.name}
          </div>
        )}

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'rgba(240,235,220,0.9)',
          lineHeight: 1.5,
          borderTop: '1px solid rgba(201,168,76,0.15)',
          paddingTop: '1rem',
        }}>
          &ldquo;{MOTIVATIONAL_LINES[lineIdx]}&rdquo;
        </div>

        <div style={{
          marginTop: '1.5rem',
          fontSize: '0.6rem',
          fontFamily: 'var(--font-pixel)',
          color: 'rgba(201,168,76,0.4)',
          letterSpacing: '0.1em',
        }}>
          TAP TO CONTINUE
        </div>
      </motion.div>
    </div>
  )
}
