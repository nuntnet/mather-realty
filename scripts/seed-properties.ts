#!/usr/bin/env bun
/**
 * seed-properties.ts
 * Upload property photos to Cloudinary + create Notion listings
 * Usage: bun run scripts/seed-properties.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { Client } from '@notionhq/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!
const NOTION_API_KEY = process.env.NOTION_API_KEY!
const NOTION_PROPERTIES_DB_ID = process.env.NOTION_PROPERTIES_DB_ID!

const notion = new Client({ auth: NOTION_API_KEY })

// ── Cloudinary upload ─────────────────────────────────────────────────────────
async function uploadToCloudinary(filePath: string, folder: string, publicId?: string): Promise<string> {
  const fileBuffer = readFileSync(filePath)
  const base64 = fileBuffer.toString('base64')
  const ext = extname(filePath).toLowerCase().replace('.', '')
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
  const dataUri = `data:${mimeType};base64,${base64}`

  const formData = new FormData()
  formData.append('file', dataUri)
  formData.append('upload_preset', 'ml_default')
  formData.append('folder', `doublen/${folder}`)
  if (publicId) formData.append('public_id', publicId)
  formData.append('api_key', CLOUDINARY_API_KEY)

  // Signed upload
  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `folder=doublen/${folder}&timestamp=${timestamp}`

  const crypto = require('crypto')
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + CLOUDINARY_API_SECRET)
    .digest('hex')

  const form2 = new FormData()
  form2.append('file', dataUri)
  form2.append('folder', `doublen/${folder}`)
  form2.append('timestamp', String(timestamp))
  form2.append('api_key', CLOUDINARY_API_KEY)
  form2.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: form2,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudinary upload failed: ${err}`)
  }
  const data = await res.json() as { secure_url: string }
  return data.secure_url
}

async function uploadFolder(dirPath: string, folder: string): Promise<string[]> {
  const files = readdirSync(dirPath)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .map(f => join(dirPath, f))

  console.log(`  Uploading ${files.length} images to doublen/${folder}...`)
  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const name = file.split('/').pop()!
    process.stdout.write(`  [${i+1}/${files.length}] ${name}... `)
    try {
      const url = await uploadToCloudinary(file, folder)
      urls.push(url)
      console.log('✅')
    } catch (e) {
      console.log(`❌ ${e}`)
    }
  }

  return urls
}

// ── Notion helpers ────────────────────────────────────────────────────────────
function richText(content: string) {
  return [{ text: { content } }]
}

async function createPropertyInNotion(data: {
  titleEn: string
  titleTh: string
  slug: string
  descEn: string
  descTh: string
  address: string
  city: string
  district: string
  priceTHB: number
  bedrooms: number
  bathrooms: number
  sizeSqm: number
  landSqwa: number
  propertyType: string
  amenities: string[]
  coverImageUrl: string
  galleryUrls: string[]
  status: string
  contactPhone: string
  contactLine: string
  tags: string[]
}) {
  const page = await notion.pages.create({
    parent: { database_id: NOTION_PROPERTIES_DB_ID },
    cover: { type: 'external', external: { url: data.coverImageUrl } },
    properties: {
      // Title (Name) — required by Notion
      Name: { title: richText(data.titleEn) },
      // Multi-lang titles
      title_en: { rich_text: richText(data.titleEn) },
      title_th: { rich_text: richText(data.titleTh) },
      // Descriptions
      description_en: { rich_text: richText(data.descEn) },
      description_th: { rich_text: richText(data.descTh) },
      // Slug
      slug: { rich_text: richText(data.slug) },
      // Location
      address: { rich_text: richText(data.address) },
      city: { rich_text: richText(data.city) },
      district: { rich_text: richText(data.district) },
      // Pricing
      price_thb: { number: data.priceTHB },
      // Specs
      bedrooms: { number: data.bedrooms },
      bathrooms: { number: data.bathrooms },
      size_sqm: { number: data.sizeSqm },
      // Property type
      property_type: { select: { name: data.propertyType } },
      // Status
      status: { select: { name: data.status } },
      // Cover image
      cover_image: { url: data.coverImageUrl },
      // Gallery — split into chunks of ≤2000 chars for Notion limit
      gallery_urls: {
        rich_text: (() => {
          const all = data.galleryUrls.join(',')
          const chunks: string[] = []
          for (let i = 0; i < all.length; i += 1990) chunks.push(all.slice(i, i + 1990))
          return chunks.map(c => ({ text: { content: c } }))
        })()
      },
      // Amenities
      amenities: { multi_select: data.amenities.map(a => ({ name: a })) },
      // Contact
      contact_phone: { phone_number: data.contactPhone },
      contact_line: { rich_text: richText(data.contactLine) },
      // Tags
      tags: { multi_select: data.tags.map(t => ({ name: t })) },
    },
  })
  return page.id
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🏠 Mather — Property Seeder\n')

  const PHOTOS_BASE = 'drive-download-20260602T190827Z-3-001'

  // ─── Property 1: Bangkok Boulevard Bangna KM5 ────────────────────────────
  console.log('📸 Property 1: Bangkok Boulevard Bangna KM5')
  const bbV1Dir = `${PHOTOS_BASE}/Bangkok Boulevard Bangna KM5/Photos for Post V1`
  const bbUrls = await uploadFolder(bbV1Dir, 'bangkok-boulevard-bangna-km5')

  if (bbUrls.length > 0) {
    console.log('\n  Creating Notion listing...')
    const id1 = await createPropertyInNotion({
      titleEn: '4-Bed Villa in Bangkok Boulevard Bangna KM5',
      titleTh: 'บ้านเดี่ยว 4 ห้องนอน บางกอก บูเลอวาร์ด บางนา กม.5',
      slug: 'bangkok-boulevard-bangna-km5-4bed',
      descEn: 'Spacious 2-storey detached house in Bangkok Boulevard Bangna KM5. Prime location on main road, near clubhouse. Fully furnished with all appliances including digital TV, washing machine, dryer, water heater, refrigerator, air conditioner, water purifier, and EV charger ready. 4 bedrooms, 4 bathrooms, 237 sqm living area on 53.2 sq.wa. land. North-facing.',
      descTh: 'บ้านเดี่ยว 2 ชั้น ในโครงการบางกอก บูเลอวาร์ด บางนา กม.5 ทำเลสวยถนนเมน ใกล้คลับเฮาส์ เครื่องใช้ไฟฟ้าครบ ทีวีดิจิตอล เครื่องซักผ้า เครื่องอบผ้า เครื่องทำน้ำอุ่น ตู้เย็น เครื่องปรับอากาศ เครื่องกรองน้ำ ประตูรั้วไฟฟ้า รองรับ EV Charger 4 ห้องนอน 4 ห้องน้ำ ขนาด 237 ตร.ม. เนื้อที่ดิน 53.2 ตร.ว. ทิศเหนือ',
      address: 'Bangkok Boulevard Bangna KM5, Bangna, Bangkok',
      city: 'Bangkok',
      district: 'Bangna',
      priceTHB: 100000,
      bedrooms: 4,
      bathrooms: 4,
      sizeSqm: 237,
      landSqwa: 53.2,
      propertyType: 'Detached House',
      amenities: ['Pool', 'Parking', 'Gym', 'Security', 'EVCharger', 'Furnished', 'AirCon'],
      coverImageUrl: bbUrls[0],
      galleryUrls: bbUrls.slice(1),
      status: 'available',
      contactPhone: '0869902999',
      contactLine: 'treasurenui',
      tags: ['Bangna', 'International School', 'Bangkok Boulevard', 'Family Home', 'EV Ready'],
    })
    console.log(`  ✅ Created Notion page: ${id1}`)
  }

  // ─── Property 2: Indy2 Bangna KM7 ────────────────────────────────────────
  console.log('\n📸 Property 2: Indy2 Bangna KM7')
  const indy2Dir = `${PHOTOS_BASE}/Indy2`
  const indyUrls = await uploadFolder(indy2Dir, 'indy2-bangna-km7')

  if (indyUrls.length > 0) {
    console.log('\n  Creating Notion listing...')
    const id2 = await createPropertyInNotion({
      titleEn: '2-Bed Townhouse at Indy2 Bangna KM7',
      titleTh: 'ทาวน์เฮ้าส์ 2 ห้องนอน อินดี้2 บางนา กม.7',
      slug: 'indy2-bangna-km7-2bed',
      descEn: '2-storey townhouse in Indy2 Bangna KM7. Great location near clubhouse. Fully furnished with all appliances: digital TV, washing machine, dryer, water heater, refrigerator, air conditioner, and water purifier. 2 bedrooms, 3 bathrooms, 89 sqm on 18 sq.wa. land. Close to international schools and major shopping centres.',
      descTh: 'ทาวน์เฮ้าส์ 2 ชั้น โครงการอินดี้2 บางนา กม.7 ทำเลสวยใกล้คลับเฮาส์ ตกแต่งครบพร้อมอยู่ เครื่องใช้ไฟฟ้าครบ ทีวีดิจิตอล เครื่องซักผ้า เครื่องอบผ้า เครื่องทำน้ำอุ่น ตู้เย็น เครื่องปรับอากาศ เครื่องกรองน้ำ 2 ห้องนอน 3 ห้องน้ำ ขนาด 89 ตร.ม. เนื้อที่ 18 ตร.ว. ใกล้โรงเรียนนานาชาติ Concordian D-PREP Berkeley',
      address: 'Indy2, Bangna, Bangkok',
      city: 'Bangkok',
      district: 'Bangna',
      priceTHB: 30000,
      bedrooms: 2,
      bathrooms: 3,
      sizeSqm: 89,
      landSqwa: 18,
      propertyType: 'Townhouse',
      amenities: ['Pool', 'Parking', 'Gym', 'Security', 'Furnished', 'AirCon'],
      coverImageUrl: indyUrls[0],
      galleryUrls: indyUrls.slice(1),
      status: 'available',
      contactPhone: '0869902999',
      contactLine: 'treasurenui',
      tags: ['Bangna', 'International School', 'Indy2', 'Townhouse'],
    })
    console.log(`  ✅ Created Notion page: ${id2}`)
  }

  console.log('\n🎉 Done! Check your Notion Properties database.\n')
}

main().catch(console.error)
