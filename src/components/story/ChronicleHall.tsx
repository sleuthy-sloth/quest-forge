'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import type { ChapterRow } from '@/store/useQuestStore'
import Image from 'next/image'
import bossesRaw from '@/lore/bosses.json'
import worldRaw from '@/lore/world.json'

// ── Lore types ────────────────────────────────────────────────────────────────

interface Arc {
  arc_number: number
  name: string
  region: string
  summary: string
  weeks: number[]
}

interface Boss {
  week: number
  arc: number
  name: string
  hp: number
  description: string
  weakness_flavor: string
  defeat_narrative: string
}

interface WorldRegion {
  name: string
  description: string
}

interface WorldNPC {
  name: string
  role: string
}

// ── Static lore ───────────────────────────────────────────────────────────────

const ARCS = bossesRaw.arcs as Arc[]
const BOSSES = bossesRaw.bosses as Boss[]
const REGIONS = worldRaw.regions as WorldRegion[]
const NPCS = worldRaw.npcs as WorldNPC[]
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII']
const PER_CHAR = 0.025

// ── Helpers ───────────────────────────────────────────────────────────────────

type ArcStatus = 'completed' | 'current' | 'locked'
type SelectedArc = number | 'prologue'

function deriveCurrentArc(chapters: ChapterRow[]): number {
  if (chapters.length === 0) return 1
  const maxWeek = Math.max(...chapters.map((c) => c.week_number))
  if (maxWeek === 0) return 1
  return ARCS.find((a) => maxWeek >= a.weeks[0] && maxWeek <= a.weeks[1])?.arc_number ?? 1
}

function arcStatus(arcNum: number, currentArc: number): ArcStatus {
  if (arcNum < currentArc) return 'completed'
  if (arcNum === currentArc) return 'current'
  return 'locked'
}

function getRegionDesc(name: string): string {
  return REGIONS.find((r) => r.name === name)?.description ?? ''
}

function getNarrator(weekNumber: number): WorldNPC | undefined {
  if (weekNumber === 0) return NPCS.find((n) => n.name === 'Elder Maren')
  if (weekNumber % 4 === 0) return NPCS.find((n) => n.name === 'The Chronicler')
  if (weekNumber % 3 === 0) return NPCS.find((n) => n.name === 'Professor Ignis')
  return NPCS.find((n) => n.name === 'Kaya')
}

const NARRATOR_IMAGES: Record<string, string> = {
  'Elder Maren': '/images/ui/intro_elder.png',
  'Kaya': '/images/lore/kaya.png',
  'Professor Ignis': '/images/lore/ignis.png',
  'The Chronicler': '/images/lore/chronicler.png',
}

// ── Chapter Reader ────────────────────────────────────────────────────────────

function ChapterReader({
  chapter,
  onBack,
}: {
  chapter: ChapterRow
  onBack: () => void
}) {
  const [typingDone, setTypingDone] = useState(false)
  const [skipTyping, setSkipTyping] = useState(false)

  const narrator = getNarrator(chapter.week_number)
  const arc = ARCS.find(
    (a) => chapter.week_number >= a.weeks[0] && chapter.week_number <= a.weeks[1],
  )

  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 px-4 py-2 text-[0.5rem] font-mono
          text-[#b09a6e]/50 hover:text-[#c9a84c] transition-colors
          border-b border-[#5a3a1a]/30 flex-shrink-0"
      >
        <span>◂</span>
        <span className="tracking-wider uppercase">Back to Chronicles</span>
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="flex-1 overflow-y-auto"
        >
          {/* Location tag */}
          {arc && (
            <div className="px-4 pt-3 pb-0 text-[0.4rem] font-mono tracking-[0.15em] uppercase text-[#c9a84c]/40">
              {arc.region} &middot; Arc {ROMAN[arc.arc_number - 1]}
            </div>
          )}

          {/* NPC narrator */}
          {narrator && (
            <div className="px-4 pt-2 pb-0 flex items-center gap-3">
              <div
                className="w-10 h-10 border border-[#5a3a1a]/50 bg-[#1a0e04] rounded-sm
                  flex items-center justify-center overflow-hidden relative"
              >
                <Image src={NARRATOR_IMAGES[narrator.name]} alt={narrator.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div>
                <div className="text-[0.4rem] text-[#c9a84c]/60 font-mono uppercase tracking-wider">
                  {narrator.name}
                </div>
                <div className="text-[0.35rem] text-[#b09a6e]/30 font-mono">{narrator.role}</div>
              </div>
            </div>
          )}

          {/* Chapter title */}
          <div className="px-4 pt-3 pb-2 border-t border-[#5a3a1a]/20 mt-2">
            <div className="text-[0.4rem] text-[#b09a6e]/30 font-mono uppercase tracking-wider mb-1">
              Week {chapter.week_number}
            </div>
            <h2
              className="text-[#d4b0ff] text-sm text-center"
              style={{ fontFamily: 'var(--font-heading), serif' }}
            >
              {chapter.title}
            </h2>
          </div>

          <div className="w-10 mx-auto h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent mb-3" />

          {/* Narrative text */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="px-5 pb-6 cursor-pointer"
            onClick={() => { if (!typingDone) setSkipTyping(true) }}
            title="Click to skip animation"
          >
            {skipTyping ? (
              <p
                className="text-[#b0c0e0] text-[0.72rem] leading-relaxed tracking-[0.02em] whitespace-pre-wrap"
                style={{ fontFamily: 'var(--font-body), serif' }}
              >
                {chapter.narrative_text}
              </p>
            ) : (
              <motion.p
                className="text-[#b0c0e0] text-[0.72rem] leading-relaxed tracking-[0.02em] whitespace-pre-wrap"
                style={{ fontFamily: 'var(--font-body), serif' }}
                variants={{ visible: { transition: { staggerChildren: PER_CHAR } } }}
                initial="hidden"
                animate="visible"
                onAnimationComplete={() => setTypingDone(true)}
              >
                {chapter.narrative_text.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    transition={{ duration: 0 }}
                  >
                    {ch === ' ' ? ' ' : ch}
                  </motion.span>
                ))}
              </motion.p>
            )}

            {!typingDone && !skipTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-[2px] h-[1em] bg-[#c9a84c] ml-0.5 align-text-bottom"
              />
            )}

            {!typingDone && !skipTyping && (
              <div className="mt-3 text-[0.4rem] text-[#b09a6e]/20 font-mono text-center">
                tap to skip
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Arc panel content ─────────────────────────────────────────────────────────

function ProloguePanel({ chapters, onRead }: { chapters: ChapterRow[]; onRead: (c: ChapterRow) => void }) {
  const prologueChapter = chapters.find((c) => c.week_number === 0)
  return (
    <div className="p-4">
      <div className="text-[0.4rem] text-[#c9a84c]/40 font-mono uppercase tracking-wider mb-1">
        The Beginning
      </div>
      <h3
        className="text-[#d4b0ff] text-xs mb-3"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Prologue &mdash; The Choosing
      </h3>
      <p className="text-[0.62rem] text-[#b09a6e]/60 leading-relaxed mb-4">
        The story of your company begins in Hearthhold, where the Emberlight grows dim and the
        Hollow draws closer. A new generation of Emberbearers has been called.
      </p>
      {prologueChapter ? (
        <button
          onClick={() => onRead(prologueChapter)}
          className="w-full py-2 text-[0.5rem] font-mono tracking-wider uppercase
            text-[#c9a84c] border border-[#c9a84c]/30 hover:bg-[#c9a84c]/10
            active:scale-95 transition-all"
        >
          📖 Read the Prologue →
        </button>
      ) : (
        <div className="text-[0.5rem] text-[#b09a6e]/25 font-mono text-center py-2 border border-[#3a2a1a]/30">
          The prologue has not yet been unlocked.
        </div>
      )}
    </div>
  )
}

function CompletedOrCurrentArcPanel({
  arc,
  status,
  chapters,
  currentArcNum,
  onRead,
}: {
  arc: Arc
  status: ArcStatus
  chapters: ChapterRow[]
  currentArcNum: number
  onRead: (c: ChapterRow) => void
}) {
  const arcChapters = chapters.filter(
    (c) => c.week_number >= arc.weeks[0] && c.week_number <= arc.weeks[1],
  )

  const arcWeeks: number[] = []
  for (let w = arc.weeks[0]; w <= arc.weeks[1]; w++) arcWeeks.push(w)

  // For the current arc, find the first boss week that's not yet unlocked
  const unlockedWeeks = new Set(arcChapters.map((c) => c.week_number))
  const activeBossWeek = status === 'current' ? arcWeeks.find((w) => !unlockedWeeks.has(w)) : null
  const activeBoss = activeBossWeek != null ? BOSSES.find((b) => b.week === activeBossWeek) : null

  return (
    <div className="p-4">
      <div
        className={`text-[0.4rem] font-mono uppercase tracking-wider mb-0.5 ${
          status === 'completed' ? 'text-[#c9a84c]/40' : 'text-[#ff8c42]/60'
        }`}
      >
        Arc {ROMAN[arc.arc_number - 1]} &middot; {arc.region}
        {status === 'completed' && ' · Completed ✓'}
        {status === 'current' && ' · Active ⚔'}
      </div>
      <h3
        className={`text-xs mb-2 ${status === 'completed' ? 'text-[#c9a84c]' : 'text-[#ff8c42]'}`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {arc.name}
      </h3>
      <p className="text-[0.6rem] text-[#b09a6e]/55 leading-relaxed mb-3 border-l-2 border-[#5a3a1a]/30 pl-3">
        {arc.summary}
      </p>

      {/* Current boss preview */}
      {activeBoss && (
        <div className="mb-4 border border-[#D4440F]/30 bg-[#0e0404]">
          <div className="px-3 py-1.5 border-b border-[#D4440F]/15 bg-[#1a0504]">
            <div className="text-[0.38rem] font-mono text-[#ff8c42]/50 uppercase tracking-wider">
              ☠ The Hollow&apos;s Current Champion
            </div>
          </div>
          <div className="p-3">
            <div
              className="text-[#ff8c42] text-[0.78rem] font-bold mb-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {activeBoss.name}
            </div>
            <p className="text-[0.6rem] text-[#b09a6e]/65 leading-relaxed mb-2 italic">
              &ldquo;{activeBoss.description}&rdquo;
            </p>
            <div className="border-t border-[#D4440F]/15 pt-2">
              <div className="text-[0.38rem] font-mono text-[#c9a84c]/45 uppercase tracking-wider mb-0.5">
                ⚡ How to weaken it
              </div>
              <p className="text-[0.6rem] text-[#c9a84c]/65 italic">
                &ldquo;{activeBoss.weakness_flavor}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chapter list */}
      <div className="space-y-1">
        <div className="text-[0.38rem] font-mono text-[#b09a6e]/25 uppercase tracking-wider mb-2">
          Chapters in this arc
        </div>
        {arcWeeks.map((week) => {
          const chapter = chapters.find((c) => c.week_number === week)
          const boss = BOSSES.find((b) => b.week === week)

          if (chapter) {
            return (
              <button
                key={week}
                onClick={() => onRead(chapter)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left
                  border border-[#5a3a1a]/25 hover:border-[#c9a84c]/35
                  hover:bg-[#c9a84c]/4 active:scale-[0.98] transition-all"
              >
                <span className="text-[0.65rem] flex-shrink-0">📖</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.54rem] text-[#f0e6c8] truncate">{chapter.title}</div>
                  <div className="text-[0.38rem] text-[#b09a6e]/35 font-mono">Week {week}</div>
                </div>
                <span className="text-[0.45rem] text-[#c9a84c]/35 flex-shrink-0">→</span>
              </button>
            )
          }

          return (
            <div
              key={week}
              className="flex items-center gap-2 px-3 py-2 border border-[#3a2a1a]/20 opacity-35"
            >
              <span className="text-[0.65rem] flex-shrink-0">🔒</span>
              <div className="flex-1 min-w-0">
                <div className="text-[0.54rem] text-[#b09a6e]/40 truncate">
                  {boss?.name ?? `Week ${week}`}
                </div>
                <div className="text-[0.38rem] text-[#b09a6e]/25 font-mono">
                  Week {week} &middot; Complete tasks to unlock
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LockedNearArcPanel({ arc }: { arc: Arc }) {
  const regionDesc = getRegionDesc(arc.region)
  const firstBoss = BOSSES.find((b) => b.arc === arc.arc_number)

  return (
    <div className="p-4">
      <div className="text-[0.4rem] text-[#c9a84c]/25 font-mono uppercase tracking-wider mb-0.5">
        Arc {ROMAN[arc.arc_number - 1]} &mdash; Locked
      </div>
      <h3
        className="text-[#b09a6e]/45 text-xs mb-1"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {arc.name}
      </h3>
      <div className="text-[0.4rem] text-[#b09a6e]/25 font-mono mb-3">
        Region: {arc.region}
      </div>

      {regionDesc && (
        <div className="border-l-2 border-[#3a2a1a] pl-3 mb-3">
          <p className="text-[0.6rem] text-[#b09a6e]/35 italic leading-relaxed">
            &ldquo;{regionDesc.slice(0, 130)}&hellip;&rdquo;
          </p>
        </div>
      )}

      <div className="bg-[#0c0a10] border border-[#3a2a1a]/40 p-3 mb-3">
        <div className="text-[0.38rem] text-[#b09a6e]/25 font-mono uppercase tracking-wider mb-1">
          What awaits
        </div>
        <p className="text-[0.6rem] text-[#b09a6e]/45 leading-relaxed">{arc.summary}</p>
      </div>

      {firstBoss && (
        <div className="border border-[#3a2a1a]/30 p-2 text-center mb-3">
          <div className="text-[0.38rem] text-[#b09a6e]/20 font-mono uppercase tracking-wider">
            First threat awaiting
          </div>
          <div className="text-[0.58rem] text-[#b09a6e]/30 mt-0.5">{firstBoss.name}</div>
        </div>
      )}

      <div className="text-[0.45rem] text-[#b09a6e]/18 font-mono text-center">
        Complete the current arc to journey here
      </div>
    </div>
  )
}

function LockedFarArcPanel({ arc }: { arc: Arc }) {
  return (
    <div className="p-4">
      <div className="text-[0.4rem] text-[#2a1a0a] font-mono uppercase tracking-wider mb-0.5">
        Arc {ROMAN[arc.arc_number - 1]}
      </div>
      <h3 className="text-[#2a1a0a] text-xs mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        ??? &mdash; Unknown Reaches
      </h3>
      <div className="border border-[#1e1208] bg-[#0a0804] p-5 text-center">
        <div className="text-2xl mb-3 opacity-15">⬛</div>
        <p className="text-[0.58rem] text-[#1e1208] leading-relaxed">
          These lands lie beyond the horizon of your current journey. Continue pushing back the
          Hollow to reveal what lies ahead.
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChronicleHall() {
  const { chapters, chaptersLoading, fetchStoryData } = useQuestStore()
  const [selectedArc, setSelectedArc] = useState<SelectedArc>('prologue')
  const [selectedChapter, setSelectedChapter] = useState<ChapterRow | null>(null)
  const hasDefaulted = useRef(false)

  useEffect(() => {
    fetchStoryData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Default to current arc on first data load; don't override later user navigation
  useEffect(() => {
    if (!hasDefaulted.current && chapters.length > 0) {
      hasDefaulted.current = true
      setSelectedArc(deriveCurrentArc(chapters))
    }
  }, [chapters])

  const currentArcNum = deriveCurrentArc(chapters)

  function handleSelectArc(arc: SelectedArc) {
    setSelectedArc(arc)
    setSelectedChapter(null)
  }

  // ── Chapter reader ─────────────────────────────────────────────────────────

  if (selectedChapter) {
    return (
      <ChapterReader chapter={selectedChapter} onBack={() => setSelectedChapter(null)} />
    )
  }

  // ── Arc content ────────────────────────────────────────────────────────────

  function renderArcContent() {
    if (chaptersLoading) {
      return (
        <div className="p-6 text-center text-[#b09a6e]/30 font-mono text-[0.55rem]">
          Consulting the chronicles&hellip;
        </div>
      )
    }

    if (selectedArc === 'prologue') {
      return <ProloguePanel chapters={chapters} onRead={setSelectedChapter} />
    }

    const arc = ARCS.find((a) => a.arc_number === selectedArc)
    if (!arc) return null

    const status = arcStatus(arc.arc_number, currentArcNum)
    const arcsAhead = arc.arc_number - currentArcNum

    if (status === 'locked' && arcsAhead >= 3) {
      return <LockedFarArcPanel arc={arc} />
    }

    if (status === 'locked') {
      return <LockedNearArcPanel arc={arc} />
    }

    return (
      <CompletedOrCurrentArcPanel
        arc={arc}
        status={status}
        chapters={chapters}
        currentArcNum={currentArcNum}
        onRead={setSelectedChapter}
      />
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ background: '#0e0a14', minHeight: '100%' }}>
      {/* Header */}
      <div className="relative w-full h-[120px] border-b border-[#c9a84c]/20 flex-shrink-0">
        <Image 
          src="/images/ui/quests_parchment.png" 
          alt="Chronicle Hall" 
          fill 
          style={{ objectFit: 'cover', objectPosition: 'center 30%', opacity: 0.65 }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a14] via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
          <h1 className="text-xl text-[#f0e6c8] font-heading drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Chronicle Hall
          </h1>
          <p className="text-[0.45rem] text-[#c9a84c] font-mono tracking-[0.15em] drop-shadow-md mt-1">
            THE STORY OF EMBERVALE
          </p>
        </div>
      </div>

      {/* Arc navigation strip */}
      <div className="border-b border-[#5a3a1a]/20 overflow-x-auto scrollbar-none flex-shrink-0">
        <div className="flex gap-1 px-2 py-1.5 min-w-max">
          {/* Prologue */}
          <button
            onClick={() => handleSelectArc('prologue')}
            className={`px-2 py-1 text-[0.42rem] font-mono uppercase tracking-wider
              transition-all flex-shrink-0 border ${
              selectedArc === 'prologue'
                ? 'border-[#c9a84c]/50 bg-[#1a1204] text-[#c9a84c]'
                : 'border-[#3a2a1a]/60 text-[#5a3a1a] hover:border-[#5a3a1a]'
            }`}
          >
            Prologue
          </button>

          {/* Arc pills */}
          {ARCS.map((arc) => {
            const status = arcStatus(arc.arc_number, currentArcNum)
            const isSelected = selectedArc === arc.arc_number
            const arcsAhead = arc.arc_number - currentArcNum

            const baseClass = 'px-2 py-1 text-[0.42rem] font-mono uppercase tracking-wider transition-all flex-shrink-0 border'

            let colorClass: string
            if (isSelected) {
              colorClass =
                status === 'completed'
                  ? 'border-[#c9a84c]/55 bg-[#1a1204] text-[#c9a84c]'
                  : status === 'current'
                  ? 'border-[#D4440F]/55 bg-[#1a0504] text-[#ff8c42]'
                  : 'border-[#4a3a2a]/40 bg-[#0e0a0a] text-[#6a5a4a]'
            } else {
              colorClass =
                status === 'completed'
                  ? 'border-[#c9a84c]/18 text-[#c9a84c]/40 hover:border-[#c9a84c]/35'
                  : status === 'current'
                  ? 'border-[#D4440F]/35 text-[#ff8c42]/65 hover:border-[#D4440F]/55'
                  : arcsAhead >= 3
                  ? 'border-[#1e1208] text-[#1e1208]'
                  : 'border-[#3a2a1a]/40 text-[#4a3a2a] hover:border-[#5a3a1a]'
            }

            const icon =
              status === 'completed' ? '✓' :
              status === 'current' ? '⚔' :
              arcsAhead >= 3 ? '?' : '🔒'

            return (
              <button
                key={arc.arc_number}
                onClick={() => handleSelectArc(arc.arc_number)}
                className={`${baseClass} ${colorClass}`}
              >
                {icon}&nbsp;{ROMAN[arc.arc_number - 1]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Arc content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={String(selectedArc)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {renderArcContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
