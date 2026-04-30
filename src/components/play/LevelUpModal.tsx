'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { playSfx } from '@/lib/audio'

interface LevelUpModalProps {
  level: number
  onClose: () => void
}

/**
 * LevelUpModal — A celebratory overlay triggered upon reaching a new level.
 * Features a dynamic level number "roll", confetti, and a premium "glow" effect.
 */
export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setShow(true)
    playSfx('victory')

    // Auto-focus the dismiss button for keyboard users
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    // Fire confetti burst
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Level up celebration"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{
              width: '400px',
              padding: '3rem',
              background: 'linear-gradient(135deg, #1a1208 0%, #2a1f0d 100%)',
              border: '2px solid #c9a84c',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(201,168,76,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background glow flare */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <span style={{ fontSize: '4rem' }}>🌟</span>
            </motion.div>

            <h2 style={{
              fontFamily: 'var(--font-heading), serif',
              fontSize: '2.5rem',
              color: '#f9c846',
              margin: '1rem 0 0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Level Up!
            </h2>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              margin: '1.5rem 0'
            }}>
              <span style={{ 
                fontFamily: 'var(--font-pixel), monospace', 
                fontSize: '1.2rem', 
                color: 'rgba(255,255,255,0.4)' 
              }}>
                {level - 1}
              </span>
              <motion.span
                initial={{ scale: 2, color: '#fff' }}
                animate={{ scale: 1, color: '#f9c846' }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ 
                  fontFamily: 'var(--font-heading), serif', 
                  fontSize: '3.5rem', 
                  fontWeight: 900 
                }}
              >
                {level}
              </motion.span>
            </div>

            <p style={{
              fontFamily: 'var(--font-body), serif',
              fontSize: '1rem',
              color: 'rgba(200,215,255,0.7)',
              lineHeight: 1.6,
              marginBottom: '2.5rem'
            }}>
              Your prowess grows! New challenges and rewards await in the World Codex.
            </p>

            <motion.button
              ref={closeButtonRef}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(201,168,76,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#c9a84c',
                color: '#1a1208',
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'var(--font-pixel), monospace',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Continue Quest
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
