'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Chapter {
  id: string
  title: string
  content: string | null
  sequence_order: number | null
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
            Ch. {chapter.sequence_order ?? '?'} — Preview
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
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const [preview, setPreview] = useState<Chapter | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)

  const fetchChapters = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/story/chapters')
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(json.error ?? `HTTP ${res.status}`)
      }
      const json = await res.json() as { chapters: Chapter[] }
      setChapters(json.chapters)
    } catch (err) {
      console.error('[StoryDashboard] fetch failed:', err)
      setFetchError('Could not load chapters. Check your connection and refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChapters()
  }, [fetchChapters])

  async function toggleUnlock(id: string, currentlyUnlocked: boolean) {
    setToggleLoading(id)
    try {
      const res = await fetch('/api/story/chapters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_unlocked: !currentlyUnlocked }),
      })
      if (res.ok) {
        setChapters((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_unlocked: !currentlyUnlocked } : c)),
        )
      }
    } catch {
      // Ignore toggle errors — state stays unchanged
    }
    setToggleLoading(null)
  }

  async function handleSeed() {
    setSeeding(true)
    setSeedError(null)
    try {
      const res = await fetch('/api/admin/seed-story', { method: 'POST' })
      const json = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) {
        setSeedError(json.error ?? 'Seeding failed. Please try again.')
      } else {
        await fetchChapters()
      }
    } catch {
      setSeedError('Network error during seeding. Please try again.')
    }
    setSeeding(false)
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
        ) : fetchError ? (
          <div className="space-y-2">
            <p className="text-red-400/70 font-mono text-sm">{fetchError}</p>
            <button
              onClick={fetchChapters}
              className="px-3 py-1.5 text-[0.45rem] font-mono tracking-wider uppercase
                border border-[#c9a84c]/30 text-[#c9a84c]/60 hover:text-[#c9a84c]
                hover:bg-[#c9a84c]/08 transition-colors"
            >
              ↺ Retry
            </button>
          </div>
        ) : chapters.length === 0 ? (
          <div className="space-y-3">
            <p className="text-[#b09a6e]/40 font-mono text-sm">
              No chapters found. Initialize the story to begin your household&apos;s adventure.
            </p>
            {seedError && (
              <p className="text-red-400/70 font-mono text-[0.6rem]">{seedError}</p>
            )}
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 text-[0.5rem] font-mono tracking-wider uppercase
                border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? 'Initializing…' : '✦ Initialize Story (53 chapters)'}
            </button>
          </div>
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
                  {String(ch.sequence_order ?? '').padStart(2, '0')}
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
