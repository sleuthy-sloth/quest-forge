'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FloatingTextProps {
  text: string
  color?: string
  onComplete?: () => void
  x?: number
  y?: number
}

/**
 * A pixel-art style floating text effect for XP, Gold, or Damage.
 * Automatically removes itself after the animation completes.
 */
export function FloatingText({
  text,
  color = '#c9a84c',
  onComplete,
  x = 0,
  y = 0,
}: FloatingTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: y, x: x, scale: 0.8 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: y - 60,
        scale: [0.8, 1.2, 1, 1]
      }}
      transition={{ 
        duration: 1.2, 
        ease: "easeOut",
        times: [0, 0.1, 0.8, 1]
      }}
      onAnimationComplete={onComplete}
      className="absolute pointer-events-none select-none z-[100]"
      style={{
        fontFamily: 'var(--font-pixel, "Press Start 2P", monospace)',
        fontSize: '0.6rem',
        color: color,
        textShadow: '2px 2px 0px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </motion.div>
  )
}

/**
 * A manager component that can be used to handle multiple floating texts.
 */
export function FloatingTextManager() {
  const [items, setItems] = useState<{ id: number; text: string; color?: string; x: number; y: number }[]>([])

  const addText = (text: string, color?: string, x = 0, y = 0) => {
    const id = Date.now() + Math.random()
    setItems(prev => [...prev, { id, text, color, x, y }])
  }

  // Example usage would be via a global event or context
  // For now, this is just a template if needed.
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {items.map(item => (
          <FloatingText
            key={item.id}
            text={item.text}
            color={item.color}
            x={item.x}
            y={item.y}
            onComplete={() => setItems(prev => prev.filter(i => i.id !== item.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
