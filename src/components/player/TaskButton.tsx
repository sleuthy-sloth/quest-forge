'use client'

import { useRef } from 'react'
import { useQuestStore } from '@/store/useQuestStore'
import { playSfx } from '@/lib/audio'

interface TaskButtonProps {
  /** XP to award on completion. */
  xpReward: number
  /** Gold to award on completion. */
  goldReward: number
  /** Human-readable task name. */
  label: string
  /** Optional className override. */
  className?: string
}

/**
 * A button that fires tactile feedback on `pointerDown` (before the state
 * resolves) and then commits the task reward through the Zustand store.
 *
 * Usage:
 *   <TaskButton xpReward={50} goldReward={10} label="Sweep the Kitchen" />
 */
export default function TaskButton({ xpReward, goldReward, label, className }: TaskButtonProps) {
  const completeTask = useQuestStore((s) => s.completeTask)

  // Track pointer-down time to guard against accidental double-fires
  const lastPointer = useRef(0)

  function handlePointerDown() {
    const now = Date.now()
    if (now - lastPointer.current < 300) return
    lastPointer.current = now

    // Immediate tactile feedback — no waiting for Zustand set()
    playSfx('click')
  }

  function handleComplete() {
    completeTask(xpReward, goldReward)
  }

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onClick={handleComplete}
      className={
        className ??
        'w-full px-4 py-3 rounded-[3px] text-sm tracking-widest uppercase ' +
        'bg-gradient-to-r from-[#1a0a2e] to-[#0f0620] border border-[#c9a84c]/30 ' +
        'text-[#c9a84c] font-semibold select-none ' +
        'active:scale-[0.97] transition-transform duration-75 ' +
        'hover:border-[#c9a84c]/60'
      }
    >
      {label}
    </button>
  )
}
