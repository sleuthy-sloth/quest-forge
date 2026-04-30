import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useQuestStore } from '../useQuestStore'

// Mock external dependencies
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    rpc: vi.fn(),
  })),
}))

vi.mock('@/lib/audio', () => ({
  playSfx: vi.fn(),
}))

describe('useQuestStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useQuestStore.setState({
      householdId: null,
      playerId: null,
      xp: 0,
      xpAvailable: 0,
      gold: 0,
      health: 100,
      maxHealth: 100,
      level: 1,
      chapters: [],
      chaptersLoading: false,
    })
  })

  describe('hydrate', () => {
    it('sets initial state from provided data', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 500,
        xpAvailable: 200,
        gold: 150,
        level: 5,
        health: 80,
        maxHealth: 100,
      })

      const state = useQuestStore.getState()
      expect(state.householdId).toBe('household-123')
      expect(state.playerId).toBe('player-456')
      expect(state.xp).toBe(500)
      expect(state.xpAvailable).toBe(200)
      expect(state.gold).toBe(150)
      expect(state.level).toBe(5)
      expect(state.health).toBe(80)
      expect(state.maxHealth).toBe(100)
    })

    it('uses default maxHealth when not provided', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
      })

      const state = useQuestStore.getState()
      expect(state.maxHealth).toBe(100)
      expect(state.health).toBe(100)
    })

    it('uses provided health or defaults to maxHealth', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        maxHealth: 150,
      })

      const state = useQuestStore.getState()
      expect(state.maxHealth).toBe(150)
      expect(state.health).toBe(150)
    })
  })

  describe('completeTask', () => {
    it('adds XP and gold to state', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
      })

      useQuestStore.getState().completeTask(50, 25)

      const state = useQuestStore.getState()
      expect(state.xp).toBe(50)
      expect(state.xpAvailable).toBe(50)
      expect(state.gold).toBe(25)
    })

    it('handles level-up when XP threshold is reached', () => {
      // Start at level 1 with 0 XP
      // Level 2 requires 100 XP
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
      })

      // Add 100 XP to reach level 2
      useQuestStore.getState().completeTask(100, 0)

      const state = useQuestStore.getState()
      expect(state.level).toBe(2)
      expect(state.xp).toBe(100)
    })

    it('handles multiple level-ups when large XP is awarded', () => {
      // Start at level 1 with 0 XP
      // Level 2 = 100 XP, Level 3 = 250 XP total
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
      })

      // Award enough XP to reach level 4 (600 XP total)
      useQuestStore.getState().completeTask(600, 0)

      const state = useQuestStore.getState()
      expect(state.level).toBe(4)
      expect(state.xp).toBe(600)
    })

    it('does not exceed level 100 (max level)', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
      })

      // Award massive XP that would exceed level 100
      // xpForLevel(100) = 252,450 XP needed
      useQuestStore.getState().completeTask(300000, 0)

      const state = useQuestStore.getState()
      expect(state.level).toBe(100)
    })

    it('accumulates gold across multiple tasks', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
      })

      useQuestStore.getState().completeTask(50, 10)
      useQuestStore.getState().completeTask(30, 20)

      const state = useQuestStore.getState()
      expect(state.gold).toBe(30)
      expect(state.xp).toBe(80)
      expect(state.xpAvailable).toBe(80)
    })
  })

  describe('takeDamage', () => {
    it('reduces health by the specified amount', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        health: 100,
        maxHealth: 100,
      })

      useQuestStore.getState().takeDamage(30)

      const state = useQuestStore.getState()
      expect(state.health).toBe(70)
    })

    it('floors health at 0 when damage exceeds current health', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        health: 50,
        maxHealth: 100,
      })

      useQuestStore.getState().takeDamage(100)

      const state = useQuestStore.getState()
      expect(state.health).toBe(0)
    })

    it('handles exact damage that reduces health to 0', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        health: 25,
        maxHealth: 100,
      })

      useQuestStore.getState().takeDamage(25)

      const state = useQuestStore.getState()
      expect(state.health).toBe(0)
    })
  })

  describe('heal', () => {
    it('restores health by the specified amount', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        health: 50,
        maxHealth: 100,
      })

      useQuestStore.getState().heal(30)

      const state = useQuestStore.getState()
      expect(state.health).toBe(80)
    })

    it('caps health at maxHealth when heal amount would exceed', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        health: 80,
        maxHealth: 100,
      })

      useQuestStore.getState().heal(50)

      const state = useQuestStore.getState()
      expect(state.health).toBe(100)
    })

    it('heals to full maxHealth when called with no arguments', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        health: 10,
        maxHealth: 100,
      })

      useQuestStore.getState().heal()

      const state = useQuestStore.getState()
      expect(state.health).toBe(100)
    })

    it('does not exceed maxHealth even with full heal', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        health: 100,
        maxHealth: 80,
      })

      useQuestStore.getState().heal()

      const state = useQuestStore.getState()
      expect(state.health).toBe(80)
    })

    it('handles healing from 0 health', () => {
      useQuestStore.getState().hydrate({
        householdId: 'household-123',
        playerId: 'player-456',
        xpTotal: 0,
        xpAvailable: 0,
        gold: 0,
        level: 1,
        health: 0,
        maxHealth: 100,
      })

      useQuestStore.getState().heal(50)

      const state = useQuestStore.getState()
      expect(state.health).toBe(50)
    })
  })
})