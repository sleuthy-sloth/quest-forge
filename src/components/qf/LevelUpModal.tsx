'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { EMBERSHARD_LEVELS } from '@/lib/constants'
import { embershardState } from '@/lib/xp'
import { Embershard } from './Embershard'

interface LevelUpModalProps {
  level: number
  isOpen: boolean
  onClose: () => void
  motivationalLine?: string
}

export function LevelUpModal({ level, isOpen, onClose, motivationalLine }: LevelUpModalProps) {
  const shardName = embershardState(level)
  const isEvolution = EMBERSHARD_LEVELS.some(l => l.minLevel === level)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-[#0e0a14] border-2 border-[#c9a84c]/30 p-8 shadow-[0_0_50px_rgba(201,168,76,0.2)] text-center overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#c9a84c]/5 to-transparent pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <h2 
                className="text-[#c9a84c] text-sm uppercase tracking-[0.2em] mb-2 font-pixel"
                style={{ textShadow: '0 0 10px rgba(201,168,76,0.3)' }}
              >
                Level Up!
              </h2>
              <div className="text-5xl font-bold text-white mb-6 font-heading">
                {level}
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 15, 
                stiffness: 200,
                delay: 0.4 
              }}
              className="relative z-10 flex justify-center mb-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3] 
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#c9a84c] blur-2xl rounded-full"
                />
                <Embershard level={level} size={120} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative z-10"
            >
              <p className="text-[#b09a6e]/60 text-[0.6rem] uppercase tracking-widest mb-1 font-pixel">
                Embershard State
              </p>
              <h3 className="text-[#d4b0ff] text-xl mb-6 font-heading tracking-wide">
                {shardName}
              </h3>

              {isEvolution ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#c9a84c]/10 border border-[#c9a84c]/20 p-3 mb-8"
                >
                  <p className="text-[#c9a84c] text-[0.65rem] italic">
                    {motivationalLine || '"Your light grows stronger, Emberbearer. The shadows of the Hollow retreat before you."'}
                  </p>
                </motion.div>
              ) : motivationalLine && (
                <div className="mb-8 px-4 text-[#b09a6e]/70 text-[0.75rem] italic border-t border-[#c9a84c]/10 pt-4">
                  &ldquo;{motivationalLine}&rdquo;
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-4 bg-[#c9a84c]/10 border border-[#c9a84c]/40 text-[#c9a84c] uppercase tracking-[0.2em] text-[0.65rem] font-pixel hover:bg-[#c9a84c]/20 transition-all active:scale-95"
              >
                Continue Journey
              </button>
            </motion.div>

            {/* Corner flourishes */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#c9a84c]/30" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#c9a84c]/30" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#c9a84c]/30" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#c9a84c]/30" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
