'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CinematicOverlayProps {
  type: 'victory' | 'defeat'
  onComplete?: () => void
}

/**
 * CinematicOverlay — Dramatic full-screen feedback for quest outcomes.
 * Uses high-fidelity animations to celebrate victory or mourn defeat.
 */
export default function CinematicOverlay({ type, onComplete }: CinematicOverlayProps) {
  const isVictory = type === 'victory'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: isVictory 
            ? 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(0,0,0,0.9) 80%)'
            : 'radial-gradient(circle, rgba(224,85,85,0.2) 0%, rgba(0,0,0,0.95) 80%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Background rays */}
        <motion.div
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 360, scale: 2, opacity: 0.15 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `repeating-conic-gradient(from 0deg, transparent 0deg 10deg, ${isVictory ? '#c9a84c' : '#e05555'} 10deg 20deg)`,
            maskImage: 'radial-gradient(circle, black, transparent 70%)',
          }}
        />

        {/* Text Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          style={{ textAlign: 'center', zIndex: 10 }}
        >
          <motion.h1
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontFamily: 'var(--font-heading), serif',
              fontSize: '5rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: 0,
              color: isVictory ? '#f9c846' : '#e05555',
              textShadow: isVictory 
                ? '0 0 30px rgba(249,200,70,0.5), 0 0 60px rgba(249,200,70,0.2)'
                : '0 0 30px rgba(224,85,85,0.5), 0 0 60px rgba(224,85,85,0.2)',
            }}
          >
            {isVictory ? 'Victory' : 'Defeated'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            style={{
              fontFamily: 'var(--font-pixel), monospace',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.7)',
              marginTop: '1rem',
              letterSpacing: '0.3em',
            }}
          >
            {isVictory ? 'The darkness recedes...' : 'Try again, brave soul.'}
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: isVictory ? '#c9a84c' : '#e05555', color: '#000' }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            style={{
              marginTop: '3rem',
              padding: '1rem 3rem',
              background: 'transparent',
              border: `2px solid ${isVictory ? '#c9a84c' : '#e05555'}`,
              color: isVictory ? '#c9a84c' : '#e05555',
              fontFamily: 'var(--font-pixel), monospace',
              fontSize: '0.8rem',
              cursor: 'pointer',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              transition: 'all 0.2s',
            }}
          >
            {isVictory ? 'Collect Rewards' : 'Return to Camp'}
          </motion.button>
        </motion.div>

        {/* Particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
           {Array.from({ length: 30 }).map((_, i) => (
             <motion.div
               key={i}
               initial={{ 
                 x: Math.random() * window.innerWidth, 
                 y: window.innerHeight + 100,
                 scale: Math.random() * 0.5 + 0.5,
                 opacity: 0 
               }}
               animate={{ 
                 y: -100, 
                 opacity: [0, 1, 0],
                 rotate: 360 
               }}
               transition={{ 
                 duration: Math.random() * 5 + 5, 
                 repeat: Infinity, 
                 delay: Math.random() * 5 
               }}
               style={{
                 position: 'absolute',
                 width: '10px',
                 height: '10px',
                 background: isVictory ? '#f9c846' : '#e05555',
                 borderRadius: i % 2 === 0 ? '50%' : '0%',
                 filter: 'blur(2px)'
               }}
             />
           ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
