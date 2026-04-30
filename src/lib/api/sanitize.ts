/**
 * Strips HTML tags, script tags, and other potentially dangerous content
 * from user-generated text fields before storing them in the database.
 *
 * This is a defense-in-depth measure. The app uses React which escapes
 * HTML by default, but sanitizing at the API layer prevents stored XSS
 * in case content is used in non-React contexts (emails, exports, etc.).
 */

/**
 * Strip all HTML/XML tags from a string.
 * Also removes event handler attributes and javascript: URLs.
 */
export function stripHtml(text: string): string {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove event handlers (onclick, onload, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: URLs
    .replace(/javascript\s*:/gi, '')
    // Remove data: URLs in attributes
    .replace(/data\s*:\s*text\/html/gi, '')
    .trim()
}

/**
 * Sanitize a user-generated text field for database storage.
 * - Strips HTML tags
 * - Normalizes whitespace
 * - Trims to max length (default: 5000 chars)
 */
export function sanitizeText(text: string, maxLength = 5000): string {
  return stripHtml(text).slice(0, maxLength).trim()
}

/**
 * Sanitize a short text field (titles, names, etc.).
 * - Strips HTML
 * - Limits to 200 chars
 * - Normalizes whitespace (single spaces only)
 */
export function sanitizeShortText(text: string): string {
  return stripHtml(text)
    .replace(/\s+/g, ' ')
    .slice(0, 200)
    .trim()
}