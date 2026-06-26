import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getBlogPosts } from '@/lib/notion'
import type { BlogPost } from '@/lib/notion-types'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Calendar, Tag, Bell } from 'lucide-react'

const PLACEHOLDER_ARTICLES = [
  {
    id: 'placeholder-1',
    title: 'Complete Guide: Renting a House in Thailand as a Foreigner',
    excerpt:
      'Everything you need to know about finding, negotiating, and signing a rental agreement in Thailand — from visa requirements to tenant rights.',
    category: 'rental-guide',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    readTime: '8 min read',
  },
  {
    id: 'placeholder-2',
    title: 'Best Neighborhoods for Expats in Bangkok 2025',
    excerpt:
      'A deep dive into Bangkok\'s most popular expat neighborhoods — Sukhumvit, Silom, Thonglor, and Ekkamai — with rent prices, lifestyle notes, and transport links.',
    category: 'neighborhood',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    readTime: '6 min read',
  },
  {
    id: 'placeholder-3',
    title: 'How Much Does it Cost to Rent in Chiang Mai?',
    excerpt:
      'A realistic breakdown of rental costs in Chiang Mai for 2025, covering condos, houses, and serviced apartments across all budgets.',
    category: 'cost-of-living',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    readTime: '5 min read',
  },
]

interface BlogPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })

  return {
    title: `${t('title')} | ${SITE_NAME}`,
    description: t('subtitle'),
    alternates: { canonical: `${SITE_URL}/${locale}/blog` },
    openGraph: {
      title: `${t('title')} | ${SITE_NAME}`,
      description: t('subtitle'),
      url: `${SITE_URL}/${locale}/blog`,
      siteName: SITE_NAME,
    },
  }
}

export const revalidate = 3600

const CATEGORIES = ['rental-guide', 'neighborhood', 'legal-visa', 'lifestyle', 'cost-of-living'] as const

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const sp = await searchParams
  const activeCategory = sp.category ?? ''

  const t = await getTranslations({ locale, namespace: 'blog' })

  const posts = await getBlogPosts(locale, 50).catch(() => [])

  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts

  function formatDate(dateStr: string | null) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function getTitle(post: BlogPost) {
    return post.title[locale] ?? post.title.en ?? ''
  }

  function getExcerpt(post: BlogPost) {
    return post.excerpt[locale] ?? post.excerpt.en ?? ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{t('title')}</h1>
          <p className="text-gray-500 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto py-3">
          <a
            href="?"
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-[#1E6B69] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </a>
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`?category=${cat}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat ? 'bg-[#1E6B69] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t(`categories.${cat}`)}
            </a>
          ))}
        </div>
      </div>

      {/* Post grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <>
            {/* Placeholder featured articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {PLACEHOLDER_ARTICLES.map((article) => (
                <div
                  key={article.id}
                  className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm opacity-80"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                      {article.readTime}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-[#1E6B69] bg-[#E8F6F5] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {t(`categories.${article.category}`)}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>
                    <div className="mt-4 text-xs font-medium text-[#2A8A88]">Coming soon</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming soon banner */}
            <div className="flex flex-col items-center gap-4 bg-[#E8F6F5] border border-[#cde9e8] rounded-2xl px-6 py-10 text-center">
              <Bell className="w-8 h-8 text-[#2A8A88]" />
              <h3 className="text-xl font-semibold text-gray-900">More articles coming soon</h3>
              <p className="text-gray-500 max-w-md">
                We are working on in-depth guides to help expats navigate renting in Thailand.
                Subscribe to get notified when new articles drop.
              </p>
              <a
                href="mailto:hello@mather.to?subject=Blog%20Updates"
                className="inline-flex items-center gap-2 bg-[#1E6B69] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#18605E] transition-colors"
              >
                <Bell className="w-4 h-4" />
                Subscribe for updates
              </a>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {post.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={getTitle(post)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-[#1E6B69] bg-[#E8F6F5] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {t(`categories.${post.category}`)}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1E6B69] transition-colors">
                    {getTitle(post)}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3 flex-1">
                    {getExcerpt(post)}
                  </p>
                  <div className="flex items-center gap-1 mt-4 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.publishedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
