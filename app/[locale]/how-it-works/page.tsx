import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Search, MessageCircle, Home, ClipboardList, BadgeCheck, DollarSign, ChevronDown } from 'lucide-react'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { HOW_IT_WORKS_IMAGES } from '@/lib/images'

interface HowItWorksPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HowItWorksPageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: `How It Works | ${SITE_NAME}`,
    description:
      'Learn how DoubleN Realty works for expat tenants and landlords in Thailand. Find, inquire, and move into your rental home in 3 simple steps.',
    alternates: { canonical: `${SITE_URL}/${locale}/how-it-works` },
  }
}

const TENANT_STEPS = [
  {
    number: '01',
    icon: Search,
    emoji: '🔍',
    title: 'Browse',
    description:
      'Search 500+ verified rental listings across Thailand. Filter by city, price, bedrooms, amenities.',
    image: HOW_IT_WORKS_IMAGES.browse,
    imageAlt: 'Browse properties on a laptop',
    color: 'blue',
  },
  {
    number: '02',
    icon: MessageCircle,
    emoji: '💬',
    title: 'Inquire',
    description:
      'Contact landlords directly via LINE, WhatsApp, or WeChat. No middleman fees.',
    image: HOW_IT_WORKS_IMAGES.inquire,
    imageAlt: 'Contact landlord directly',
    color: 'blue',
  },
  {
    number: '03',
    icon: Home,
    emoji: '🏡',
    title: 'Move In',
    description:
      'Schedule a viewing, sign your lease, and move into your new home.',
    image: HOW_IT_WORKS_IMAGES.move_in,
    imageAlt: 'Move into your new home',
    color: 'blue',
  },
]

const LANDLORD_STEPS = [
  {
    number: '01',
    icon: ClipboardList,
    emoji: '📋',
    title: 'Submit',
    description:
      'List your property with photos, description, and pricing. Our team reviews within 24 hours.',
    color: 'emerald',
  },
  {
    number: '02',
    icon: BadgeCheck,
    emoji: '✅',
    title: 'Get Verified',
    description:
      'Receive our Verified badge after property inspection, boosting your listing\'s visibility.',
    color: 'emerald',
  },
  {
    number: '03',
    icon: DollarSign,
    emoji: '💰',
    title: 'Earn',
    description:
      'Receive inquiries from qualified expat tenants. No commission on successful rentals.',
    color: 'emerald',
  },
]

const FAQ_ITEMS = [
  {
    question: 'Is DoubleN Realty free to use for tenants?',
    answer: 'Yes, completely free. Tenants can browse, save listings, and contact landlords at no cost.',
  },
  {
    question: 'How long does listing approval take?',
    answer: 'Within 24-48 hours. Our team reviews each submission for quality and accuracy before it goes live.',
  },
  {
    question: 'What areas do you cover?',
    answer: 'Bangkok, Chiang Mai, Phuket, and more. We\'re expanding to additional cities across Thailand regularly.',
  },
  {
    question: 'Do you charge landlords?',
    answer: 'Free during beta. Premium plans with enhanced visibility and featured placements are coming soon.',
  },
  {
    question: 'Can I negotiate rent?',
    answer: 'Yes, contact the landlord directly through the platform. All negotiations happen between you and the owner.',
  },
  {
    question: 'Are listings verified?',
    answer: 'Admin-verified listings display a blue checkmark. Our team confirms property details and photos before approval.',
  },
]

export default async function HowItWorksPage({ params }: HowItWorksPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-200 text-sm font-medium mb-6 border border-blue-500/30">
            Simple. Transparent. No Fees.
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            How DoubleN Realty Works
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Finding a rental home in Thailand as an expat has never been easier.
            Whether you&apos;re looking to rent or list a property, we&apos;ve made it simple in just 3 steps.
          </p>
          <div className="flex justify-center mt-10">
            <ChevronDown className="w-6 h-6 text-blue-300 animate-bounce" />
          </div>
        </div>
      </section>

      {/* For Tenants */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4 border border-blue-100">
            <Search className="w-4 h-4" /> For Tenants
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Find your perfect home in 3 steps</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Browse verified listings, connect with landlords directly, and move in — all without agency fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TENANT_STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute top-4 left-4 text-4xl">{step.emoji}</span>
                <span className="absolute bottom-4 right-4 text-5xl font-black text-white/20 leading-none">
                  {step.number}
                </span>
              </div>
              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
              {/* Accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="border-t border-dashed border-gray-200" />
      </div>

      {/* For Landlords */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-4 border border-emerald-100">
            <ClipboardList className="w-4 h-4" /> For Landlords
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">List your property, reach expat tenants</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Get your property in front of thousands of qualified international tenants.
            No commissions, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LANDLORD_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-100 p-8 hover:shadow-xl transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute top-6 right-6 text-6xl font-black text-emerald-100 leading-none select-none">
                  {step.number}
                </div>
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="text-2xl mb-3 block">{step.emoji}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                {/* Connector arrow */}
                {i < LANDLORD_STEPS.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-emerald-500 items-center justify-center shadow-md">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 text-white fill-current">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-3">Everything you need to know before getting started.</p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {item.question}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed pl-9">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your home?</h2>
          <p className="text-blue-200 text-lg mb-8">
            Join thousands of expats who have found their perfect rental in Thailand.
          </p>
          <Link
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            Browse Properties
            <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
