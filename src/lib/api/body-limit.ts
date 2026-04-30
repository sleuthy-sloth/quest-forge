/**
 * Request body size limiting.
 *
 * For AI generation routes and other endpoints that accept user-submitted
 * text, we validate Content-Length before any parsing to prevent abuse
 * and memory issues.
 */

/**
 * Default maximum body size in bytes (100 KB).
 */
export const DEFAULT_MAX_BODY_SIZE = 100_000

/**
 * Maximum body size for AI generation routes (10 KB — prompts are small).
 */
export const AI_MAX_BODY_SIZE = 10_000

/**
 * Check if the request body size is within acceptable limits.
 *
 * Reads Content-Length header first (most efficient). Falls back to
 * reading the body if Content-Length is missing (less efficient).
 *
 * @param request - The incoming Request
 * @param maxBytes - Maximum allowed body size in bytes (default: 100 KB)
 * @returns An object with `valid: boolean` and optional `error`
 */
export async function checkBodySize(
  request: Request,
  maxBytes = DEFAULT_MAX_BODY_SIZE,
): Promise<{ valid: boolean; error?: string }> {
  // Try Content-Length header first (O(1) check)
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (!isNaN(size) && size > maxBytes) {
      return {
        valid: false,
        error: `Request body too large. Maximum is ${maxBytes} bytes, received ${size} bytes.`,
      }
    }
    return { valid: true }
  }

  // No Content-Length header — read the body to check size
  // We clone the request so the original can still be used
  try {
    const cloned = request.clone()
    const text = await cloned.text()
    const bytes = new TextEncoder().encode(text).length

    if (bytes > maxBytes) {
      return {
        valid: false,
        error: `Request body too large. Maximum is ${maxBytes} bytes.`,
      }
    }
    return { valid: true }
  } catch {
    // If we can't check, allow it (better than false positive)
    return { valid: true }
  }
}

/**
 * Middleware-style helper. Returns a Response if body is too large, or null.
 */
export async function bodyLimitMiddleware(
  request: Request,
  maxBytes = DEFAULT_MAX_BODY_SIZE,
): Promise<Response | null> {
  const result = await checkBodySize(request, maxBytes)
  if (!result.valid) {
    return new Response(
      JSON.stringify({ error: result.error }),
      {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
  return null
}