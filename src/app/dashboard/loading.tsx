'use client'

import { motion } from 'framer-motion'

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#0a0b0f]">
      <div className="relative mb-12">
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-2 border-dashed border-[#c9a84c]/20 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#c9a84c] rounded-full animate-ping" />
        </div>
      </div>
      
      <div className="space-y-6 w-full max-w-md">
        <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded border border-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div className="h-48 bg-white/5 rounded border border-white/5 animate-pulse" />
      </div>

      <p className="mt-8 font-heading text-[0.7rem] text-[#c9a84c]/40 uppercase tracking-[0.2em]">
        Opening the Tome of Mastery...
      </p>
    </div>
  )
}
