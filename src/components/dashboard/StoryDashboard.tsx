'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import bossesRaw from '@/lore/bosses.json'

interface Chapter {
  id: string
  title: string
  content: string | null
  sequence_order: number | null
  is_unlocked: boolean
}

interface Arc {
  arc_number: number
  name: string
  region: string
  summary: string
  weeks: [number, number]
}

const ARCS = bossesRaw.arcs as unknown as Arc[]

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
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-2xl w-full border-2 border-[#c9a84c]/30 bg-[#0e0a14]
            shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Parchment-style header */}
          <div className="h-2 bg-gradient-to-r from-[#c9a84c]/0 via-[#c9a84c]/40 to-[#c9a84c]/0" />
          
          <div className="p-8 overflow-y-auto custom-scrollbar">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center
                rounded-full bg-black/40 text-[#c9a84c]/60 hover:text-[#c9a84c]
                border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all active:scale-90"
              aria-label="Close preview"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <span className="font-mono text-[0.65rem] text-[#c9a84c]/50 tracking-[0.2em] uppercase mb-2">
                Chapter {chapter.sequence_order ?? '?'} &mdash; Manuscript
              </span>
              <h2
                className="text-[#d4b0ff] text-2xl md:text-3xl leading-tight max-w-md"
                style={{ fontFamily: 'var(--font-heading), serif', textShadow: '0 2px 10px rgba(212,176,255,0.2)' }}
              >
                {chapter.title}
              </h2>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent mt-4" />
            </div>

            <div className="relative">
              {/* Corner flourishes */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-[#c9a84c]/20" />
              <div className="absolute -top-4 -right-4 w-8 h-8 border-t border-r border-[#c9a84c]/20" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b border-l border-[#c9a84c]/20" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-[#c9a84c]/20" />

              <p
                className="text-[#b0c0e0] text-base md:text-lg leading-relaxed whitespace-pre-line px-2"
                style={{ fontFamily: 'var(--font-body), serif' }}
              >
                {chapter.content}
              </p>
            </div>
          </div>

          <div className="p-4 bg-black/40 border-t border-[#c9a84c]/10 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] 
                font-mono text-xs uppercase tracking-widest hover:bg-[#c9a84c]/20 transition-all"
            >
              Close Manuscript
            </button>
          </div>
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
  const [expandedArc, setExpandedArc] = useState<number | 'prologue' | null>(1)

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

  const groupedChapters = useMemo(() => {
    const groups: Record<string | number, Chapter[]> = { prologue: [] }
    ARCS.forEach(arc => { groups[arc.arc_number] = [] })

    chapters.forEach(ch => {
      if (ch.sequence_order === 0) {
        groups.prologue.push(ch)
      } else {
        const arc = ARCS.find(a => ch.sequence_order! >= a.weeks[0] && ch.sequence_order! <= a.weeks[1])
        if (arc) {
          groups[arc.arc_number].push(ch)
        }
      }
    })
    return groups
  }, [chapters])

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 pb-20">
      {/* ── Banner & Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden border-2 border-[#c9a84c]/20 bg-[#0e0a14] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/5 blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">📖</span>
              <h2
                className="text-[#c9a84c] text-3xl md:text-4xl"
                style={{ fontFamily: 'var(--font-heading), serif', textShadow: '0 0 20px rgba(201,168,76,0.2)' }}
              >
                Story Management
              </h2>
            </div>
            <p className="text-[#b09a6e]/70 font-mono text-xs max-w-lg leading-relaxed">
              As the Game Master, you control the threads of destiny. Unlock chapters as your players progress through the year to reveal the evolving narrative in their Chronicle Hall.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end justify-center bg-black/40 border border-[#c9a84c]/20 p-4 rounded-sm min-w-[180px]">
             <span className="text-[0.6rem] font-mono text-[#b09a6e]/40 uppercase tracking-[0.2em] mb-1">Campaign Status</span>
             <div className="flex items-baseline gap-2">
               <span className="text-2xl text-[#c9a84c] font-bold">{unlockedCount}</span>
               <span className="text-xs text-[#b09a6e]/40 uppercase font-mono">/ {chapters.length} Unlocked</span>
             </div>
             <div className="w-full bg-[#1a1520] h-1 mt-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / chapters.length) * 100}%` }}
                  className="h-full bg-[#c9a84c]"
                />
             </div>
          </div>
        </div>
      </div>

      {/* ── Content Area ─────────────────────────────────────── */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-2 border-[#c9a84c]/20 border-t-[#c9a84c] rounded-full animate-spin" />
            <p className="text-[#b09a6e]/40 font-mono text-sm tracking-widest uppercase animate-pulse">Consulting the Scrolls...</p>
          </div>
        ) : fetchError ? (
          <div className="border border-red-900/30 bg-red-950/10 p-8 text-center space-y-4">
            <p className="text-red-400 font-mono text-sm">{fetchError}</p>
            <button
              onClick={fetchChapters}
              className="px-6 py-3 text-xs font-mono tracking-widest uppercase
                border-2 border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10
                transition-all active:scale-95"
            >
              ↺ Retry Connection
            </button>
          </div>
        ) : chapters.length === 0 ? (
          <div className="border-2 border-dashed border-[#c9a84c]/20 bg-black/20 p-12 text-center space-y-6">
            <div className="text-5xl opacity-20">📜</div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-[#c9a84c] text-xl font-heading">The Ledger is Empty</h3>
              <p className="text-[#b09a6e]/60 font-mono text-xs">
                No chapters found. Initialize the core narrative to begin your household&apos;s adventure.
              </p>
            </div>
            {seedError && (
              <p className="text-red-400 font-mono text-[0.7rem] bg-red-950/20 py-2 px-4 rounded">{seedError}</p>
            )}
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-8 py-4 text-xs font-mono tracking-[0.2em] uppercase
                border-2 border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                shadow-[0_0_20px_rgba(201,168,76,0.1)] hover:shadow-[0_0_30px_rgba(201,168,76,0.2)]"
            >
              {seeding ? '✦ Writing the First Words...' : '✦ Initialize 53-Week Saga'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Prologue Section ─────────────────────────────────────── */}
            {groupedChapters.prologue.length > 0 && (
              <section className="space-y-4">
                <div 
                  className="flex items-center gap-4 py-2 border-b border-[#c9a84c]/20 cursor-pointer group"
                  onClick={() => setExpandedArc(expandedArc === 'prologue' ? null : 'prologue')}
                >
                  <span className={`text-sm transition-transform duration-300 ${expandedArc === 'prologue' ? 'rotate-90' : ''}`}>▶</span>
                  <h3 className="text-[#c9a84c] text-xl font-heading group-hover:text-[#e0c060] transition-colors">The Beginning</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#c9a84c]/20 to-transparent" />
                </div>
                
                <AnimatePresence>
                  {expandedArc === 'prologue' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-4 pt-2 pb-6">
                        {groupedChapters.prologue.map(ch => (
                          <ChapterCard 
                            key={ch.id} 
                            ch={ch} 
                            toggleLoading={toggleLoading} 
                            toggleUnlock={toggleUnlock} 
                            setPreview={setPreview} 
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}

            {/* ── Arcs Section ─────────────────────────────────────── */}
            {ARCS.map(arc => (
              <section key={arc.arc_number} className="space-y-4">
                <div 
                  className="flex items-center gap-4 py-2 border-b border-[#c9a84c]/20 cursor-pointer group"
                  onClick={() => setExpandedArc(expandedArc === arc.arc_number ? null : arc.arc_number)}
                >
                  <span className={`text-sm transition-transform duration-300 ${expandedArc === arc.arc_number ? 'rotate-90' : ''}`}>▶</span>
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                    <h3 className="text-[#c9a84c] text-xl font-heading group-hover:text-[#e0c060] transition-colors whitespace-nowrap">
                      Arc {arc.arc_number}: {arc.name}
                    </h3>
                    <span className="text-[0.65rem] font-mono text-[#b09a6e]/40 uppercase tracking-widest">
                      {arc.region} &bull; Weeks {arc.weeks[0]}-{arc.weeks[1]}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#c9a84c]/20 to-transparent" />
                </div>

                <AnimatePresence>
                  {expandedArc === arc.arc_number && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pb-6 space-y-6">
                        <p className="text-[#b09a6e]/60 text-xs italic pl-8 border-l-2 border-[#c9a84c]/10">
                          &ldquo;{arc.summary}&rdquo;
                        </p>
                        <div className="grid gap-4">
                          {groupedChapters[arc.arc_number]?.map(ch => (
                            <ChapterCard 
                              key={ch.id} 
                              ch={ch} 
                              toggleLoading={toggleLoading} 
                              toggleUnlock={toggleUnlock} 
                              setPreview={setPreview} 
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <PreviewModal chapter={preview} onClose={() => setPreview(null)} />
      )}
    </main>
  )
}

function ChapterCard({
  ch,
  toggleLoading,
  toggleUnlock,
  setPreview
}: {
  ch: Chapter,
  toggleLoading: string | null,
  toggleUnlock: (id: string, current: boolean) => void,
  setPreview: (ch: Chapter) => void
}) {
  const [regenerating, setRegenerating] = useState<string | null>(null)
  return (
    <div
      className={`flex flex-col md:flex-row items-stretch gap-0 border-2 bg-[#0e0a14] transition-all duration-300
        ${ch.is_unlocked 
          ? 'border-[#c9a84c]/30 shadow-[4px_4px_0px_0px_rgba(201,168,76,0.15)] bg-[#120e18]' 
          : 'border-[#5a4a3a]/20 opacity-80 hover:opacity-100'}`}
    >
      {/* Sequence badge */}
      <div
        className={`flex items-center justify-center w-14 shrink-0 border-b md:border-b-0 md:border-r-2 py-4 md:py-0
          ${ch.is_unlocked 
            ? 'border-[#c9a84c]/20 bg-[#c9a84c]/5' 
            : 'border-[#5a4a3a]/10 bg-[#5a4a3a]/5'}`}
      >
        <span
          className={`font-mono text-lg font-bold
            ${ch.is_unlocked ? 'text-[#c9a84c]' : 'text-[#5a4a3a]'}`}
        >
          {String(ch.sequence_order ?? '').padStart(2, '0')}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-5 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors
            ${ch.is_unlocked ? 'bg-[#c9a84c] shadow-[#c9a84c]/40' : 'bg-[#3a2a1a]'}`} 
          />
          <h4
            className={`text-base md:text-lg transition-colors
              ${ch.is_unlocked ? 'text-[#d4b0ff]' : 'text-[#b09a6e]/40'}`}
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            {ch.title}
          </h4>
        </div>
        <p className={`text-xs md:text-sm line-clamp-1 transition-colors
          ${ch.is_unlocked ? 'text-[#b09a6e]/70' : 'text-[#b09a6e]/20'}`}>
          {ch.content?.slice(0, 100) ?? 'No content available...'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-4 md:px-6 shrink-0 border-t md:border-t-0 md:border-l border-[#c9a84c]/10 bg-black/20">
        <button
          onClick={() => setPreview(ch)}
          className="flex-1 md:flex-none px-6 h-12 text-[0.7rem] font-mono tracking-[0.15em] uppercase
            border border-[#9b30ff]/40 text-[#9b30ff]/80 font-bold
            hover:bg-[#9b30ff]/10 hover:text-[#9b30ff] hover:border-[#9b30ff] transition-all active:scale-95"
        >
          Preview
        </button>
        <button
          onClick={() => toggleUnlock(ch.id, ch.is_unlocked)}
          disabled={toggleLoading === ch.id}
          className={`flex-1 md:flex-none px-6 h-12 text-[0.7rem] font-mono tracking-[0.15em] font-bold
            uppercase border transition-all active:scale-95 flex items-center justify-center min-w-[120px]
            ${ch.is_unlocked
              ? 'border-[#3bc95e]/60 text-[#3bc95e] hover:bg-[#3bc95e]/10'
              : 'border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/15'
            } disabled:opacity-50`}
        >
          {toggleLoading === ch.id ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : ch.is_unlocked ? (
            '✓ Unlocked'
          ) : (
            '✦ Unlock'
          )}
        </button>
        <button
          onClick={async () => {
            setRegenerating(ch.id)
            try {
              const res = await fetch('/api/story/generate-opening', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapterId: ch.id }),
              })
              const data = await res.json()
              if (data.narrative) {
                window.location.reload()
              }
            } catch {
              // silent fail
            } finally {
              setRegenerating(null)
            }
          }}
          disabled={regenerating === ch.id || !ch.is_unlocked}
          className="flex-1 md:flex-none px-4 h-12 text-[0.7rem] font-mono tracking-[0.15em] uppercase
            border border-[#d4b0ff]/30 text-[#d4b0ff]/70 hover:bg-[#d4b0ff]/10
            hover:text-[#d4b0ff] hover:border-[#d4b0ff] transition-all active:scale-95
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {regenerating === ch.id ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            '✦ Regenerate'
          )}
        </button>
      </div>
    </div>
  )
}
