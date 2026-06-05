export interface Property {
  id: string
  slug: string
  title: Record<string, string>        // {en: '...', th: '...', 'zh-CN': '...', etc.}
  description: Record<string, string>  // multi-lang descriptions
  address: string
  city: string
  district: string
  lat: number
  lng: number
  priceTHB: number
  bedrooms: number
  bathrooms: number
  sizeSqm: number
  amenities: string[]                  // ['Pool','WiFi','Parking','PetFriendly','EVCharger','Furnished', ...]
  status: 'available' | 'rented' | 'coming_soon' | 'pending' | 'archived'
  availableFrom: string | null
  coverImage: string                   // Cloudinary URL
  gallery: string[]                    // Cloudinary URLs
  hasVirtualTour: boolean
  virtualTourUrl: string | null
  verifiedAt: string | null
  approvedAt: string | null
  listingScore: number                 // 0-100 completeness score
  ownerId: string | null
  tags: string[]
  floors: number                       // number of floors/storeys
  parkingSpots: number                 // number of parking spaces
  minLeaseTerm: number | null          // minimum lease in months (e.g. 1, 3, 6, 12)
  depositMonths: number | null         // security deposit in months of rent
  highlights: string[]                 // bullet-point highlights (split by •)
  contactLine: string | null           // LINE ID of owner
  contactPhone: string | null          // Phone/WhatsApp of owner
  perfectFor: string[]                 // e.g. ['teacher', 'family', 'expat-couple']
  personaDescriptions: Record<string, string> | null  // JSON: { teacher: "...", family: "..." }
  faqJson: Array<{q: string, a: string}> | null       // FAQ items
  seoDescription: string              // long-form SEO narrative
  galleryCategories: {
    exterior: string[]
    interior: string[]
    community: string[]
  } | null
  createdAt: string
  updatedAt: string
}

export interface BlogPost {
  id: string
  slug: string
  title: Record<string, string>
  excerpt: Record<string, string>
  content: string                      // markdown
  category: string
  coverImage: string
  published: boolean
  isPublished?: boolean
  publishedAt: string | null
  tags: string[]
  locale: string                       // primary locale
  // Extended fields used by admin/legacy blog pages
  seoTitle?: string
  seoDescription?: string
  authorName?: string
  coverImageUrl?: string
}

/** Flat admin-facing view of a blog post (used in admin/blog CMS) */
export interface AdminBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StaticPage {
  id: string
  pageKey: string                      // 'faq' | 'how-it-works' | 'about'
  title: Record<string, string>
  content: Record<string, string>      // rich text per locale
}

export interface PropertyFilters {
  city?: string
  district?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minSize?: number
  maxSize?: number
  amenities?: string[]
  availableNow?: boolean
  availableFrom?: string
  status?: string
}

export interface SearchResult {
  properties: Property[]
  total: number
  hasMore: boolean
}

export interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  type: 'viewing' | 'test_drive' | 'service' | 'body_paint' | 'insurance_quote'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  carModel?: string
  branch?: string
  preferredDate?: string
  preferredTime?: string
  notes?: string
  submittedAt?: string
  createdAt: string
}

/** Legacy car dealership types — kept for admin CMS pages that reference them */

export interface CarInput {
  name: string
  brand: string
  model: string
  year: number
  type?: string
  condition?: 'new' | 'used'
  priceMin: number
  priceMax?: number
  engineSize?: string
  transmission?: string
  fuelType?: string
  description?: string
  specs?: Record<string, unknown>
  imageUrls: string[]
  videoUrl?: string | null
  isActive: boolean
  isBestSeller?: boolean
  sortOrder?: number
  navFeatured?: boolean
  navNew?: boolean
  slug: string
}

export interface Car {
  id: string
  slug: string
  name: string
  model: string
  brand: string
  year: number
  type?: string
  condition?: 'new' | 'used'
  transmission?: 'auto' | 'manual'
  fuelType?: string
  engineSize?: string
  description?: string
  specs?: Record<string, unknown>
  videoUrl?: string | null
  priceMin: number
  priceMax?: number
  imageUrls: string[]
  category?: string
  isActive: boolean
  isNew?: boolean
  isFeatured?: boolean
  isBestSeller?: boolean
  navFeatured?: boolean
  navNew?: boolean
  sortOrder?: number
  flags?: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  message: string
  branch?: string
  status: string
  submittedAt?: string
  createdAt: string
}

export interface CustomerFeedback {
  id: string
  name: string
  phone: string
  email?: string
  type: string
  brand?: string
  branch: string
  department?: string
  message: string
  serviceDate?: string
  licensePlate?: string
  status: 'ใหม่' | 'กำลังดำเนินการ' | 'แก้ไขแล้ว'
  submittedAt: string
  createdAt: string
}

export interface CustomerStory {
  id: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  carModel?: string
  story?: string
  storyText: string
  rating: number
  isApproved?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  createdAt: string
}

export interface Promotion {
  id: string
  title: string
  brand: string
  imageUrl?: string
  coverImageUrl?: string
  linkUrl?: string
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  sortOrder?: number
  createdAt: string
}

export interface BrandSocialLink {
  id: string
  brand: string
  platform: 'Facebook' | 'TikTok' | 'YouTube' | 'LINE' | 'Instagram'
  url: string
  isActive: boolean
  sortOrder?: number
}

export interface VideoReview {
  id: string
  title: string
  description: string
  brand: string
  platform: 'YouTube' | 'TikTok'
  source: string
  videoUrl: string
  thumbnailUrl?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category?: string
  page: string
  brand: string
  isActive: boolean
  sortOrder: number
  isPublished?: boolean
}

export interface InsurancePartner {
  id: string
  name: string
  brand?: string
  logoUrl?: string
  isActive: boolean
  sortOrder?: number
}

export interface ServicePageSection {
  id: string
  title: string
  page?: string
  brand?: string
  sectionKey?: string
  content?: string
  notionUrl?: string
  isPublished: boolean
  sortOrder?: number
}

/** Alias for blog post with full content — used by SEO and detail pages */
export type BlogPostWithContent = BlogPost

export interface BlogMetaInput {
  title: string
  slug: string
  excerpt?: string
  category?: string
  coverImageUrl?: string | null
  isPublished?: boolean
  publishedAt?: string | null
  coverImage?: string
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  authorName?: string
  [key: string]: unknown
}
