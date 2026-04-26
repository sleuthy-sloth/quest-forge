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

export const PRIMARY_MODEL = 'openrouter/free'

// ── Core generation function ────────────────────────────────────────────────

export interface GenerationPrompt {
  system: string
  user: string
  maxTokens?: number
  temperature?: number
}

/**
 * Generates text using Gemini Flash (primary) with OpenRouter fallback.
 * Returns null if both providers fail or are unavailable.
 */
export async function generateWithFallback(
  prompt: GenerationPrompt
): Promise<string | null> {
  const maxTokens = prompt.maxTokens ?? 200
  const temperature = prompt.temperature ?? 0.85

  // Primary: Gemini Flash
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
        console.log('[ai] gemini-2.0-flash served the request')
        return text
      }
      console.warn('[ai] Gemini returned empty response, trying OpenRouter')
    } catch (err) {
      console.warn('[ai] Gemini failed:', err)
    }
  } else {
    console.warn('[ai] GEMINI_API_KEY not set — skipping Gemini')
  }

  // Fallback: OpenRouter
  if (openRouterClient) {
    try {
      const response = await openRouterClient.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        max_tokens: maxTokens,
        temperature,
      })
      const text = response.choices[0]?.message?.content?.trim()
      if (text) {
        console.log(`[ai] OpenRouter (${PRIMARY_MODEL}) served the request`)
        return text
      }
      console.warn('[ai] OpenRouter returned empty response')
    } catch (err) {
      console.warn('[ai] OpenRouter fallback failed:', err)
    }
  } else {
    console.warn('[ai] OPENROUTER_API_KEY not set — no fallback available')
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
