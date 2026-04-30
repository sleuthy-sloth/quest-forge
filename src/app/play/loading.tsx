'use client'

import { Embershard } from '@/components/qf/Embershard'
import { motion } from 'framer-motion'

export default function PlayLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-[#040812]">
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-[#c9a84c] blur-2xl rounded-full"
        />
        <Embershard size={48} level={1} />
      </div>

      <div className="max-w-xs w-full space-y-4">
        <div className="h-4 bg-white/5 rounded-full w-2/3 mx-auto overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent"
          />
        </div>
        <p className="font-pixel text-[0.45rem] text-[#c9a84c]/40 uppercase tracking-widest animate-pulse">
          Consulting the Scribes...
        </p>
      </div>
    </div>
  )
}
