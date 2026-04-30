/**
 * Simple in-memory per-IP rate limiter for non-AI API routes.
 *
 * Uses a sliding window approach. Each IP gets a configurable number of
 * requests per window (default: 60 requests per 60 seconds).
 *
 * NOTE: This is in-memory only — it resets on server restart and does NOT
 * scale across multiple instances. For production with multiple instances,
 * replace with a Redis-based implementation. For Vercel's single-instance
 * serverless functions, this is adequate for basic abuse prevention.
 */

interface RateLimitEntry {
  /** Timestamps of requests within the current window (oldest first). */
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Clean up stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  store.forEach((entry, key) => {
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  })
}

export interface RateLimitResult {
  /** Whether the request is allowed. */
  allowed: boolean
  /** Time in seconds until the rate limit resets. */
  retryAfterSeconds: number
  /** Current usage count within the window. */
  current: number
  /** Maximum requests allowed per window. */
  limit: number
}

/**
 * Check if an IP has exceeded its rate limit.
 *
 * @param ip - The client IP address (from headers or X-Forwarded-For)
 * @param maxRequests - Maximum allowed requests in the window (default: 60)
 * @param windowMs - Window duration in milliseconds (default: 60_000 = 1 minute)
 * @returns RateLimitResult indicating if the request is allowed
 */
export function checkRateLimit(
  ip: string,
  maxRequests = 60,
  windowMs = 60_000,
): RateLimitResult {
  cleanup()

  const now = Date.now()
  let entry = store.get(ip)

  if (!entry) {
    entry = { timestamps: [] }
    store.set(ip, entry)
  }

  // Remove timestamps outside the current window
  const cutoff = now - windowMs
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  const current = entry.timestamps.length

  if (current >= maxRequests) {
    const oldest = entry.timestamps[0]
    const retryAfterMs = oldest + windowMs - now
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      current,
      limit: maxRequests,
    }
  }

  entry.timestamps.push(now)
  return {
    allowed: true,
    retryAfterSeconds: 0,
    current: current + 1,
    limit: maxRequests,
  }
}

/**
 * Middleware-style helper for Next.js API routes.
 * Returns a Response if rate-limited, or null if allowed.
 *
 * @param request - The incoming Next.js request
 * @param maxRequests - Max requests per window (default: 60)
 * @param windowMs - Window in ms (default: 60_000)
 * @returns NextResponse (rate limited) or null (allowed)
 */
export function rateLimitMiddleware(
  request: Request,
  maxRequests = 60,
  windowMs = 60_000,
): { allowed: boolean; retryAfterSeconds?: number } {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  const result = checkRateLimit(ip, maxRequests, windowMs)

  if (!result.allowed) {
    return { allowed: false, retryAfterSeconds: result.retryAfterSeconds }
  }

  return { allowed: true }
}