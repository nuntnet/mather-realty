import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 30

// Public diagnostic endpoint — no auth required (returns no sensitive data)
export async function GET() {
  const key = process.env.GOOGLE_AI_API_KEY
  if (!key) {
    return NextResponse.json({
      ok: false,
      error: 'GOOGLE_AI_API_KEY is not set in this environment',
      hint: 'Add it in Vercel → Settings → Environment Variables (Preview environment)',
    }, { status: 400 })
  }

  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite'
  try {
    const start = Date.now()
    const gemini = new OpenAI({
      apiKey: key,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    })
    const c = await gemini.chat.completions.create({
      model,
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Reply with only the word: OK' }],
    })
    const reply = c.choices[0]?.message?.content ?? '(empty)'
    return NextResponse.json({
      ok: true,
      reply,
      model,
      elapsed_ms: Date.now() - start,
      key_prefix: key.slice(0, 8) + '…',
    })
  } catch (e) {
    const msg = (e as Error).message ?? ''
    const is429 = msg.includes('429')
    return NextResponse.json({
      ok: false,
      error: is429
        ? 'Quota exceeded (429). Your GCP project has free-tier quota set to 0. Fix: create a new key at https://aistudio.google.com/app/apikey (use a project WITHOUT billing enabled) and update GOOGLE_AI_API_KEY in Vercel.'
        : msg,
      key_prefix: key.slice(0, 8) + '…',
      model,
    }, { status: is429 ? 429 : 502 })
  }
}
