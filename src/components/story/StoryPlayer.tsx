'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import type { ChapterRow } from '@/store/useQuestStore'

const PER_CHAR = 0.03 // seconds between each character

export default function StoryPlayer() {
  const { chapters, chaptersLoading, fetchStoryData } = useQuestStore()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [typingDone, setTypingDone] = useState(false)

  useEffect(() => {
    fetchStoryData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset typing state when chapter changes
  useEffect(() => {
    setTypingDone(false)
  }, [currentIdx])

  const chapter = chapters[currentIdx]

  if (chaptersLoading) {
    return (
      <div className="p-6 text-center text-[#b09a6e]/40 font-mono text-sm">
        Consulting the chronicles...
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#b09a6e]/40 font-mono text-sm">
          No chapters have been unlocked yet. Ask your Game Master to unlock a chapter.
        </p>
      </div>
    )
  }

  const chars = chapter.content.split('')

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapter.id}
        initial={{ opacity: 0, rotateY: -15, x: -40 }}
        animate={{ opacity: 1, rotateY: 0, x: 0 }}
        exit={{ opacity: 0, rotateY: 15, x: 40 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-xl mx-auto p-4"
        style={{ perspective: 800 }}
      >
        {/* Scroll container */}
        <div
          className="relative border-4 border-[#5a3a1a] bg-[#0e0a14]
            shadow-[6px_6px_0px_0px_rgba(0,0,0,0.7)]
            min-h-[400px]"
        >
          {/* Scroll top bar */}
          <div className="flex items-center justify-between px-4 py-2
            border-b-2 border-[#5a3a1a]/50 bg-[#1a0e04]">
            <span
              className="text-[#c9a84c] text-[0.5rem] tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-pixel), monospace' }}
            >
              Chapter&nbsp;{chapter.sequence_order}
            </span>
            <span className="text-[#b09a6e]/40 text-[0.4rem]">━━</span>
          </div>

          {/* Chapter title */}
          <h2
            className="px-4 pt-4 pb-2 text-[#d4b0ff] text-sm text-center"
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            {chapter.title}
          </h2>

          <div className="w-12 mx-auto h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent mb-3" />

          {/* Typewriter text — character-level stagger */}
          <div className="px-6 pb-6">
            <motion.p
              className="text-[#b0c0e0] text-[0.72rem] leading-relaxed tracking-[0.02em] whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-body), serif' }}
              variants={{ visible: { transition: { staggerChildren: PER_CHAR } } }}
              initial="hidden"
              animate="visible"
              onAnimationComplete={() => setTypingDone(true)}
            >
              {chars.map((ch, i) => (
                <motion.span
                  key={i}
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  transition={{ duration: 0 }}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </motion.span>
              ))}
            </motion.p>

            {/* Blinking cursor */}
            {!typingDone && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-[2px] h-[1em] bg-[#c9a84c] ml-0.5 align-text-bottom"
              />
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 py-2
            border-t-2 border-[#5a3a1a]/50">
            <span className="text-[#b09a6e]/30 text-[0.4rem]">
              {currentIdx + 1}/{chapters.length}
            </span>

            <div className="flex gap-2">
              {typingDone && currentIdx < chapters.length - 1 && (
                <button
                  onClick={() => setCurrentIdx((c) => c + 1)}
                  className="px-3 py-1 text-[0.5rem] font-mono tracking-wider uppercase
                    text-[#c9a84c] border border-[#c9a84c]/40
                    hover:bg-[#c9a84c]/10 active:scale-95 transition-colors"
                >
                  Next Chapter
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
