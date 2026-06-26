#!/usr/bin/env bun
/**
 * generate-all-personas.ts
 * Generate AI persona descriptions + FAQ + SEO for all properties using Hermes local adapter
 * Usage: bun run scripts/generate-all-personas.ts
 */

import { Client } from '@notionhq/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const HERMES_URL = process.env.HERMES_URL ?? 'http://127.0.0.1:8999'
const HERMES_MODEL = process.env.HERMES_MODEL ?? 'cc/sonnet'
const NOTION_KEY = process.env.NOTION_API_KEY!
const DB_ID = process.env.NOTION_PROPERTIES_DB_ID!

const notion = new Client({ auth: NOTION_KEY })

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPropString(props: Record<string, unknown>, key: string): string {
  const p = props[key] as Record<string, unknown> | undefined
  if (!p) return ''
  if (p.type === 'rich_text') return (p.rich_text as Array<{plain_text: string}>).map(r => r.plain_text).join('')
  if (p.type === 'title') return (p.title as Array<{plain_text: string}>).map(r => r.plain_text).join('')
  if (p.type === 'select') return (p.select as {name: string} | null)?.name ?? ''
  if (p.type === 'phone_number') return (p as {phone_number: string}).phone_number ?? ''
  return ''
}

function getPropNumber(props: Record<string, unknown>, key: string): number {
  const p = props[key] as {number?: number} | undefined
  return p?.number ?? 0
}

function getPropMultiSelect(props: Record<string, unknown>, key: string): string[] {
  const p = props[key] as {multi_select?: Array<{name: string}>} | undefined
  return (p?.multi_select ?? []).map(s => s.name)
}

function chunkRichText(text: string) {
  const chunks = []
  for (let i = 0; i < text.length; i += 1990) {
    chunks.push({ text: { content: text.slice(i, i + 1990) } })
  }
  return chunks
}

// ── AI Call via Hermes ────────────────────────────────────────────────────────

async function callHermes(system: string, user: string): Promise<string> {
  const res = await fetch(`${HERMES_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer no-key' },
    body: JSON.stringify({
      model: HERMES_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
    }),
  })
  if (!res.ok) throw new Error(`Hermes error ${res.status}: ${await res.text()}`)
  const data = await res.json() as { choices: Array<{message: {content: string}}> }
  return data.choices[0]?.message?.content ?? ''
}

// ── Generate for one property ─────────────────────────────────────────────────

async function generateForProperty(page: {id: string; properties: Record<string, unknown>}) {
  const props = page.properties
  const title = getPropString(props, 'title_en') || getPropString(props, 'Name')
  const slug = getPropString(props, 'slug')
  const city = getPropString(props, 'city')
  const district = getPropString(props, 'district')
  const address = getPropString(props, 'address')
  const bedrooms = getPropNumber(props, 'bedrooms')
  const bathrooms = getPropNumber(props, 'bathrooms')
  const sizeSqm = getPropNumber(props, 'size_sqm')
  const floors = getPropNumber(props, 'floors')
  const priceTHB = getPropNumber(props, 'price_thb')
  const parkingSpots = getPropNumber(props, 'parking_spots')
  const amenities = getPropMultiSelect(props, 'amenities')
  const perfectFor = getPropMultiSelect(props, 'perfect_for')
  const highlights = getPropString(props, 'highlights')
  const tags = getPropMultiSelect(props, 'tags')
  const contactLine = getPropString(props, 'contact_line')
  const contactPhone = getPropString(props, 'contact_phone')

  console.log(`\n📝 Generating for: ${title} (${slug})`)
  console.log(`   City: ${city}, ${district} | ฿${priceTHB.toLocaleString()}/mo | ${bedrooms}bed ${bathrooms}bath`)
  console.log(`   Perfect for: ${perfectFor.join(', ')}`)

  const ctx = {
    title, city, district, address,
    bedrooms, bathrooms, sizeSqm, floors, priceTHB, parkingSpots,
    amenities: amenities.join(', '),
    perfectFor,
    highlights,
    tags: tags.join(', '),
    contactLine,
    contactPhone: contactPhone ? `+66${contactPhone.replace(/^0/, '')}` : '',
  }

  const systemPrompt = `You are an expert real estate copywriter for Mather, a premium rental platform for expats in Thailand (Bangna area focus). Write compelling, SEO-rich content in natural English that includes location keywords and lifestyle context. Return only valid JSON — no markdown, no backticks.`

  const userPrompt = `Property: ${JSON.stringify(ctx, null, 2)}

Generate JSON with exactly this structure:
{
  "personaDescriptions": {
    "teacher": "2-3 sentences for international school teachers. Mention nearby schools: Concordian International School (2km), D-PREP International School (3km), Berkeley International School. Emphasize short commute and community feel.",
    "expat-couple": "2-3 sentences for expat couples relocating to Thailand. Lifestyle, furnishing, pool+gym community.",
    "family": "2-3 sentences for families with children. Space, school proximity, security, community.",
    "airline-crew": "2-3 sentences for airline crew. Suvarnabhumi Airport ~20 min, rest quality.",
    "remote-worker": "2-3 sentences for remote workers. Quiet environment, furnished, good area.",
    "digital-nomad": "2-3 sentences for digital nomads. Fully furnished, flexible, Bangkok lifestyle.",
    "business-expat": "2-3 sentences for business professionals. Bangna business corridor, prestige."
  },
  "faqItems": [
    {"q": "How far is this property from Suvarnabhumi Airport?", "a": "Approximately 20-25 minutes by car via Bang Na Expressway (Kanchanaphisek Road). Very convenient for frequent travelers."},
    {"q": "Are there international schools nearby?", "a": "Yes — Concordian International School (~2km), D-PREP International School (~3km), Berkeley International School, and St Andrews International School are all within easy reach."},
    {"q": "Is the property suitable for families with young children?", "a": "Absolutely. The gated community features 24-hour security, CCTV, a swimming pool, and manicured gardens — ideal for families."},
    {"q": "What is included in the monthly rent?", "a": "The property comes fully furnished with all appliances: digital TV, washing machine, dryer, water heater, refrigerator, air conditioners throughout, and water purifier. Ready to move in."},
    {"q": "How do I schedule a viewing?", "a": "Contact the owner directly via LINE ID: ${contactLine || 'treasurenui'} or WhatsApp: ${contactPhone ? '+66' + contactPhone.replace(/^0/, '') : '+66869902999'}. We respond same day."},
    {"q": "Is the Bangna area safe and well-connected?", "a": "Bangna is a well-established, expat-friendly residential area with excellent road links (Bang Na Expressway, Kanchanaphisek), BTS Udomsuk and On Nut nearby, and major shopping at Bangkok Mall, BITEC, and Mega Bangna."}
  ],
  "seoDescription": "Write a 200-300 word rich narrative. Include naturally: '${city}', 'Bangna', 'Bangkok', 'rent', 'expat', 'international school', specific nearby landmarks. Mention the price, key specs, and lifestyle benefits. Sound like a trusted local guide, not a listing. Include Thai words like 'บ้านเช่า' naturally."
}

Only output valid JSON.`

  const raw = await callHermes(systemPrompt, userPrompt)

  let generated: {
    personaDescriptions: Record<string, string>
    faqItems: Array<{q: string; a: string}>
    seoDescription: string
  }

  try {
    generated = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error(`Invalid JSON: ${raw.slice(0, 200)}`)
    generated = JSON.parse(match[0])
  }

  console.log(`   ✅ AI generated ${Object.keys(generated.personaDescriptions).length} personas + ${generated.faqItems.length} FAQ items`)

  // Save to Notion
  await notion.pages.update({
    page_id: page.id,
    properties: {
      persona_descriptions: { rich_text: chunkRichText(JSON.stringify(generated.personaDescriptions)) },
      faq_json: { rich_text: chunkRichText(JSON.stringify(generated.faqItems)) },
      seo_description: { rich_text: chunkRichText(generated.seoDescription) },
    },
  })

  console.log(`   ✅ Saved to Notion: ${page.id}`)
  return generated
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🤖 Mather — AI Persona Generator')
  console.log(`   Hermes: ${HERMES_URL} (model: ${HERMES_MODEL})`)
  console.log(`   Notion DB: ${DB_ID}\n`)

  // Test Hermes connection
  try {
    await fetch(`${HERMES_URL}/v1/models`, { signal: AbortSignal.timeout(3000) })
    console.log('✅ Hermes connected\n')
  } catch {
    console.error('❌ Hermes not reachable at', HERMES_URL)
    process.exit(1)
  }

  // Fetch all approved properties
  const db = await notion.databases.query({
    database_id: DB_ID,
    filter: { property: 'approved_at', date: { is_not_empty: true } },
  })

  console.log(`Found ${db.results.length} approved properties\n`)

  if (db.results.length === 0) {
    console.log('No approved properties found.')
    return
  }

  let success = 0
  let failed = 0

  for (const page of db.results) {
    try {
      await generateForProperty(page as {id: string; properties: Record<string, unknown>})
      success++
      // Small delay to be gentle on the API
      await new Promise(r => setTimeout(r, 500))
    } catch (e) {
      console.error(`   ❌ Failed:`, e)
      failed++
    }
  }

  console.log(`\n✨ Done! ${success} succeeded, ${failed} failed`)
  console.log('\nNext: open property pages to see AI content, or push to trigger ISR revalidation')
}

main().catch(console.error)
