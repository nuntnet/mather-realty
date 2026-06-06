import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { requireAdmin } from '@/lib/admin-auth'

export const maxDuration = 30

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  const key = process.env.GOOGLE_AI_API_KEY
  if (!key) return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not set' }, { status: 400 })

  try {
    const start = Date.now()
    const gemini = new OpenAI({
      apiKey: key,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    })
    const c = await gemini.chat.completions.create({
      model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Reply with just the word: OK' }],
    })
    const elapsed = Date.now() - start
    const reply = c.choices[0]?.message?.content ?? '(empty)'
    return NextResponse.json({ ok: true, reply, model: c.model, elapsed_ms: elapsed })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 })
  }
}
