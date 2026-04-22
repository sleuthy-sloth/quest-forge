import OpenAI from 'openai'

const openai = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  : null

const { GoogleGenerativeAI } = require('@google/generative-ai')
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export const aiClient = openai
export const geminiModel = genAI
  ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  : null

export const PRIMARY_MODEL = 'openrouter/free'

export async function generateWithFallback(prompt: {
  system: string
  user: string
}): Promise<string | null> {
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        max_tokens: 200,
        temperature: 0.85,
      })
      const text = response.choices[0]?.message?.content?.trim()
      if (text) return text
    } catch (err) {
      console.warn('[ai] OpenRouter failed:', err)
    }
  }

  if (geminiModel) {
    try {
      const result = await geminiModel.generateContent({
        systemInstruction: prompt.system,
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.85,
          topP: 0.95,
        },
      })
      const text = result.response.text().trim()
      if (text) return text
    } catch (err) {
      console.warn('[ai] Gemini fallback failed:', err)
    }
  }

  return null
}