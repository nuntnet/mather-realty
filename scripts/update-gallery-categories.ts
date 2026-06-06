import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const DB_ID = process.env.NOTION_PROPERTIES_DB_ID!

// Add gallery_categories field to DB
await notion.databases.update({
  database_id: DB_ID,
  properties: {
    'gallery_categories': { rich_text: {} }
    // Format: JSON string like {"community":["url1","url2"],"exterior":["url3"],"interior":["url4"]}
    // OR simple comma-prefixed: "community:url1,url2|exterior:url3|interior:url4"
  }
})
console.log('✅ Added gallery_categories field')

// For now, set all existing photos as "exterior" for both properties
const db = await notion.databases.query({ database_id: DB_ID })
for (const page of db.results) {
  const galleryRaw = (page.properties as any)?.gallery_urls?.rich_text?.map((r: any) => r.plain_text).join('') ?? ''
  const galleryUrls = galleryRaw.split(',').filter(Boolean)
  // Assign first 3 as exterior, rest as interior
  const categories = {
    exterior: galleryUrls.slice(0, 3),
    interior: galleryUrls.slice(3, 8),
    community: galleryUrls.slice(8),
  }
  const catJson = JSON.stringify(categories)
  const chunks: Array<{ text: { content: string } }> = []
  for (let i = 0; i < catJson.length; i += 1990) chunks.push({ text: { content: catJson.slice(i, i+1990) } })
  await notion.pages.update({
    page_id: page.id,
    properties: {
      gallery_categories: { rich_text: chunks }
    }
  })
  console.log('✅ Set categories for', page.id)
}
