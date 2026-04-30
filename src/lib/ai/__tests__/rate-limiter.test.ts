import { describe, it, expect, vi, beforeEach } from 'vitest'

// The rate-limiter module imports from @/lib/supabase/server which depends on
// @supabase/ssr and next/headers. We mock the entire module chain.
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ rpc: vi.fn() }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

// Now we can safely mock the server module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { canMakeRequest, incrementUsage, getUsageToday } from '../rate-limiter'

describe('rate-limiter', () => {
  let mockRpc: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRpc = vi.fn()
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      rpc: mockRpc,
    })
  })

  describe('canMakeRequest', () => {
    it('returns true when usage is within limit', async () => {
      mockRpc.mockResolvedValue({ data: 500, error: null })
      await expect(canMakeRequest()).resolves.toBe(true)
    })

    it('returns false when usage exceeds daily limit', async () => {
      mockRpc.mockResolvedValue({ data: 1400, error: null })
      await expect(canMakeRequest()).resolves.toBe(false)
    })

    it('returns true when usage is exactly at limit boundary', async () => {
      mockRpc.mockResolvedValue({ data: 1399, error: null })
      await expect(canMakeRequest()).resolves.toBe(true)
    })

    it('returns false when usage equals limit', async () => {
      mockRpc.mockResolvedValue({ data: 1400, error: null })
      await expect(canMakeRequest()).resolves.toBe(false)
    })

    it('returns true when RPC function is missing (42883)', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { code: '42883', message: 'function not found' } })
      await expect(canMakeRequest()).resolves.toBe(true)
    })

    it('returns true when RPC function is missing (PGRST202)', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'relation not found' } })
      await expect(canMakeRequest()).resolves.toBe(true)
    })

    it('returns false on generic RPC errors', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { code: 'PGRST100', message: 'network error' } })
      await expect(canMakeRequest()).resolves.toBe(false)
    })

    it('returns false when createClient throws', async () => {
      ;(createClient as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB down'))
      await expect(canMakeRequest()).resolves.toBe(false)
    })
  })

  describe('incrementUsage', () => {
    it('returns the count from RPC on success', async () => {
      mockRpc.mockResolvedValue({ data: 42, error: null })
      await expect(incrementUsage()).resolves.toBe(42)
    })

    it('returns 0 on RPC error', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'error' } })
      await expect(incrementUsage()).resolves.toBe(0)
    })
  })

  describe('getUsageToday', () => {
    it('returns the count from RPC', async () => {
      mockRpc.mockResolvedValue({ data: 99, error: null })
      await expect(getUsageToday()).resolves.toBe(99)
    })

    it('returns 0 when RPC returns null', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null })
      await expect(getUsageToday()).resolves.toBe(0)
    })

    it('returns 0 when createClient throws', async () => {
      ;(createClient as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'))
      await expect(getUsageToday()).resolves.toBe(0)
    })
  })
})
