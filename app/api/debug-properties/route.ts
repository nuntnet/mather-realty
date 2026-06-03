import { NextResponse } from 'next/server'
import { getProperties } from '@/lib/notion'

export async function GET() {
  const envCheck = {
    NOTION_API_KEY: process.env.NOTION_API_KEY ? '✅ set (' + process.env.NOTION_API_KEY.slice(0,8) + '...)' : '❌ missing',
    NOTION_PROPERTIES_DB_ID: process.env.NOTION_PROPERTIES_DB_ID || '❌ missing',
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? '✅ set' : '❌ missing',
  }

  let properties: { slug: string; title: string; status: string; approvedAt: string | null }[] = []
  let error = null
  try {
    const all = await getProperties(undefined, 'en')
    properties = all.map(p => ({
      slug: p.slug,
      title: p.title?.en ?? '',
      status: p.status,
      approvedAt: p.approvedAt,
    }))
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    env: envCheck,
    propertiesFound: properties.length,
    properties,
    error,
  })
}
