import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getProperty } from '@/lib/notion'
import { Client } from '@notionhq/client'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { propertyId, slug } = await req.json()
  if (!propertyId && !slug) return NextResponse.json({ error: 'propertyId or slug required' }, { status: 400 })

  const property = slug ? await getProperty(slug, 'en') : null
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })

  const anthropic = new Anthropic({ apiKey: anthropicKey })

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

  const systemPrompt = `You are an expert real estate copywriter for DoubleN Realty, a premium rental platform for expats in Thailand. Write compelling, SEO-rich descriptions that naturally include location keywords and lifestyle context. Always respond with valid JSON only — no markdown, no explanation.`

  const userPrompt = `Property data: ${JSON.stringify(ctx)}

Generate a JSON response with exactly this structure:
{
  "personaDescriptions": {
    "teacher": "2-3 sentence description for international school teachers. Mention specific nearby schools if relevant (Concordian, D-PREP, Berkeley, Bangkok Pattana, NIST, ISB). Natural tone, emphasize convenience and community.",
    "expat-couple": "2-3 sentences for expat couples relocating to Thailand. Emphasize lifestyle, furnishing, community amenities.",
    "family": "2-3 sentences for families with children. Emphasize space, safety, school proximity, community.",
    "airline-crew": "2-3 sentences for airline staff. Emphasize airport distance, rest quality, easy commute.",
    "remote-worker": "2-3 sentences for remote workers/freelancers. Emphasize quiet environment, workspace potential, reliable area.",
    "digital-nomad": "2-3 sentences for digital nomads. Short-term friendly, Thai lifestyle, flexibility.",
    "business-expat": "2-3 sentences for business professionals. Emphasize location, prestige, convenience to CBD."
  },
  "faqItems": [
    { "q": "How far is this property from Suvarnabhumi Airport?", "a": "Specific answer with estimated drive time." },
    { "q": "Are there international schools nearby?", "a": "List nearby schools with approximate distances." },
    { "q": "Is the property suitable for families with young children?", "a": "Honest, helpful answer." },
    { "q": "What is included in the monthly rent?", "a": "Describe furnishings and appliances from the data." },
    { "q": "How do I schedule a viewing?", "a": "Contact via LINE ID treasurenui or WhatsApp +66869902999." },
    { "q": "Is the area safe and well-connected?", "a": "Describe safety features and transport options." }
  ],
  "seoDescription": "200-300 word narrative about the property. Naturally includes: Bangna/Bangkok location keywords, nearby landmarks, lifestyle benefits, specific property features. Written for humans AND search engines. Include both Thai transliterated words and English naturally."
}

Only output valid JSON. No markdown, no backticks, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 2000,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const content = message.content[0]?.type === 'text' ? message.content[0].text : null
  if (!content) return NextResponse.json({ error: 'No content from Claude' }, { status: 502 })

  let generated: {
    personaDescriptions: Record<string, string>
    faqItems: Array<{q: string; a: string}>
    seoDescription: string
  }

  try {
    generated = JSON.parse(content)
  } catch {
    // Try to extract JSON if there's extra text
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'Invalid JSON from Claude', raw: content }, { status: 502 })
    generated = JSON.parse(match[0])
  }

  // Save back to Notion
  const notion = new Client({ auth: process.env.NOTION_API_KEY })
  const DB_ID = process.env.NOTION_PROPERTIES_DB_ID!

  const dbQuery = await notion.databases.query({
    database_id: DB_ID,
    filter: { property: 'slug', rich_text: { equals: property.slug } },
    page_size: 1,
  })

  if (dbQuery.results[0]) {
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
        persona_descriptions: { rich_text: chunkRichText(JSON.stringify(generated.personaDescriptions)) },
        faq_json: { rich_text: chunkRichText(JSON.stringify(generated.faqItems)) },
        seo_description: { rich_text: chunkRichText(generated.seoDescription) },
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
