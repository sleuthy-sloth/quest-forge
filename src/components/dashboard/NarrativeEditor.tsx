'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface NarrativeEditorProps {
  chapter: {
    id: string
    title: string
    narrative_text: string
  }
  players?: { id: string, display_name: string }[]
}

/**
 * NarrativeEditor — A premium UI for GMs to shape the world's story.
 * Features real-time editing and cinematic save feedback.
 */
export default function NarrativeEditor({ chapter, players = [] }: NarrativeEditorProps) {
  const [title, setTitle] = useState(chapter.title)
  const [text, setText] = useState(chapter.narrative_text)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const [milestoneText, setMilestoneText] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [isBestowing, setIsBestowing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    const supabase = createClient()
    const { error } = await supabase
      .from('story_chapters')
      .update({ title, narrative_text: text })
      .eq('id', chapter.id)

    setIsSaving(false)
    if (error) {
      setSaveStatus('error')
    } else {
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleGenerateIntro = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/story/generate-opening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId: chapter.id }),
      })
      const data = await res.json()
      if (data.narrative) setText(data.narrative)
    } catch (err) {
      alert('Failed to generate intro.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateVictory = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId: chapter.id }),
      })
      const data = await res.json()
      if (data.narrative) setText(data.narrative)
    } catch (err) {
      alert('Failed to generate victory.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBestow = async () => {
    if (!milestoneText || !selectedPlayer) return
    setIsBestowing(true)
    
    const supabase = createClient()
    const { error } = await (supabase as any)
      .from('lore_milestones')
      .insert({ 
        player_id: selectedPlayer, 
        text: milestoneText,
        chapter_id: chapter.id
      })

    setIsBestowing(false)
    if (!error) {
      setMilestoneText('')
      setSelectedPlayer('')
      alert('Lore Fragment bestowed!')
    }
  }

  return (
    <div className="qf-ornate-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 className="qf-scribed" style={{ fontSize: '1rem', color: '#c9a84c' }}>Narrative Editor</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleGenerateIntro}
            disabled={isGenerating}
            title="Generate a mystical opening for this chapter via AI"
            style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(212,176,255,0.1)',
              color: '#d4b0ff',
              border: '1px solid rgba(212,176,255,0.3)',
              borderRadius: '4px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.55rem',
              cursor: 'pointer',
              opacity: isGenerating ? 0.5 : 1
            }}
          >
            {isGenerating ? 'SCRIBING...' : '✦ GEN INTRO'}
          </button>
          <button
            onClick={handleGenerateVictory}
            disabled={isGenerating}
            title="Generate a cinematic victory narrative via AI"
            style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(212,176,255,0.1)',
              color: '#d4b0ff',
              border: '1px solid rgba(212,176,255,0.3)',
              borderRadius: '4px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.55rem',
              cursor: 'pointer',
              opacity: isGenerating ? 0.5 : 1
            }}
          >
            {isGenerating ? 'SCRIBING...' : '✦ GEN VICTORY'}
          </button>
          <div style={{ width: '1px', height: '20px', background: 'rgba(201,168,76,0.2)', margin: '0 0.25rem' }} />
          {saveStatus === 'success' && <span style={{ color: 'var(--qf-success)', fontSize: '0.7rem' }}>✓ Saved</span>}
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '0.5rem 1rem',
              background: '#c9a84c',
              color: '#1a140c',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.6rem',
              cursor: 'pointer',
              opacity: isSaving ? 0.5 : 1
            }}
          >
            {isSaving ? 'SEALING...' : 'SEAL CHRONICLE'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: '#7a6a44', marginBottom: '0.5rem' }}>
            CHAPTER TITLE
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '4px',
              padding: '0.75rem',
              color: '#f0e6c8',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: '#7a6a44', marginBottom: '0.5rem' }}>
            NARRATIVE TEXT
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '4px',
              padding: '0.75rem',
              color: '#c0b08a',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              lineHeight: 1.6,
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <h4 className="qf-scribed" style={{ fontSize: '0.8rem', color: '#7a6a44', marginBottom: '1rem' }}>BESTOW MILESTONE</h4>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '4px',
              padding: '0.5rem',
              color: '#f0e6c8',
              fontFamily: 'var(--font-body)'
            }}
          >
            <option value="">Select Player...</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
          <input
            type="text"
            placeholder="Fragment of Lore..."
            value={milestoneText}
            onChange={(e) => setMilestoneText(e.target.value)}
            style={{
              flex: 2,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '4px',
              padding: '0.5rem',
              color: '#f0e6c8',
              fontFamily: 'var(--font-body)'
            }}
          />
          <button
            onClick={handleBestow}
            disabled={isBestowing || !selectedPlayer || !milestoneText}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(201,168,76,0.1)',
              color: '#c9a84c',
              border: '1px solid #c9a84c',
              borderRadius: '4px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.5rem',
              cursor: 'pointer',
              opacity: (isBestowing || !selectedPlayer || !milestoneText) ? 0.5 : 1
            }}
          >
            BESTOW
          </button>
        </div>
      </div>
    </div>
  )
}
