import OpenAI from 'openai'

// ── Provider initialization ──────────────────────────────────────────────────

const openRouterClient = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  : null

// ── Constants ────────────────────────────────────────────────────────────────

export const OPENROUTER_MODEL = 'openrouter/free'

/**
 * Strips reasoning / thinking blocks that various AI models emit alongside
 * their final answer.  Since `openrouter/free` routes to arbitrary models
 * (GPT, Llama, Mistral, DeepSeek, Qwen, etc.), we handle every known pattern:
 *
 *   - XML tags: <think>, <thinking>, <reasoning>, <thought>, <reflection>,
 *     <scratchpad>, <internal_thought>  (and their closing tags)
 *   - Fenced blocks: ```thinking … ```, ```reasoning … ```
 *   - Markdown headers: lines starting with ## Thinking, ## Reasoning, etc.
 *     followed by content until the next ## or the end of thinking
 *   - <output> / <answer> wrappers: some models wrap the real answer in these
 *   - Untagged prose preambles: "Let me think...", "Okay, so the user wants..."
 *     followed by a JSON payload or quoted answer
 */
export function stripThinking(text: string): string {
  let cleaned = text
    // ── XML-tagged thinking (greedy within tags) ──────────────────────────
    .replace(/<thinking[\s\S]*?<\/thinking>/gi, '')
    .replace(/<reasoning[\s\S]*?<\/reasoning>/gi, '')
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/<thought[\s\S]*?<\/thought>/gi, '')
    .replace(/<reflection[\s\S]*?<\/reflection>/gi, '')
    .replace(/<scratchpad[\s\S]*?<\/scratchpad>/gi, '')
    .replace(/<internal_thought[\s\S]*?<\/internal_thought>/gi, '')
    // ── Orphaned opening/closing XML tags ─────────────────────────────────
    .replace(/<\/?(?:think|thinking|reasoning|thought|reflection|scratchpad|internal_thought)>/gi, '')
    // ── Fenced thinking blocks ───────────────────────────────────────────
    .replace(/```(?:thinking|reasoning)[\s\S]*?```/gi, '')
    .trim()

  // ── Extract content from <output> or <answer> wrappers ─────────────────
  // Some models wrap the actual answer in <output>…</output> or <answer>…</answer>
  const outputMatch = cleaned.match(/<(?:output|answer|response)>([\s\S]*?)<\/(?:output|answer|response)>/i)
  if (outputMatch) {
    cleaned = outputMatch[1].trim()
  }

  // ── JSON extraction ──────────────────────────────────────────────────────
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

  // ── Prose answer extraction ──────────────────────────────────────────────
  // For non-JSON responses the model may emit thinking as untagged prose and
  // put the actual answer in a double-quoted block.  Take the last quoted block
  // that looks like a complete prose sentence (≥40 chars, contains punctuation).
  // We ONLY do this if we didn't find valid JSON, because this regex will
  // aggressively match string values inside JSON payloads and destroy the structure.
  if (!hasValidJson && !cleaned.trimStart().startsWith('{') && !cleaned.trimStart().startsWith('```')) {
    const prose = extractQuotedAnswer(cleaned)
    if (prose) cleaned = prose
  }

  // ── Strip markdown fences from the final result ────────────────────────
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  return cleaned
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
 * Generates text via OpenRouter's free model router (`openrouter/free`).
 * OpenRouter automatically selects the best available free model for
 * each request, handling model availability and fallback internally.
 *
 * Returns null if the API key is missing or the call fails.
 */
export async function generateWithFallback(
  prompt: GenerationPrompt
): Promise<string | null> {
  if (!openRouterClient) {
    console.warn('[ai] OPENROUTER_API_KEY not set — cannot generate')
    return null
  }

  const maxTokens = prompt.maxTokens ?? 200
  const temperature = prompt.temperature ?? 0.85

  try {
    console.log(`[ai] calling OpenRouter (${OPENROUTER_MODEL})...`)
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
      return null
    }

    const raw = response.choices[0]?.message?.content?.trim() ?? ''
    const text = stripThinking(raw)
    if (text) {
      // Log which model OpenRouter actually selected
      const actualModel = (response as unknown as { model?: string }).model ?? 'unknown'
      console.log(`[ai] OpenRouter (routed to ${actualModel}) returned ${text.length} chars`)
      return text
    }

    console.warn('[ai] OpenRouter returned empty parsed response')
    return null
  } catch (err: unknown) {
    console.warn('[ai] OpenRouter failed:', err)
    return null
  }
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
    const raw = response.choices[0]?.message?.content?.trim() ?? null
    return raw ? stripThinking(raw) : null
  } catch (err) {
    console.warn(`[ai] OpenRouter call failed (model: ${model}):`, err)
    return null
  }
}
