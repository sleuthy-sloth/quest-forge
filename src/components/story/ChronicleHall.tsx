'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuestStore } from '@/store/useQuestStore'
import type { ChapterRow } from '@/store/useQuestStore'
import Image from 'next/image'
import EpicScroll from '@/components/play/EpicScroll'
import worldRaw from '@/lore/world.json'

// ── Types ────────────────────────────────────────────────────────────────────

interface WorldNPC {
  name: string
  role: string
}

interface Deed {
  playerName: string
  choreTitle: string
}

// ── Static lore ───────────────────────────────────────────────────────────────

const NPCS = worldRaw.npcs as WorldNPC[]
const PER_CHAR = 0.025

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

// ── Sub-Component: WeekDeeds ──────────────────────────────────────────────────

function WeekDeeds({ week, householdId }: { week: number; householdId: string }) {
  const [deeds, setDeeds] = useState<Deed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeeds() {
      try {
        const res = await fetch(`/api/story/deeds?household_id=${householdId}&week=${week}`)
        const data = await res.json()
        setDeeds(data.deeds || [])
      } catch (err) {
        console.error('Failed to fetch deeds', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDeeds()
  }, [week, householdId])

  if (loading || deeds.length === 0) return null

  // Group by player
  const grouped = deeds.reduce((acc, d) => {
    if (!acc[d.playerName]) acc[d.playerName] = []
    acc[d.playerName].push(d.choreTitle)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="mt-16 mb-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-10">
        <h3 className="text-[#c9a84c] text-lg font-pixel tracking-[0.4em] uppercase mb-4">Heroic Deeds of Week {week}</h3>
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent mx-auto" />
      </div>
      
      <div className="grid gap-10">
        {Object.entries(grouped).map(([name, tasks]) => (
          <div key={name} className="relative bg-black/40 border border-[#c9a84c]/20 p-8 rounded-sm shadow-2xl overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute inset-0 bg-radial-gradient(circle at 20% 50%, rgba(201,168,76,0.05), transparent 70%)" />
            
            <div className="relative flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 flex items-center justify-center border border-[#c9a84c]/40 shadow-[0_0_20px_rgba(201,168,76,0.15)]">
                <span className="text-[#c9a84c] font-bold text-2xl">{name.charAt(0)}</span>
              </div>
              <span className="font-heading text-[#f0e6c8] text-3xl tracking-wide">{name}</span>
            </div>
            
            <ul className="relative space-y-4">
              {tasks.map((t, i) => (
                <li key={i} className="flex items-start gap-4 text-[#b09a6e] text-xl italic leading-relaxed">
                  <span className="text-[#c9a84c] mt-2.5 text-xs">✦</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sub-Component: ChapterBlock ──────────────────────────────────────────────

function ChapterBlock({ chapter }: { chapter: ChapterRow }) {
  const [typingDone, setTypingDone] = useState(false)
  const [skipTyping, setSkipTyping] = useState(false)
  const narrator = getNarrator(chapter.week_number)

  return (
    <div className="relative mb-32">
      {/* Chapter art - Contain, full width */}
      {chapter.content_image_url && (
        <div className="relative w-full aspect-[21/9] bg-[#05060a] border-y border-[#c9a84c]/10 mb-12">
          <Image
            src={chapter.content_image_url}
            alt={chapter.title}
            fill
            className="object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a14] via-transparent to-transparent opacity-40" />
        </div>
      )}

      {/* Chapter metadata & Title */}
      <div className="max-w-4xl mx-auto px-8 mb-10 text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[#c9a84c]/30" />
          <div className="text-[0.8rem] text-[#c9a84c] font-mono uppercase tracking-[0.5em]">
            Week {chapter.week_number}
          </div>
          <div className="h-px w-12 bg-[#c9a84c]/30" />
        </div>
        
        <h2
          className="text-[#d4b0ff] text-4xl md:text-7xl leading-tight mb-8"
          style={{ 
            fontFamily: 'var(--font-heading), serif', 
            textShadow: '0 4px 30px rgba(212,176,255,0.3), 0 0 60px rgba(212,176,255,0.1)' 
          }}
        >
          {chapter.title}
        </h2>
      </div>

      {/* Narrative Section with Narrator */}
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-[200px_1fr] gap-12 items-start">
        {/* Narrator Sidebar */}
        <div className="flex md:flex-col items-center gap-4 pt-4">
          {narrator && (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#c9a84c]/40 shadow-[0_0_30px_rgba(201,168,76,0.2)] relative">
              <Image 
                src={NARRATOR_IMAGES[narrator.name]} 
                alt={narrator.name} 
                fill
                className="object-cover" 
              />
            </div>
          )}
          <div className="text-center md:text-left">
            <div className="text-[0.6rem] text-[#c9a84c]/60 font-mono tracking-widest uppercase">Narrated by</div>
            <div className="text-xl text-[#f0e6c8] font-heading">{narrator?.name}</div>
          </div>
        </div>

        {/* Narrative Text */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="bg-[#1a140c]/40 border border-[#c9a84c]/10 p-10 md:p-14 rounded-lg shadow-inner cursor-pointer"
          onClick={() => { if (!typingDone) setSkipTyping(true) }}
        >
          {skipTyping ? (
            <p
              className="text-[#f0e6c8] text-2xl md:text-3xl leading-[1.8] tracking-[0.01em] whitespace-pre-wrap font-body"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              {chapter.narrative_text}
            </p>
          ) : (
            <motion.p
              className="text-[#f0e6c8] text-2xl md:text-3xl leading-[1.8] tracking-[0.01em] whitespace-pre-wrap font-body"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              variants={{ visible: { transition: { staggerChildren: PER_CHAR } } }}
              initial="hidden"
              animate="visible"
              onAnimationComplete={() => setTypingDone(true)}
            >
              {chapter.narrative_text.split('').map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 5 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.p>
          )}
          {!typingDone && !skipTyping && (
             <div className="mt-8 text-[0.6rem] text-[#c9a84c]/40 font-mono uppercase tracking-widest text-center animate-pulse">
               Click to skip narration
             </div>
          )}
        </div>
      </div>

      {/* Integrated Deeds */}
      <WeekDeeds week={chapter.week_number} householdId={chapter.household_id} />
      
      {/* Decorative divider between weeks */}
      <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-[#5a3a1a]/30 to-transparent" />
    </div>
  )
}

// ── Main Component: ChronicleHall ───────────────────────────────────────────

export default function ChronicleHall() {
  const { chapters, chaptersLoading, fetchStoryData, householdId } = useQuestStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStoryData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (chaptersLoading) {
    return (
      <div className="min-h-screen bg-[#0e0a14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a84c]/20 border-t-[#c9a84c] rounded-full animate-spin mx-auto mb-6" />
          <div className="text-[#c9a84c] font-pixel text-xs tracking-widest">CONSULTING THE CHRONICLES...</div>
        </div>
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-[#0e0a14] flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-[#1a140c]/40 border border-[#c9a84c]/20 p-12 rounded-lg">
          <div className="text-4xl mb-6 opacity-20">📜</div>
          <h2 className="text-[#f0e6c8] text-2xl font-heading mb-4">The Book is Empty</h2>
          <p className="text-[#b09a6e] text-lg leading-relaxed">
            Your story in Embervale has just begun. Defeat the first boss to record your deeds in the Chronicle Hall.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#0e0a14] overflow-x-hidden">
      {/* Cinematic Narrative View */}
      <EpicScroll 
        beats={chapters.map(c => ({
          id: c.id,
          title: c.title,
          text: c.narrative_text,
          image: c.content_image_url || undefined,
          isMilestone: true
        }))}
        progress={100} // This should eventually reflect the actual progress towards the next boss
      />

      {/* Atmospheric Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/images/ui/paper_texture.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(14,10,20,0) 0%, #0e0a14 100%)" />
      </div>

      {/* Grand Header */}
      <div className="relative w-full h-[300px] flex-shrink-0 flex items-center justify-center overflow-hidden z-10">
        <Image 
          src="/images/ui/quests_parchment.png" 
          alt="Chronicle Hall" 
          fill 
          style={{ objectFit: 'cover', objectPosition: 'center 30%', opacity: 0.25 }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a14] via-transparent to-[#0e0a14]" />
        
        <div className="relative text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="text-[0.7rem] text-[#c9a84c] font-mono tracking-[0.6em] uppercase mb-4">The Living Record of</div>
            <h1 
              className="text-5xl md:text-8xl text-[#f0e6c8] font-heading" 
              style={{ textShadow: '0 0 40px rgba(201,168,76,0.2), 0 4px 10px rgba(0,0,0,0.8)' }}
            >
              Chronicle Hall
            </h1>
            <div className="mt-8 flex justify-center items-center gap-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#c9a84c]/40" />
              <div className="text-[#c9a84c] font-pixel text-[0.5rem] tracking-[0.3em]">EMBERVALE · VOLUME I</div>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#c9a84c]/40" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* The main scroll content is now inside EpicScroll above */}

      {/* Scroll indicator */}
      <motion.div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-px h-12 bg-gradient-to-b from-[#c9a84c] to-transparent opacity-30" />
      </motion.div>
    </div>
  )
}
