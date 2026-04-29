'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Embershard } from '@/components/qf/Embershard'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-12 bg-[#1a0e0e] border-2 border-[#e05555]/20 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="text-4xl mb-6">⚠️</div>
          <h1 className="text-3xl font-heading text-white mb-4">A Magical Disturbance</h1>
          <p className="text-[#e05555]/70 font-body mb-10 leading-relaxed">
            A rift has opened in the fabric of Embervale. Our scribes have been notified of this anomaly.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => reset()}
              className="w-full py-4 bg-[#e05555]/10 border border-[#e05555]/40 text-[#e05555] uppercase tracking-[0.2em] text-[0.65rem] font-pixel hover:bg-[#e05555]/20 transition-all active:scale-95"
            >
              Try to Mend the Rift
            </button>
            <Link
              href="/"
              className="inline-block w-full py-4 bg-white/5 border border-white/10 text-white/40 uppercase tracking-[0.2em] text-[0.65rem] font-pixel hover:bg-white/10 transition-all"
            >
              Retreat to Safety
            </Link>
          </div>
        </div>

        {/* Corner flourishes */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#e05555]/30" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#e05555]/30" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#e05555]/30" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#e05555]/30" />
      </motion.div>
    </div>
  )
}
