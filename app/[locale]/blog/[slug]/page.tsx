import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getBlogPost, getBlogPosts } from '@/lib/notion'
import type { BlogPost } from '@/lib/notion-types'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { routing } from '@/i18n/routing'

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts('en', 100)
    return posts
      .filter((p) => p.slug)
      .flatMap((p) => routing.locales.map((locale) => ({ locale, slug: p.slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getBlogPost(slug).catch(() => null)
  if (!post) return { title: 'Post Not Found' }

  const title = post.title[locale] ?? post.title.en ?? slug
  const description = post.excerpt[locale] ?? post.excerpt.en ?? ''
  const image = post.coverImage

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: `${SITE_URL}/${locale}/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      siteName: SITE_NAME,
      type: 'article',
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
  }
}

export const revalidate = 3600

const CATEGORY_LABELS: Record<string, string> = {
  'rental-guide': 'Rental Guide',
  'neighborhood': 'Neighborhood',
  'legal-visa': 'Legal & Visa',
  'lifestyle': 'Lifestyle',
  'cost-of-living': 'Cost of Living',
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const [post, allPosts] = await Promise.all([
    getBlogPost(slug).catch(() => null),
    getBlogPosts(locale, 20).catch(() => []),
  ])

  if (!post) notFound()

  const title = post.title[locale] ?? post.title.en ?? slug
  const excerpt = post.excerpt[locale] ?? post.excerpt.en ?? ''

  const related = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3)

  function formatDate(dateStr: string | null) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function getRelatedTitle(p: BlogPost) {
    return p.title[locale] ?? p.title.en ?? p.slug
  }

  // JSON-LD Article schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    url: `${SITE_URL}/${locale}/blog/${slug}`,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.coverImage ? { image: post.coverImage } : {}),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    inLanguage: locale,
    articleSection: CATEGORY_LABELS[post.category] ?? post.category,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Cover */}
        {post.coverImage && (
          <div className="relative w-full h-64 md:h-96">
            <Image src={post.coverImage} alt={title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E6B69] mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Expat Guide
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-medium text-[#1E6B69] bg-[#E8F6F5] px-3 py-1 rounded-full flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{title}</h1>
          {excerpt && <p className="text-lg text-gray-500 mb-8 leading-relaxed">{excerpt}</p>}

          {/* Content */}
          {post.content ? (
            <article className="prose prose-lg prose-blue max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-gray-400 italic">Content coming soon.</p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-100">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {p.coverImage && (
                      <div className="relative h-32 overflow-hidden">
                        <Image src={p.coverImage} alt={getRelatedTitle(p)} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#1E6B69] transition-colors">
                        {getRelatedTitle(p)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(p.publishedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
