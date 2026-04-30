/**
 * CSRF protection via Origin/Referer header validation.
 *
 * Checks that incoming state-mutating requests originate from the
 * app's own domain, preventing cross-site request forgery.
 *
 * In development, we also allow common localhost origins.
 */

// Origins that are always allowed (in addition to the dynamic production origin)
const ALLOWED_ORIGINS = new Set<string>([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
])

/**
 * Validate the Origin header of an incoming request.
 *
 * @param request - The incoming Request object
 * @returns An object with `valid: boolean` and an optional `error` message
 */
export function validateOrigin(request: Request): { valid: boolean; error?: string } {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // If both Origin and Referer are missing, this is likely a direct API call
  // (e.g., from a server-side cron job or curl). Allow it.
  if (!origin && !referer) {
    return { valid: true }
  }

  // Check Origin first (it's more reliable than Referer)
  if (origin) {
    if (ALLOWED_ORIGINS.has(origin)) {
      return { valid: true }
    }

    // Allow the production origin (from the request's own host)
    try {
      const requestUrl = new URL(request.url)
      const productionOrigin = `${requestUrl.protocol}//${requestUrl.host}`
      if (origin === productionOrigin) {
        return { valid: true }
      }
    } catch {
      // If we can't parse the URL, fall through to the error
    }

    return { valid: false, error: `Origin "${origin}" is not allowed` }
  }

  // Fall back to Referer if no Origin header
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`

      if (ALLOWED_ORIGINS.has(refererOrigin)) {
        return { valid: true }
      }

      const requestUrl = new URL(request.url)
      const productionOrigin = `${requestUrl.protocol}//${requestUrl.host}`
      if (refererOrigin === productionOrigin) {
        return { valid: true }
      }
    } catch {
      return { valid: false, error: 'Invalid Referer header' }
    }

    return { valid: false, error: 'Referer does not match allowed origins' }
  }

  return { valid: true }
}

/**
 * Middleware-style helper that returns an error response if CSRF check fails.
 * Returns null if the request is valid.
 *
 * @param request - The incoming Request
 * @param method - HTTP method to check (default: only check for POST/PUT/PATCH/DELETE)
 * @returns Response (CSRF failure) or null (allowed)
 */
export function csrfMiddleware(
  request: Request,
  method?: string,
): Response | null {
  const checkMethod = method ?? request.method
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(checkMethod)) {
    return null
  }

  const result = validateOrigin(request)
  if (!result.valid) {
    return new Response(
      JSON.stringify({ error: result.error ?? 'CSRF validation failed' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Protected': 'true',
        },
      },
    )
  }

  return null
}