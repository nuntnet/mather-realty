import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getProperty } from '@/lib/notion'
import { Client } from '@notionhq/client'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

async function callAI(prompt: string): Promise<string> {
  const hermesUrl = process.env.HERMES_URL
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  const system = 'You are a professional real estate copywriter for DoubleN Realty, a premium rental platform for expats in Thailand. Return ONLY valid JSON — no markdown, no code blocks, no explanation.'

  if (hermesUrl) {
    const res = await fetch(`${hermesUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer no-key' },
      body: JSON.stringify({
        model: process.env.HERMES_MODEL ?? 'cc/sonnet',
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })
    if (!res.ok) throw new Error(`Hermes: ${await res.text()}`)
    return (await res.json()).choices[0]?.message?.content ?? ''
  }

  if (anthropicKey) {
    const a = new Anthropic({ apiKey: anthropicKey })
    const msg = await a.messages.create({
      model: 'claude-3-5-haiku-20241022', max_tokens: 3000,
      system, messages: [{ role: 'user', content: prompt }],
    })
    return msg.content[0]?.type === 'text' ? msg.content[0].text : ''
  }

  if (openaiKey) {
    const o = new OpenAI({ apiKey: openaiKey })
    const c = await o.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 3000, temperature: 0.7,
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    })
    return c.choices[0]?.message?.content ?? ''
  }

  throw new Error('No AI provider configured. Set HERMES_URL, ANTHROPIC_API_KEY, or OPENAI_API_KEY.')
}

function parseJSON(raw: string) {
  try { return JSON.parse(raw) } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Invalid JSON from AI')
  }
}

function chunkRichText(text: string) {
  const chunks = []
  for (let i = 0; i < text.length; i += 1990)
    chunks.push({ text: { content: text.slice(i, i + 1990) } })
  return chunks
}

const LOCALE_NAMES: Record<string, string> = {
  'zh-CN': 'Simplified Chinese', 'zh-TW': 'Traditional Chinese',
  'ja': 'Japanese', 'ko': 'Korean', 'ru': 'Russian', 'de': 'German',
  'fr': 'French', 'es': 'Spanish', 'it': 'Italian', 'nl': 'Dutch',
  'sv': 'Swedish', 'ar': 'Arabic', 'hi': 'Hindi',
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { propertyId, action, data: saveData, locales, titleEn, descriptionEn } = await req.json()
  if (!propertyId && action !== 'translate') return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

  // ── TRANSLATE action ─────────────────────────────────────────────────────────
  if (action === 'translate') {
    if (!titleEn || !descriptionEn || !locales?.length)
      return NextResponse.json({ error: 'titleEn, descriptionEn, locales required' }, { status: 400 })

    const targetList = (locales as string[]).map(l => `"${l}": { "title": "...", "description": "..." }`).join(',\n  ')
    const langList = (locales as string[]).map(l => `${l} = ${LOCALE_NAMES[l] ?? l}`).join(', ')

    const prompt = `Translate the following English property listing to these languages: ${langList}

English title: ${titleEn}
English description: ${descriptionEn}

Return ONLY a JSON object with locale codes as keys. Keep titles under 10 words. Keep descriptions natural and culturally appropriate (not literal word-for-word). Format:
{
  ${targetList}
}`

    try {
      const raw = await callAI(prompt)
      const translations = parseJSON(raw)
      return NextResponse.json({ success: true, translations })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 502 })
    }
  }

  // ── SAVE action — write pre-approved content to Notion ─────────────────────
  if (action === 'save') {
    const notion = new Client({ auth: process.env.NOTION_API_KEY })
    const updates: Record<string, unknown> = {}

    const rt = (s: string) => ({ rich_text: chunkRichText(s) })

    // Core fields
    if (saveData.title_en)    updates.title_en    = rt(saveData.title_en)
    if (saveData.title_th)    updates.title_th    = rt(saveData.title_th)
    if (saveData.description_en) updates.description_en = rt(saveData.description_en)
    if (saveData.description_th) updates.description_th = rt(saveData.description_th)
    if (saveData.seoDescription) updates.seo_description = rt(saveData.seoDescription)
    if (saveData.faqItems)    updates.faq_json    = rt(JSON.stringify(saveData.faqItems))
    if (saveData.personaDescriptions)
      updates.persona_descriptions = rt(JSON.stringify(saveData.personaDescriptions))

    // Additional locale translations from the translate step
    const ALL_LOCALES = ['zh-CN','zh-TW','ja','ko','ru','de','fr','es','it','nl','sv','ar','hi']
    for (const loc of ALL_LOCALES) {
      const safeKey = loc.replace('-', '_')
      if (saveData[`title_${safeKey}`]) updates[`title_${loc}`] = rt(saveData[`title_${safeKey}`])
      if (saveData[`description_${safeKey}`]) updates[`description_${loc}`] = rt(saveData[`description_${safeKey}`])
    }

    await notion.pages.update({
      page_id: propertyId,
      properties: updates as Parameters<typeof notion.pages.update>[0]['properties'],
    })
    return NextResponse.json({ success: true })
  }

  // ── GENERATE action — get property and call AI ─────────────────────────────
  // Retrieve page → get slug → full property
  let property
  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY })
    const page = await notion.pages.retrieve({ page_id: propertyId }) as { properties: Record<string, { type: string; rich_text?: Array<{ plain_text: string }> }> }
    const slugProp = page.properties['slug']
    const slug = slugProp?.rich_text?.map(r => r.plain_text).join('') ?? ''
    if (!slug) return NextResponse.json({ error: 'Property has no slug' }, { status: 400 })
    property = await getProperty(slug, 'en')
    if (!property) throw new Error('Property not found')
  } catch (e) {
    return NextResponse.json({ error: `Could not load property: ${(e as Error).message}` }, { status: 500 })
  }

  const ctx = {
    title: property!.title.en,
    address: property.address,
    city: property.city,
    district: property.district,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeSqm: property.sizeSqm,
    floors: property.floors,
    parkingSpots: property.parkingSpots,
    priceTHB: property.priceTHB,
    amenities: property.amenities.join(', '),
    highlights: property.highlights.join(' | '),
    perfectFor: property.perfectFor.join(', '),
    tags: property.tags.join(', '),
    status: property.status,
  }

  const prompt = `Property data: ${JSON.stringify(ctx)}

Generate the following in JSON format:

{
  "title_en": "Catchy 6-10 word English title highlighting best feature",
  "title_th": "Thai translation of the title (natural Thai, not literal)",
  "description_en": "4-6 sentence English description. Start with the most compelling feature. Mention location, lifestyle, and who it suits best. Include specific amenities. End with a call to action. 120-180 words.",
  "description_th": "Thai translation of description_en (natural Thai, culturally appropriate, same length)",
  "seoDescription": "150-character SEO meta description including city, property type, and key feature",
  "faqItems": [
    {"q": "Question relevant to expat renters", "a": "Helpful answer"},
    {"q": "Question about location/transport", "a": "Answer"},
    {"q": "Question about lease/rental terms", "a": "Answer"},
    {"q": "Question about amenities or utilities", "a": "Answer"},
    {"q": "Question about pets/families/lifestyle", "a": "Answer"}
  ],
  "personaDescriptions": {
    "family": "2-sentence why this suits families",
    "expat-couple": "2-sentence why this suits expat couples",
    "remote-worker": "2-sentence why this suits remote workers",
    "teacher": "2-sentence why this suits teachers"
  }
}`

  try {
    const raw = await callAI(prompt)
    const generated = parseJSON(raw)
    return NextResponse.json({ success: true, generated })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
