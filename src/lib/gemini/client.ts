import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing env var: GEMINI_API_KEY')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Gemini 2.0 Flash model instance.
 * All Embervale AI features route through this single export.
 */
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
