import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ── Provider initialization ──────────────────────────────────────────────────

const openRouterClient = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  : null

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export const geminiModel = geminiClient
  ? geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' })
  : null

// ── Constants ────────────────────────────────────────────────────────────────

export const OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'

// ── Chain-of-thought filtering ──────────────────────────────────────────

/**
 * Strips reasoning / thinking blocks that some models emit alongside their
 * final answer.  Handles:
 *   - <reasoning>…</reasoning> / <think>…</think> / <thought>…</thought> XML tags
 *   - ```thinking … ``` fenced blocks
 *   - Raw untagged prose thinking followed by a JSON object (edu challenges)
 *   - Raw untagged prose thinking followed by a quoted prose answer (flavor text)
 *     — Nemotron emits chain-of-thought as free-form prose without XML tags;
 *       we detect it by looking for the last substantial double-quoted block.
 */
export function stripThinking(text: string): string {
  let cleaned = text
    .replace(/<reasoning[\s\S]*?<\/reasoning>/gi, '')
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/<thought[\s\S]*?<\/thought>/gi, '')
    .replace(/```thinking[\s\S]*?```/gi, '')
    .replace(/<\/?think>|<\/?reasoning>/gi, '')
    .trim()

  // ── JSON extraction ──────────────────────────────────────────────────────────
  // Walk forward from each '{' and find the first balanced, parse-able JSON
  // block. A greedy /\{[\s\S]*\}/ would anchor to the first '{' which could be
  // inside thinking prose (e.g. "here's how {this} works").
  let hasValidJson = false
  if (cleaned.includes('{')) {
    const jsonBlock = extractFirstValidJson(cleaned)
    if (jsonBlock !== null) {
      hasValidJson = true
      const idx = cleaned.indexOf(jsonBlock)
      const before = cleaned.slice(0, idx).trim()
      
      // If the text before the JSON is just markdown fencing, empty, OR
      // if there's a lot of text (thinking prose), we extract just the JSON.
      if (before === '' || before.startsWith('```') || (idx > 50 && /[a-zA-Z]{4,}/.test(before))) {
        cleaned = jsonBlock
      }
    }
  }

  // ── Prose answer extraction ──────────────────────────────────────────────────
  // For non-JSON responses the model may emit thinking as untagged prose and
  // put the actual answer in a double-quoted block.  Take the last quoted block
  // that looks like a complete prose sentence (≥40 chars, contains punctuation).
  // We ONLY do this if we didn't find valid JSON, because this regex will
  // aggressively match string values inside JSON payloads and destroy the structure.
  if (!hasValidJson && !cleaned.trimStart().startsWith('{') && !cleaned.trimStart().startsWith('```')) {
    const prose = extractQuotedAnswer(cleaned)
    if (prose) cleaned = prose
  }

  return cleaned.trim()
}

/**
 * Walk through `text` and return the first balanced `{…}` substring that is
 * valid JSON.  Returns null if none is found.
 */
function extractFirstValidJson(text: string): string | null {
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue
    let depth = 0
    let j = i
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++
      else if (text[j] === '}') { depth--; if (depth === 0) break }
    }
    if (depth === 0) {
      const candidate = text.slice(i, j + 1)
      try { JSON.parse(candidate); return candidate } catch { /* not valid JSON, keep walking */ }
    }
  }
  return null
}

/**
 * Find the last double-quoted block in `text` that looks like a complete prose
 * answer (≥40 chars, contains a sentence-ending character).  Used to extract
 * the flavor-text answer when the model emits raw untagged thinking before it.
 */
function extractQuotedAnswer(text: string): string | null {
  const matches = Array.from(text.matchAll(/"([^"]{40,})"/g))
  for (let i = matches.length - 1; i >= 0; i--) {
    const candidate = matches[i][1].trim()
    if (candidate.includes(' ') && /[.!?]/.test(candidate)) {
      return candidate
    }
  }
  return null
}

// ── Core generation function ────────────────────────────────────────────────

export interface GenerationPrompt {
  system: string
  user: string
  maxTokens?: number
  temperature?: number
}

/**
 * Generates text using OpenRouter Nemotron (primary) with Gemini Flash
 * fallback.  Returns null if both providers fail or are unavailable.
 *
 * **Provider rationale:**
 * - OpenRouter Nemotron (`nvidia/nemotron-3-super-120b-a12b:free`) is the
 *   primary because its free tier has higher rate limits than Gemini's.
 * - Gemini 2.0 Flash (free tier: 1,500 req/day) acts as the secondary.
 * - The app-level daily rate limiter (`canMakeRequest` / `incrementUsage`)
 *   guards the combined budget.
 */
export async function generateWithFallback(
  prompt: GenerationPrompt
): Promise<string | null> {
  const maxTokens = prompt.maxTokens ?? 200
  const temperature = prompt.temperature ?? 0.85

  // ── Primary: OpenRouter (Nemotron) ─────────────────────────────────────────
  if (openRouterClient) {
    try {
      const response = await openRouterClient.chat.completions.create({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        max_tokens: maxTokens,
        temperature,
      })
      if (!response.choices?.length) {
        console.warn('[ai] OpenRouter returned response without choices:', JSON.stringify(response).slice(0, 500))
      } else {
        const text = stripThinking(response.choices[0]?.message?.content?.trim() ?? '')
        if (text) {
          return text
        }
        console.warn('[ai] OpenRouter returned empty response, trying Gemini')
      }
    } catch (err: unknown) {
      const status = (err as { status?: number }).status
      if (status === 404) {
        console.warn(
          `[ai] OpenRouter model "${OPENROUTER_MODEL}" not found (404). ` +
          `Check the model slug at https://openrouter.ai/models`,
        )
      } else {
        console.warn('[ai] OpenRouter failed:', err)
      }
    }
  } else {
    console.warn('[ai] OPENROUTER_API_KEY not set — skipping OpenRouter')
  }

  // ── Fallback: Gemini Flash ─────────────────────────────────────────────────
  if (geminiModel) {
    try {
      const result = await geminiModel.generateContent({
        systemInstruction: prompt.system,
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
          topP: 0.95,
        },
      })
      const text = stripThinking(result.response.text().trim())
      if (text) {
        return text
      }
      console.warn('[ai] Gemini returned empty response')
    } catch (err) {
      console.warn('[ai] Gemini fallback failed:', err)
    }
  } else {
    console.warn('[ai] GEMINI_API_KEY not set — no fallback')
  }

  return null
}

/**
 * Direct OpenRouter call for model-specific requests.
 * Returns null if OpenRouter is unavailable or the call fails.
 */
export async function callOpenRouter(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  maxTokens = 200,
  temperature = 0.85
): Promise<string | null> {
  if (!openRouterClient) return null

  try {
    const response = await openRouterClient.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    })
    return response.choices[0]?.message?.content?.trim() ?? null
  } catch (err) {
    console.warn(`[ai] OpenRouter call failed (model: ${model}):`, err)
    return null
  }
}
