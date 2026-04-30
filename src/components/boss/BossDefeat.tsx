'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

// ── Types ──────────────────────────────────────────────────────────────────

export interface BossDefeatData {
  bossName: string
  weekNumber: number
  narrative: string
  totalXpContributed: number
  playerCount: number
}

interface BossDefeatProps {
  data: BossDefeatData
  onClose: () => void
}

// ── Component ──────────────────────────────────────────────────────────────

export default function BossDefeat({ data, onClose }: BossDefeatProps) {
  const [show, setShow] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setShow(true)

    // Auto-focus the dismiss button for keyboard users
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    // ── Confetti celebration ────────────────────────────────────────────
    const duration = 4 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 60 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#c9a84c', '#ff6a00', '#ffcf77', '#ff4500', '#ffd700'],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#c9a84c', '#ff6a00', '#ffcf77', '#ff4500', '#ffd700'],
      })
    }, 200)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // ── Escape key handler ────────────────────────────────────────────────
  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Boss defeated celebration"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            padding: 16,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 560,
              width: '100%',
              padding: '2.5rem',
              background: 'linear-gradient(135deg, #1a1208 0%, #2a1f0d 100%)',
              border: '2px solid #c9a84c',
              borderRadius: 8,
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(201,168,76,0.3), 0 0 120px rgba(201,168,76,0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background glow */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative' }}>
              {/* Victory icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 150, delay: 0.2 }}
              >
                <span style={{ fontSize: '4rem', display: 'block' }}>⚔</span>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontFamily: 'var(--font-heading), serif',
                  fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                  color: '#f9c846',
                  margin: '1rem 0 0.3rem',
                  textShadow: '0 0 20px rgba(249,200,70,0.4)',
                }}
              >
                {data.bossName} Defeated!
              </motion.h2>

              {/* Week */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontFamily: 'var(--font-pixel), monospace',
                  fontSize: '0.55rem',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.2em',
                  marginBottom: '1.5rem',
                }}
              >
                WEEK {data.weekNumber} — VICTORY
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 24,
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#c9a84c', fontWeight: 700 }}>
                    {data.totalXpContributed.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Total XP
                  </div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#c9a84c', fontWeight: 700 }}>
                    {data.playerCount}
                  </div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Emberbearers
                  </div>
                </div>
              </motion.div>

              {/* Narrative */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  borderRadius: 6,
                  padding: '1rem 1.2rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-body), serif',
                  fontSize: '0.85rem',
                  color: 'rgba(200,215,255,0.85)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                }}>
                  {data.narrative}
                </div>
              </motion.div>

              {/* Continue button */}
              <motion.button
                ref={closeButtonRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(201,168,76,0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#c9a84c',
                  color: '#1a1208',
                  border: 'none',
                  borderRadius: 4,
                  fontFamily: 'var(--font-pixel), monospace',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Continue Your Journey
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}