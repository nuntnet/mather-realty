import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getBlogPosts } from '@/lib/notion'
import type { BlogPost } from '@/lib/notion-types'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Calendar, Tag } from 'lucide-react'

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
              !activeCategory ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </a>
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`?category=${cat}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
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
          <div className="text-center py-20 text-gray-500">
            <p>No posts found in this category.</p>
          </div>
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
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {t(`categories.${post.category}`)}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
