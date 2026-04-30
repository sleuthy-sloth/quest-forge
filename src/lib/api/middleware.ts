/**
 * Combined API middleware helpers.
 *
 * Provides a clean, chainable way to apply rate limiting, CSRF protection,
 * body size limits, and text sanitization to API route handlers.
 *
 * Usage:
 *   import { withApiMiddleware, sanitizeBody } from '@/lib/api/middleware'
 *
 *   export async function POST(request: Request) {
 *     const check = await withApiMiddleware(request, { rateLimit: true, csrf: true })
 *     if (check) return check  // error response
 *
 *     const body = await request.json()
 *     const clean = sanitizeBody(body, ['title', 'description'])
 *     // ... proceed with clean data
 *   }
 */

import { rateLimitMiddleware } from './rate-limiter'
import { csrfMiddleware } from './csrf'
import { bodyLimitMiddleware, AI_MAX_BODY_SIZE } from './body-limit'
import { sanitizeText, sanitizeShortText } from './sanitize'
export { AI_MAX_BODY_SIZE, DEFAULT_MAX_BODY_SIZE } from './body-limit'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface ApiMiddlewareOptions {
  /** Apply per-IP rate limiting (default: false) */
  rateLimit?: boolean | { maxRequests?: number; windowMs?: number }
  /** Apply Origin/Referer CSRF check (default: false for GET, true for POST/PUT/PATCH/DELETE) */
  csrf?: boolean
  /** Apply body size limit (default: false). Set to true to use default, or pass a number in bytes. */
  bodyLimit?: boolean | number
  /** HTTP method override (auto-detected from request if not provided) */
  method?: string
}

// ---------------------------------------------------------------------------
// Combined check
// ---------------------------------------------------------------------------

/**
 * Run all configured middleware checks against the request.
 * Returns a Response (error) if any check fails, or null if all pass.
 *
 * @example
 *   const err = await withApiMiddleware(request, {
 *     rateLimit: { maxRequests: 30 },
 *     csrf: true,
 *     bodyLimit: true,
 *   })
 *   if (err) return err
 */
export async function withApiMiddleware(
  request: Request,
  options: ApiMiddlewareOptions = {},
): Promise<Response | null> {
  const method = options.method ?? request.method

  // 1. CSRF check
  if (options.csrf !== false || ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfResult = csrfMiddleware(request, method)
    if (csrfResult) return csrfResult
  }

  // 2. Rate limit
  if (options.rateLimit) {
    const rlOpts = typeof options.rateLimit === 'object' ? options.rateLimit : {}
    const rlResult = rateLimitMiddleware(
      request,
      rlOpts.maxRequests ?? 60,
      rlOpts.windowMs ?? 60_000,
    )
    if (!rlResult.allowed) {
      return new Response(
        JSON.stringify({
          error: `Too many requests. Retry after ${rlResult.retryAfterSeconds} seconds.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rlResult.retryAfterSeconds ?? 60),
          },
        },
      )
    }
  }

  // 3. Body size limit
  if (options.bodyLimit) {
    const maxBytes = typeof options.bodyLimit === 'number' ? options.bodyLimit : undefined
    const bodyResult = await bodyLimitMiddleware(request, maxBytes)
    if (bodyResult) return bodyResult
  }

  return null
}

// ---------------------------------------------------------------------------
// Sanitization helpers
// ---------------------------------------------------------------------------

/**
 * Sanitize specific fields in a parsed request body object.
 * Recursively walks nested objects and arrays to sanitize matching keys.
 *
 * @param body - The parsed JSON body object
 * @param fields - Array of field names to sanitize (e.g. ['title', 'description'])
 * @returns A new object with sanitized text in the specified fields
 */
export function sanitizeBody<T extends Record<string, unknown>>(
  body: T,
  fields: string[],
): T {
  const result = { ...body }

  for (const [key, value] of Object.entries(result)) {
    if (fields.includes(key) && typeof value === 'string') {
      if (value.length > 200) {
        ;(result as Record<string, unknown>)[key] = sanitizeText(value)
      } else {
        ;(result as Record<string, unknown>)[key] = sanitizeShortText(value)
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      ;(result as Record<string, unknown>)[key] = sanitizeBody(
        value as Record<string, unknown>,
        fields,
      )
    } else if (Array.isArray(value)) {
      ;(result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeBody(item as Record<string, unknown>, fields)
          : item,
      )
    }
  }

  return result
}