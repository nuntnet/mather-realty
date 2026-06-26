/**
 * One-off: replace leftover "DoubleN Realty" / "DoubleN" → "Mather" inside
 * Notion property CONTENT (AI-generated descriptions, SEO, personas, FAQ) across
 * every rich_text / title property and every locale.
 *
 * Run: bun run scripts/rebrand-notion.ts          (dry run — shows changes)
 *      bun run scripts/rebrand-notion.ts --apply   (writes to Notion)
 */
import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

const APPLY = process.argv.includes('--apply')
const DB = process.env.NOTION_PROPERTIES_DB_ID
const KEY = process.env.NOTION_API_KEY

if (!DB || !KEY) {
  console.error('Missing NOTION_API_KEY or NOTION_PROPERTIES_DB_ID')
  process.exit(1)
}

const notion = new Client({ auth: KEY })

function rebrand(s: string): string {
  return s.replace(/DoubleN Realty/g, 'Mather').replace(/DoubleN/g, 'Mather')
}

function plain(rt: Array<{ plain_text?: string }> | undefined): string {
  return (rt ?? []).map((t) => t.plain_text ?? '').join('')
}

// Notion rich_text content is capped at 2000 chars per item.
function toRichText(text: string) {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 2000) chunks.push(text.slice(i, i + 2000))
  return (chunks.length ? chunks : ['']).map((content) => ({ text: { content } }))
}

async function run() {
  console.log(`─── Notion rebrand DoubleN → Mather ${APPLY ? '(APPLY)' : '(dry run)'} ───`)
  let cursor: string | undefined
  let pages = 0
  let edits = 0

  do {
    const res = await notion.databases.query({ database_id: DB!, start_cursor: cursor })
    for (const row of res.results) {
      const page = row as PageObjectResponse
      pages++
      const updates: Record<string, unknown> = {}

      for (const [name, prop] of Object.entries(page.properties)) {
        const p = prop as { type: string; rich_text?: any[]; title?: any[] }
        const arr = p.type === 'rich_text' ? p.rich_text : p.type === 'title' ? p.title : null
        if (!arr) continue
        const text = plain(arr)
        if (!text.includes('DoubleN')) continue

        const fixed = rebrand(text)
        edits++
        console.log(`  • ${page.id.slice(0, 8)} [${name}] "${text.slice(0, 50)}…" → "${fixed.slice(0, 50)}…"`)
        if (p.type === 'title') updates[name] = { title: toRichText(fixed) }
        else updates[name] = { rich_text: toRichText(fixed) }
      }

      if (APPLY && Object.keys(updates).length) {
        await notion.pages.update({ page_id: page.id, properties: updates as any })
      }
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined
  } while (cursor)

  console.log(`\n${pages} pages scanned, ${edits} field(s) ${APPLY ? 'updated' : 'to update'}.`)
  if (!APPLY && edits) console.log('Re-run with --apply to write changes.')
}

run().catch((e) => { console.error('rebrand failed:', e); process.exit(1) })
