import { NextRequest, NextResponse } from 'next/server'
export const maxDuration = 60  // Allow up to 60s for AI generation (requires Vercel Pro)
import { requireAdmin } from '@/lib/admin-auth'
import { Client } from '@notionhq/client'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

async function callAI(prompt: string): Promise<string> {
  const hermesUrl    = process.env.HERMES_URL
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey    = process.env.OPENAI_API_KEY
  const geminiKey    = process.env.GOOGLE_AI_API_KEY   // Gemini API key

  const system = 'You are a professional real estate copywriter for DoubleN Realty, a premium rental platform for expats in Thailand. Return ONLY valid JSON — no markdown, no code blocks, no explanation.'

  // 1. Hermes local adapter (dev)
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

  // 2. Google Gemini via OpenAI-compatible endpoint — with model fallback on quota errors
  if (geminiKey) {
    const gemini = new OpenAI({
      apiKey: geminiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    })
    // Try models in order; fall through to next on 429 quota exhaustion
    const MODELS = process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL]
      : ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash']
    let lastErr: Error | null = null
    for (const model of MODELS) {
      try {
        const c = await gemini.chat.completions.create({
          model,
          max_tokens: 8192,
          temperature: 0.7,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        })
        return c.choices[0]?.message?.content ?? ''
      } catch (e) {
        const msg = (e as Error).message ?? ''
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`[callAI] ${model} quota exhausted, trying next model`)
          lastErr = e as Error
          continue
        }
        throw e // non-quota error, don't retry
      }
    }
    throw lastErr ?? new Error('All Gemini models quota exhausted')
  }

  // 3. Anthropic Claude
  if (anthropicKey) {
    const a = new Anthropic({ apiKey: anthropicKey })
    const msg = await a.messages.create({
      model: 'claude-3-5-haiku-20241022', max_tokens: 3000,
      system, messages: [{ role: 'user', content: prompt }],
    })
    return msg.content[0]?.type === 'text' ? msg.content[0].text : ''
  }

  // 4. OpenAI
  if (openaiKey) {
    const o = new OpenAI({ apiKey: openaiKey })
    const c = await o.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 3000, temperature: 0.7,
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    })
    return c.choices[0]?.message?.content ?? ''
  }

  const configured = [
    hermesUrl    ? 'HERMES_URL'          : null,
    geminiKey    ? 'GOOGLE_AI_API_KEY'   : null,
    anthropicKey ? 'ANTHROPIC_API_KEY'   : null,
    openaiKey    ? 'OPENAI_API_KEY'      : null,
  ].filter(Boolean)
  throw new Error(
    configured.length
      ? `AI call failed — provider(s) present: ${configured.join(', ')}`
      : 'No AI provider configured. Set GOOGLE_AI_API_KEY (Gemini), OPENAI_API_KEY, or ANTHROPIC_API_KEY in Vercel environment variables.'
  )
}

function parseJSON(raw: string) {
  // Strip markdown code fences if present
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try { return JSON.parse(stripped) } catch { /* fall through */ }
  // Try extracting first {...} block (handles leading/trailing text)
  const match = stripped.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch { /* fall through */ }
  }
  throw new Error(`Invalid JSON from AI (length ${raw.length}): ${raw.slice(0, 120)}…`)
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

  const {
    propertyId, action, field, locale: reqLocale,
    data: saveData, locales, titleEn, descriptionEn,
    // translate-all payload
    highlightsEn, seoEn, faqEn, personasEn,
    targetLocale,  // single locale for translate-all (replaces ALL_LOCALES)
  } = await req.json()
  if (!propertyId && !['translate','translate-all'].includes(action))
    return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

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

  // ── TRANSLATE-ALL action — translate every field to all 14 non-EN locales ────
  if (action === 'translate-all') {
    if (!titleEn) return NextResponse.json({ error: 'titleEn is required' }, { status: 400 })

    // Single locale mode (new) or all-14 mode (legacy)
    const TARGET_LOCALES = targetLocale
      ? [targetLocale as string]
      : ['th','zh-CN','zh-TW','ja','ko','ru','de','fr','es','it','nl','sv','ar','hi']

    const langList = TARGET_LOCALES.map(l => `${l}=${LOCALE_NAMES[l] ?? l}`).join(', ')
    const langName = TARGET_LOCALES.length === 1
      ? (LOCALE_NAMES[TARGET_LOCALES[0]] ?? TARGET_LOCALES[0])
      : `${TARGET_LOCALES.length} languages`

    // Helper: translate titles + descriptions
    async function translateTitleDesc() {
      const targetList = TARGET_LOCALES.map(l => `"${l}":{"title":"...","description":"..."}`).join(',\n  ')
      const prompt = `Translate this property listing to ${langName} (${langList}).

Title (EN): ${titleEn}
Description (EN): ${descriptionEn ?? '(none)'}

Return ONLY JSON: {\n  ${targetList}\n}`
      const raw = await callAI(prompt)
      return parseJSON(raw) as Record<string, { title: string; description: string }>
    }

    // Helper: translate short text (highlights, SEO) for all locales
    async function translateShort(label: string, textEn: string) {
      const targetList = TARGET_LOCALES.map(l => `"${l}":"..."`).join(', ')
      const prompt = `Translate this ${label} text to these languages (${langList}). Keep translations natural and culturally appropriate.

English: ${textEn}

Return ONLY JSON: {${targetList}}`
      const raw = await callAI(prompt)
      return parseJSON(raw) as Record<string, string>
    }

    // Helper: translate FAQ array
    async function translateFaq(faqItems: Array<{q: string; a: string}>) {
      const targetList = TARGET_LOCALES.map(l => `"${l}":[{"q":"...","a":"..."}]`).join(',\n  ')
      const prompt = `Translate these FAQ items to ${langName} (${langList}).

FAQ (EN): ${JSON.stringify(faqItems)}

Return ONLY JSON: {\n  ${targetList}\n}
Each locale should have an array of the same number of FAQ items.`
      const raw = await callAI(prompt)
      return parseJSON(raw) as Record<string, Array<{q: string; a: string}>>
    }

    try {
      // Run all translations in parallel
      const results: {
        titleDesc?: Record<string, { title: string; description: string }>
        highlights?: Record<string, string>
        seo?: Record<string, string>
        faq?: Record<string, Array<{q: string; a: string}>>
        personas?: Record<string, string>
      } = {}

      const tasks: Promise<void>[] = [
        translateTitleDesc().then(r => { results.titleDesc = r }).catch(() => {}),
      ]
      if (highlightsEn) tasks.push(translateShort('property highlights (keep as bullet points separated by newlines)', highlightsEn).then(r => { results.highlights = r }).catch(() => {}))
      if (seoEn) tasks.push(translateShort('SEO meta description (max 160 chars)', seoEn).then(r => { results.seo = r }).catch(() => {}))
      if (faqEn?.length) tasks.push(translateFaq(faqEn).then(r => { results.faq = r }).catch(() => {}))
      if (personasEn) {
        // Use a dedicated prompt that returns locale → JSON-string (not nested object)
        tasks.push((async () => {
          const targetList = TARGET_LOCALES.map(l => `"${l}":"<translated JSON string for ${l}>"`).join(',\n  ')
          const prompt = `Translate the VALUES inside this persona descriptions JSON to ${langName} (${langList}).
The INPUT is a JSON object where keys are persona types and values are 2-sentence descriptions.
For each target locale, return the ENTIRE translated JSON object as a JSON-encoded STRING (not a nested object).

Input personas JSON: ${personasEn}

Return ONLY: {
  ${targetList}
}
Each value must be a valid JSON string (escaped), e.g. "{\\"family\\":\\"...\\"}"  — NOT a nested object.`
          const raw = await callAI(prompt)
          const parsed = parseJSON(raw) as Record<string, unknown>
          // Ensure each value is a string
          const normalized: Record<string, string> = {}
          for (const [loc, val] of Object.entries(parsed)) {
            normalized[loc] = typeof val === 'string' ? val : JSON.stringify(val)
          }
          results.personas = normalized
        })().catch(() => {}))
      }

      await Promise.all(tasks)

      // Save translations to Notion
      if (propertyId) {
        const notion = new Client({ auth: process.env.NOTION_API_KEY })
        const rt = (s: string) => ({ rich_text: chunkRichText(s) })
        const updates: Record<string, unknown> = {}

        for (const loc of TARGET_LOCALES) {
          const safeKey = loc.replace('-', '_')
          void safeKey // used for response key, not Notion key
          if (results.titleDesc?.[loc]?.title)       updates[`title_${loc}`]                     = rt(results.titleDesc[loc].title)
          if (results.titleDesc?.[loc]?.description) updates[`description_${loc}`]               = rt(results.titleDesc[loc].description)
          if (results.highlights?.[loc])             updates[`highlights_${loc}`]                 = rt(String(results.highlights[loc]).replace(/\n/g, ' • '))
          if (results.seo?.[loc])                    updates[`seo_description_${loc}`]            = rt(String(results.seo[loc]))
          if (results.faq?.[loc]?.length)            updates[`faq_json_${loc}`]                   = rt(JSON.stringify(results.faq[loc]))
          if (results.personas?.[loc])               updates[`persona_descriptions_${loc}`]       = rt(String(results.personas[loc]))
        }

        if (Object.keys(updates).length > 0) {
          await notion.pages.update({
            page_id: propertyId,
            properties: updates as Parameters<typeof notion.pages.update>[0]['properties'],
          }).catch(e => console.error('[translate-all] notion save error:', e))
        }
      }

      return NextResponse.json({ success: true, results, locales: TARGET_LOCALES })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 502 })
    }
  }

  // ── GENERATE-FIELD action — generate ONE field cheaply ───────────────────────
  // field: 'title_en' | 'description_en' | 'seo' | 'faq' | 'highlights'
  if (action === 'generate-field') {
    if (!field) return NextResponse.json({ error: 'field is required' }, { status: 400 })

    // Load property context from Notion (same as generate action)
    let ctx: Record<string, unknown>
    try {
      const notion = new Client({ auth: process.env.NOTION_API_KEY })
      const page = await notion.pages.retrieve({ page_id: propertyId }) as { properties: Record<string, unknown> }
      const p = page.properties as Record<string, { type: string; rich_text?: Array<{ plain_text: string }>; number?: number | null; multi_select?: Array<{ name: string }>; select?: { name: string } | null }>
      const rt = (key: string) => (p[key]?.rich_text ?? []).map((r: { plain_text: string }) => r.plain_text).join('')
      const num = (key: string) => p[key]?.number ?? null
      const ms = (key: string) => (p[key]?.multi_select ?? []).map((o: { name: string }) => o.name)
      ctx = {
        title: rt('title_en') || 'Property',
        address: rt('address'), city: rt('city'), district: rt('district'),
        bedrooms: num('bedrooms'), bathrooms: num('bathrooms'),
        sizeSqm: num('size_sqm'), floors: num('floors'),
        priceTHB: num('price_thb'),
        amenities: ms('amenities').join(', '),
        perfectFor: ms('perfect_for').join(', '),
        tags: ms('tags').join(', '),
      }
    } catch (e) {
      return NextResponse.json({ error: `Could not load property: ${(e as Error).message}` }, { status: 500 })
    }

    const ctxStr = JSON.stringify(ctx)

    // Resolve language name for the prompt
    const targetLocale = reqLocale ?? 'en'
    const langName = targetLocale === 'en' ? 'English'
      : LOCALE_NAMES[targetLocale] ?? targetLocale
    const langInstr = targetLocale === 'en' ? 'in English' : `in ${langName} (locale: ${targetLocale})`

    const FIELD_PROMPTS: Record<string, string> = {
      title_en:        `Property data: ${ctxStr}\n\nWrite a catchy property listing title ${langInstr} (6-10 words, highlight best feature). Return ONLY a JSON object: {"value": "..."}`,
      description_en:  `Property data: ${ctxStr}\n\nWrite a property description ${langInstr} (4-6 sentences, 120-180 words). Start with best feature, mention location, lifestyle, amenities, end with CTA. Return ONLY: {"value": "..."}`,
      seo:             `Property data: ${ctxStr}\n\nWrite a 150-character SEO meta description ${langInstr} (include city, property type, key feature). Return ONLY: {"value": "..."}`,
      highlights:      `Property data: ${ctxStr}\n\nList 4-6 key selling highlights ${langInstr} as short bullet points (each 3-8 words). Return ONLY: {"value": "highlight one\\nhighlight two\\nhighlight three"}`,
      faq:             `Property data: ${ctxStr}\n\nGenerate 5 FAQ items relevant to expat renters, written ${langInstr}. Return ONLY: {"value": [{"q": "...", "a": "..."}, ...]}`,
      personas:        `Property data: ${ctxStr}\n\nWrite 2-sentence "perfect for" descriptions for each persona, ${langInstr}. Return ONLY: {"value": {"family": "...", "expat-couple": "...", "remote-worker": "...", "teacher": "...", "retiree": "..."}}`,
    }

    const prompt = FIELD_PROMPTS[field]
    if (!prompt) return NextResponse.json({ error: `Unknown field: ${field}` }, { status: 400 })

    try {
      const raw = await callAI(prompt)
      const parsed = parseJSON(raw)
      const value = parsed.value

      // Auto-save per-locale content to Notion for locale-specific fields
      const localeFields = ['highlights', 'seo', 'faq', 'personas']
      if (localeFields.includes(field)) {
        try {
          const notion = new Client({ auth: process.env.NOTION_API_KEY })
          const rt = (s: string) => ({ rich_text: chunkRichText(s) })
          const updates: Record<string, unknown> = {}

          if (field === 'highlights') {
            const bulletStr = Array.isArray(value) ? value.join(' • ') : String(value).replace(/\n/g, ' • ')
            const notionKey = targetLocale === 'en' ? 'highlights' : `highlights_${targetLocale}`
            updates[notionKey] = rt(bulletStr)
          } else if (field === 'seo') {
            const notionKey = targetLocale === 'en' ? 'seo_description' : `seo_description_${targetLocale}`
            updates[notionKey] = rt(String(value))
          } else if (field === 'faq') {
            const notionKey = targetLocale === 'en' ? 'faq_json' : `faq_json_${targetLocale}`
            updates[notionKey] = rt(JSON.stringify(value))
          } else if (field === 'personas') {
            const personaStr = typeof value === 'string' ? value : JSON.stringify(value)
            const notionKey = targetLocale === 'en' ? 'persona_descriptions' : `persona_descriptions_${targetLocale}`
            updates[notionKey] = rt(personaStr)
          }

          if (Object.keys(updates).length > 0) {
            await notion.pages.update({
              page_id: propertyId,
              properties: updates as Parameters<typeof notion.pages.update>[0]['properties'],
            })
          }
        } catch (saveErr) {
          console.error('[generate-field] auto-save error (non-fatal):', (saveErr as Error).message)
        }
      }

      return NextResponse.json({ success: true, field, locale: targetLocale, value, autoSaved: localeFields.includes(field) })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 502 })
    }
  }

  // ── SAVE action — write pre-approved content to Notion ─────────────────────
  if (action === 'save') {
    try {
      const notion = new Client({ auth: process.env.NOTION_API_KEY })
      const rt = (s: string) => ({ rich_text: chunkRichText(s) })

      // Fetch which properties actually exist in this page's DB schema
      const pageRaw = await notion.pages.retrieve({ page_id: propertyId }) as { parent?: { database_id?: string }; properties: Record<string, unknown> }
      const existingProps = new Set(Object.keys(pageRaw.properties))

      const set = (key: string, val: unknown) => {
        if (existingProps.has(key)) return { [key]: val }
        console.log(`[ai/generate-content] skip missing prop: ${key}`)
        return {}
      }

      // Core EN/TH fields
      const core: Record<string, unknown> = {
        ...(saveData.title_en       ? set('title_en',            rt(saveData.title_en))       : {}),
        ...(saveData.title_th       ? set('title_th',            rt(saveData.title_th))       : {}),
        ...(saveData.description_en ? set('description_en',      rt(saveData.description_en)) : {}),
        ...(saveData.description_th ? set('description_th',      rt(saveData.description_th)) : {}),
        ...(saveData.seoDescription ? set('seo_description',     rt(saveData.seoDescription)) : {}),
        ...(saveData.faqItems       ? set('faq_json',            rt(JSON.stringify(saveData.faqItems))) : {}),
        ...(saveData.personaDescriptions
          ? set('persona_descriptions', rt(JSON.stringify(saveData.personaDescriptions))) : {}),
      }

      // Locale translations (title + description + highlights + seo + faq per locale)
      const ALL_LOCALES = ['zh-CN','zh-TW','ja','ko','ru','de','fr','es','it','nl','sv','ar','hi']
      const localeUpdates: Record<string, unknown> = {}
      for (const loc of ALL_LOCALES) {
        const safeKey = loc.replace('-', '_')
        if (saveData[`title_${safeKey}`])               Object.assign(localeUpdates, set(`title_${loc}`,              rt(saveData[`title_${safeKey}`])))
        if (saveData[`description_${safeKey}`])         Object.assign(localeUpdates, set(`description_${loc}`,        rt(saveData[`description_${safeKey}`])))
        if (saveData[`highlights_${safeKey}`])          Object.assign(localeUpdates, set(`highlights_${loc}`,         rt(saveData[`highlights_${safeKey}`])))
        if (saveData[`seoDescription_${safeKey}`])      Object.assign(localeUpdates, set(`seo_description_${loc}`,    rt(saveData[`seoDescription_${safeKey}`])))
        if (saveData[`faqItems_${safeKey}`])            Object.assign(localeUpdates, set(`faq_json_${loc}`,           rt(JSON.stringify(saveData[`faqItems_${safeKey}`]))))
      }

      // Save core fields
      if (Object.keys(core).length > 0) {
        console.log('[ai/generate-content] saving core fields:', Object.keys(core).join(', '))
        await notion.pages.update({
          page_id: propertyId,
          properties: core as Parameters<typeof notion.pages.update>[0]['properties'],
        })
      }

      // Save locale translations (separate call — don't fail core if locales missing)
      if (Object.keys(localeUpdates).length > 0) {
        console.log('[ai/generate-content] saving locale fields:', Object.keys(localeUpdates).join(', '))
        try {
          await notion.pages.update({
            page_id: propertyId,
            properties: localeUpdates as Parameters<typeof notion.pages.update>[0]['properties'],
          })
        } catch (localeErr) {
          console.error('[ai/generate-content] locale save error (non-fatal):', (localeErr as Error).message)
          // Non-fatal: core content saved; locales failed likely due to missing DB columns
        }
      }

      return NextResponse.json({ success: true, savedFields: [...Object.keys(core), ...Object.keys(localeUpdates)] })
    } catch (e) {
      console.error('[ai/generate-content] save error:', e)
      return NextResponse.json({ error: `Save failed: ${(e as Error).message}` }, { status: 500 })
    }
  }

  // ── GENERATE action — read property directly from page (1 Notion call only) ──
  let ctx: Record<string, unknown>
  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY })
    const page = await notion.pages.retrieve({ page_id: propertyId }) as { properties: Record<string, unknown> }
    const p = page.properties as Record<string, { type: string; rich_text?: Array<{ plain_text: string }>; number?: number | null; multi_select?: Array<{ name: string }>; select?: { name: string } | null; phone_number?: string | null }>

    const rt = (key: string) => (p[key]?.rich_text ?? []).map((r: { plain_text: string }) => r.plain_text).join('')
    const num = (key: string) => p[key]?.number ?? null
    const ms = (key: string) => (p[key]?.multi_select ?? []).map((o: { name: string }) => o.name)
    const sel = (key: string) => p[key]?.select?.name ?? ''

    ctx = {
      title: rt('title_en') || rt('Name') || 'Property',
      address: rt('address'),
      city: rt('city'),
      district: rt('district'),
      bedrooms: num('bedrooms'),
      bathrooms: num('bathrooms'),
      sizeSqm: num('size_sqm'),
      floors: num('floors'),
      parkingSpots: num('parking_spots'),
      priceTHB: num('price_thb'),
      amenities: ms('amenities').join(', '),
      highlights: rt('highlights'),
      perfectFor: ms('perfect_for').join(', '),
      tags: ms('tags').join(', '),
      status: sel('status'),
    }
  } catch (e) {
    console.error('[ai/generate-content] notion retrieve error:', e)
    return NextResponse.json({ error: `Could not load property: ${(e as Error).message}` }, { status: 500 })
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
    console.log('[ai/generate-content] calling AI for property', propertyId)
    const raw = await callAI(prompt)
    console.log('[ai/generate-content] AI response length:', raw.length)
    const generated = parseJSON(raw)
    return NextResponse.json({ success: true, generated })
  } catch (e) {
    console.error('[ai/generate-content] AI/parse error:', (e as Error).message)
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
