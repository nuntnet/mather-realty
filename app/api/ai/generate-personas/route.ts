import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getProperty } from '@/lib/notion'
import { Client } from '@notionhq/client'

export async function POST(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { propertyId, slug } = await req.json()
  if (!propertyId && !slug) return NextResponse.json({ error: 'propertyId or slug required' }, { status: 400 })

  // Fetch property
  const property = slug ? await getProperty(slug, 'en') : null
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 })

  // Build context
  const ctx = {
    title: property.title.en,
    city: property.city,
    district: property.district,
    address: property.address,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeSqm: property.sizeSqm,
    floors: property.floors,
    priceTHB: property.priceTHB,
    amenities: property.amenities.join(', '),
    highlights: property.highlights.join(' • '),
    perfectFor: property.perfectFor,
    tags: property.tags.join(', '),
  }

  const systemPrompt = `You are an expert real estate copywriter for DoubleN Realty, a premium rental platform for expats in Thailand. Write compelling, SEO-rich descriptions that naturally include location keywords and lifestyle context.`

  const userPrompt = `Property: ${JSON.stringify(ctx)}

Generate a JSON response with exactly this structure:
{
  "personaDescriptions": {
    "teacher": "2-3 sentence description for international school teachers. Mention specific schools if relevant (Concordian, D-PREP, Berkeley, Bangkok Pattana, NIST, ISB). Natural tone, emphasize convenience, community feel.",
    "expat-couple": "2-3 sentences for expat couples relocating to Thailand. Emphasize lifestyle, furnishing, community amenities.",
    "family": "2-3 sentences for families with children. Emphasize space, safety, school proximity, community.",
    "airline-crew": "2-3 sentences for airline staff. Emphasize airport distance, rest quality, transport.",
    "remote-worker": "2-3 sentences for remote workers/freelancers. Emphasize reliable infrastructure, workspace potential, quiet environment.",
    "digital-nomad": "2-3 sentences for digital nomads. Short-term friendly, coworking nearby, Thai lifestyle."
  },
  "faqItems": [
    { "q": "How far is this property from Suvarnabhumi Airport?", "a": "..." },
    { "q": "Are there international schools nearby?", "a": "..." },
    { "q": "Is the property suitable for families with young children?", "a": "..." },
    { "q": "What is included in the monthly rent?", "a": "..." },
    { "q": "How do I schedule a viewing?", "a": "..." },
    { "q": "Is the area safe and well-connected?", "a": "..." }
  ],
  "seoDescription": "200-300 word rich narrative about the property that naturally includes: location (Bangna, Bangkok), nearby landmarks, lifestyle benefits, property features. Written for search engines AND humans. Include natural Thai/English location keywords."
}

Only output valid JSON. No markdown.
`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: 'OpenAI error', detail: err }, { status: 502 })
  }

  const data = await res.json()
  const content = data.choices[0]?.message?.content
  if (!content) return NextResponse.json({ error: 'No content from OpenAI' }, { status: 502 })

  const generated = JSON.parse(content)

  // Save back to Notion
  const notion = new Client({ auth: process.env.NOTION_API_KEY })
  const DB_ID = process.env.NOTION_PROPERTIES_DB_ID!

  // Find page by slug
  const dbQuery = await notion.databases.query({
    database_id: DB_ID,
    filter: { property: 'slug', rich_text: { equals: property.slug } },
    page_size: 1,
  })

  if (dbQuery.results[0]) {
    const personaJson = JSON.stringify(generated.personaDescriptions)
    const faqJson = JSON.stringify(generated.faqItems)
    const seoDesc = generated.seoDescription

    // Split long text into chunks for Notion 2000-char limit
    const chunkRichText = (text: string) => {
      const chunks = []
      for (let i = 0; i < text.length; i += 1990) {
        chunks.push({ text: { content: text.slice(i, i + 1990) } })
      }
      return chunks
    }

    await notion.pages.update({
      page_id: dbQuery.results[0].id,
      properties: {
        persona_descriptions: { rich_text: chunkRichText(personaJson) },
        faq_json: { rich_text: chunkRichText(faqJson) },
        seo_description: { rich_text: chunkRichText(seoDesc) },
      },
    })
  }

  return NextResponse.json({
    success: true,
    slug: property.slug,
    personaDescriptions: generated.personaDescriptions,
    faqItems: generated.faqItems,
    seoDescription: generated.seoDescription,
  })
}
