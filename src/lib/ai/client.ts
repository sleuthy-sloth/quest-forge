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
        const text = response.choices[0]?.message?.content?.trim()
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
      const text = result.response.text().trim()
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
