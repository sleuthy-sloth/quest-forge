'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface StoryBeat {
  id: string
  title: string
  text: string
  image?: string
  isMilestone?: boolean
}

interface EpicScrollProps {
  beats: StoryBeat[]
  progress: number // 0 to 100 representing total chapter progress
}

/**
 * EpicScroll — A high-fidelity vertical narrative component.
 * Features parallax backgrounds, floating particles, and progressive text reveals.
 */
export default function EpicScroll({ beats, progress }: EpicScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothScrollY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        minHeight: `${beats.length * 80}vh`, 
        background: '#040812',
        overflow: 'hidden'
      }}
    >
      {/* Background Parallax Layer */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #0a1025 0%, #040812 100%)',
          zIndex: 0,
          y: useTransform(smoothScrollY, [0, 1], [0, -100])
        }}
      >
        {/* Floating Embers */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 2,
              height: 2,
              background: '#c9a84c',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px #c9a84c'
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </motion.div>

      {/* Chapter Progress Bar (Floating) */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '4px',
        height: '200px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '2px',
        zIndex: 100
      }}>
        <motion.div
          style={{
            width: '100%',
            background: '#c9a84c',
            borderRadius: '2px',
            height: `${progress}%`,
            boxShadow: '0 0 10px #c9a84c'
          }}
        />
      </div>

      {/* Narrative Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {beats.map((beat, i) => (
          <StorySection key={beat.id} beat={beat} index={i} />
        ))}
      </div>

      {/* Ending "Boss Gate" Trigger */}
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '2rem' }}>Chapter Finale</h2>
          <p style={{ color: '#c9a84c', fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            CONQUER THE HOLLOW TO ADVANCE
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function StorySection({ beat, index }: { beat: StoryBeat; index: number }) {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2rem',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        viewport={{ amount: 0.5 }}
      >
        {beat.isMilestone && (
          <div style={{ 
            fontFamily: 'var(--font-pixel)', 
            fontSize: '0.6rem', 
            color: '#c9a84c', 
            letterSpacing: '0.2em',
            marginBottom: '1rem' 
          }}>
            ✧ MILESTONE ACHIEVED ✧
          </div>
        )}
        
        <h2 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '2.5rem', 
          color: '#fff', 
          marginBottom: '1.5rem',
          textShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}>
          {beat.title}
        </h2>

        <p style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: '1.1rem', 
          color: '#c0b08a', 
          lineHeight: 1.8,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {beat.text}
        </p>
      </motion.div>
    </div>
  )
}
