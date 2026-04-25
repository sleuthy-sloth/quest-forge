'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { playSfx } from '@/lib/audio'

interface Chapter {
  id: string
  title: string
  content: string
  sequence_order: number
  is_unlocked: boolean
}

interface PreviewModalProps {
  chapter: Chapter
  onClose: () => void
}

function PreviewModal({ chapter, onClose }: PreviewModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full border-4 border-[#5a3a1a] bg-[#0e0a14]
            shadow-[6px_6px_0px_0px_rgba(0,0,0,0.7)] p-6 max-h-[80vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center
              font-mono text-[#c9a84c]/50 hover:text-[#c9a84c]
              border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-colors"
            aria-label="Close preview"
          >
            ✕
          </button>

          <span className="font-mono text-[0.45rem] text-[#b09a6e]/40 tracking-widest">
            Ch. {chapter.sequence_order} — Preview
          </span>
          <h2
            className="mt-2 text-[#d4b0ff] text-sm"
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            {chapter.title}
          </h2>
          <div className="w-10 h-px bg-[#c9a84c]/30 my-3" />
          <p
            className="text-[#b0c0e0] text-[0.72rem] leading-relaxed whitespace-pre-line"
            style={{ fontFamily: 'var(--font-body), serif' }}
          >
            {chapter.content}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function StoryDashboard() {
  const supabase = createClient()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const [preview, setPreview] = useState<Chapter | null>(null)

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from('story_chapters')
      .select('id, title, content, sequence_order, is_unlocked')
      .order('sequence_order', { ascending: true })

    if (!error && data) {
      setChapters(data as unknown as Chapter[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchChapters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggleUnlock(id: string, currentlyLocked: boolean) {
    playSfx('click')
    setToggleLoading(id)

    const { error } = await supabase
      .from('story_chapters')
      .update({ is_unlocked: !currentlyLocked })
      .eq('id', id)

    if (!error) {
      setChapters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_unlocked: !currentlyLocked } : c)),
      )
    }
    setToggleLoading(null)
  }

  const unlockedCount = chapters.filter((c) => c.is_unlocked).length
  const lockedCount = chapters.length - unlockedCount

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2
            className="text-[#c9a84c] text-lg"
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            Story Management
          </h2>
          <p className="text-[#b09a6e]/50 font-mono text-[0.55rem] mt-1">
            {chapters.length} chapters &middot; {unlockedCount} unlocked &middot; {lockedCount} locked
          </p>
        </div>
      </div>

      {/* ── Chapter List ─────────────────────────────────────── */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-[#b09a6e]/40 font-mono text-sm">Loading...</p>
        ) : chapters.length === 0 ? (
          <p className="text-[#b09a6e]/40 font-mono text-sm">
            No chapters found. Create one via SQL or the API.
          </p>
        ) : (
          chapters.map((ch) => (
            <div
              key={ch.id}
              className="flex items-stretch gap-0 border-2 bg-[#0e0a14]
                shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]"
              style={{
                borderColor: ch.is_unlocked
                  ? 'rgba(201,168,76,0.35)'
                  : 'rgba(90,50,30,0.35)',
              }}
            >
              {/* Sequence badge */}
              <div
                className="flex items-center justify-center w-10 shrink-0 border-r-2"
                style={{
                  borderRightColor: ch.is_unlocked
                    ? 'rgba(201,168,76,0.25)'
                    : 'rgba(90,50,30,0.25)',
                  background: ch.is_unlocked
                    ? 'rgba(201,168,76,0.04)'
                    : 'rgba(90,50,30,0.04)',
                }}
              >
                <span
                  className={`font-mono text-[0.55rem] font-bold
                    ${ch.is_unlocked ? 'text-[#c9a84c]/60' : 'text-[#5a4a3a]/50'}`}
                >
                  {String(ch.sequence_order).padStart(2, '0')}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full shrink-0
                      ${ch.is_unlocked ? 'bg-[#c9a84c]' : 'bg-[#5a4a3a]/50'}`}
                  />
                  <h4
                    className="text-[0.7rem] text-[#d4b0ff] truncate"
                    style={{ fontFamily: 'var(--font-heading), serif' }}
                  >
                    {ch.title}
                  </h4>
                </div>
                <p className="text-[0.52rem] text-[#b09a6e]/40 mt-1 line-clamp-2">
                  {ch.content?.slice(0, 140) ?? ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 px-2 shrink-0">
                <button
                  onClick={() => setPreview(ch)}
                  className="px-2 py-1 text-[0.4rem] font-mono tracking-wider uppercase
                    border border-[#9b30ff]/30 text-[#9b30ff]/60
                    hover:bg-[#9b30ff]/10 hover:text-[#9b30ff] transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={() => toggleUnlock(ch.id, ch.is_unlocked)}
                  disabled={toggleLoading === ch.id}
                  className={`px-2 py-1 text-[0.4rem] font-mono tracking-wider
                    uppercase border transition-colors
                    ${ch.is_unlocked
                      ? 'border-[#3bc95e]/40 text-[#3bc95e] hover:bg-[#3bc95e]/10'
                      : 'border-[#b09a6e]/30 text-[#b09a6e]/40 hover:bg-[#b09a6e]/5'
                    }`}
                >
                  {toggleLoading === ch.id
                    ? '...'
                    : ch.is_unlocked
                      ? 'Unlocked'
                      : 'Locked'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <PreviewModal chapter={preview} onClose={() => setPreview(null)} />
      )}
    </main>
  )
}
