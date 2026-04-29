'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ChestAnimationProps {
  isOpen: boolean
  onComplete?: () => void
  itemName?: string
}

export function ChestAnimation({ isOpen, onComplete, itemName }: ChestAnimationProps) {
  const [showItem, setShowItem] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowItem(true), 600)
      return () => clearTimeout(timer)
    } else {
      setShowItem(false)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <div className="relative flex flex-col items-center">
            {/* Rays of Light */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: showItem ? 0.6 : 0, 
                scale: showItem ? 2 : 0,
                rotate: 360 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute w-64 h-64 bg-gradient-to-t from-[#c9a84c]/40 to-transparent blur-3xl rounded-full"
              style={{ mixBlendMode: 'screen' }}
            />

            {/* Chest Sprite (Simplified SVG version) */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ 
                y: [20, 0, 20],
                rotate: showItem ? [0, -5, 5, 0] : 0
              }}
              transition={{ 
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 0.2, repeat: 3 }
              }}
              className="relative z-10 w-32 h-32 mb-8"
            >
              <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
                {/* Lower Chest */}
                <rect x="4" y="16" width="24" height="12" fill="#5a3a2a" />
                <rect x="4" y="16" width="24" height="2" fill="#3a2a1a" />
                {/* Gold Bands */}
                <rect x="8" y="16" width="2" height="12" fill="#c9a84c" />
                <rect x="22" y="16" width="2" height="12" fill="#c9a84c" />
                
                {/* Lid */}
                <motion.g
                  animate={{ 
                    rotateX: showItem ? -110 : 0,
                    y: showItem ? -4 : 0
                  }}
                  style={{ transformOrigin: 'bottom' }}
                >
                  <rect x="4" y="8" width="24" height="8" fill="#7a4a3a" />
                  <rect x="14" y="12" width="4" height="4" fill="#c9a84c" />
                </motion.g>
              </svg>
            </motion.div>

            {/* Item Revealed */}
            <AnimatePresence>
              {showItem && (
                <motion.div
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ y: -100, opacity: 1, scale: 1.5 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="absolute z-20 flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <span className="text-3xl">🎁</span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 text-center"
                  >
                    <p className="text-[#b09a6e]/60 text-[0.5rem] uppercase tracking-widest mb-1 font-pixel">
                      You Obtained
                    </p>
                    <h3 className="text-white text-xl font-heading text-shadow-glow">
                      {itemName || 'New Treasure'}
                    </h3>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {showItem && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={onComplete}
                className="mt-12 px-8 py-3 bg-[#c9a84c]/20 border border-[#c9a84c]/50 text-[#c9a84c] text-[0.65rem] font-pixel uppercase tracking-widest hover:bg-[#c9a84c]/30 transition-all"
              >
                Claim Item
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
