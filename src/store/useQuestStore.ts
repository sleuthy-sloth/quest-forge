import { create } from 'zustand'
import { playSfx } from '@/lib/audio'

// ── Helpers ────────────────────────────────────────────────────

/** Total XP needed to reach level N (1-indexed). */
function xpForLevel(level: number): number {
  return (50 * level * (level + 1)) / 2
}

// ── Types ──────────────────────────────────────────────────────

export interface QuestState {
  // ── Multi-tenant context ──────────────────────────────────
  householdId: string | null
  playerId: string | null

  // ── RPG metrics ──────────────────────────────────────────
  xp: number          // lifetime total (for level calculation)
  xpAvailable: number // spendable (never > xp)
  gold: number
  health: number
  maxHealth: number
  level: number

  // ── Actions ──────────────────────────────────────────────

  /** Seed the store with the player's persisted data. */
  hydrate: (data: {
    householdId: string
    playerId: string
    xpTotal: number
    xpAvailable: number
    gold: number
    level: number
    health?: number
    maxHealth?: number
  }) => void

  /**
   * Award XP and gold for a completed task.
   * - Fires `playSfx('coin')` on every call.
   * - Fires `playSfx('victory')` if the player crosses a level threshold.
   */
  completeTask: (xpReward: number, goldReward: number) => void

  /**
   * Inflict damage on the player.
   * - Fires `playSfx('attack')`.
   * - Health is floored at 0.
   */
  takeDamage: (amount: number) => void

  /** Reset health to max. */
  heal: (amount?: number) => void
}

// ── Defaults ───────────────────────────────────────────────────

const DEFAULT_MAX_HEALTH = 100

// ── Store ──────────────────────────────────────────────────────

export const useQuestStore = create<QuestState>((set, get) => ({
  // State
  householdId: null,
  playerId: null,
  xp: 0,
  xpAvailable: 0,
  gold: 0,
  health: DEFAULT_MAX_HEALTH,
  maxHealth: DEFAULT_MAX_HEALTH,
  level: 1,

  // ── Actions ──────────────────────────────────────────────

  hydrate(data) {
    set({
      householdId: data.householdId,
      playerId: data.playerId,
      xp: data.xpTotal,
      xpAvailable: data.xpAvailable,
      gold: data.gold,
      level: data.level,
      health: data.health ?? data.maxHealth ?? DEFAULT_MAX_HEALTH,
      maxHealth: data.maxHealth ?? DEFAULT_MAX_HEALTH,
    })
  },

  completeTask(xpReward, goldReward) {
    const state = get()
    const newXp = state.xp + xpReward

    // Calculate new level
    let newLevel = state.level
    while (newLevel < 100 && newXp >= xpForLevel(newLevel + 1)) {
      newLevel++
    }

    const leveledUp = newLevel > state.level

    set({
      xp: newXp,
      xpAvailable: state.xpAvailable + xpReward,
      gold: state.gold + goldReward,
      level: newLevel,
    })

    // Audio feedback
    playSfx('coin')
    if (leveledUp) playSfx('victory')
  },

  takeDamage(amount) {
    const state = get()
    const newHealth = Math.max(0, state.health - amount)

    set({ health: newHealth })

    playSfx('attack')
  },

  heal(amount) {
    const state = get()
    const max = state.maxHealth
    const newHealth = amount === undefined ? max : Math.min(max, state.health + amount)
    set({ health: newHealth })
  },
}))
