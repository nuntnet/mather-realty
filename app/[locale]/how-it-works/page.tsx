import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { Search, MessageCircle, Home, Building2, ClipboardCheck, Users } from 'lucide-react'

interface HowItWorksPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HowItWorksPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'how_it_works' })

  return {
    title: `${t('title')} | ${SITE_NAME}`,
    description: 'Learn how DoubleN Realty works for tenants and landlords in Thailand.',
    alternates: { canonical: `${SITE_URL}/${locale}/how-it-works` },
  }
}

const TENANT_STEPS = [
  {
    icon: <Search className="w-7 h-7 text-blue-600" />,
    title: 'Browse',
    description: 'Search our curated database of verified rental properties across Thailand. Filter by city, price, bedrooms, and amenities.',
  },
  {
    icon: <Home className="w-7 h-7 text-blue-600" />,
    title: 'Save',
    description: 'Save your favourite listings and compare properties side-by-side to find the perfect match.',
  },
  {
    icon: <MessageCircle className="w-7 h-7 text-blue-600" />,
    title: 'Inquire',
    description: 'Contact the landlord directly via LINE, WhatsApp, or email. Schedule a viewing at your convenience.',
  },
  {
    icon: <Users className="w-7 h-7 text-blue-600" />,
    title: 'Move In',
    description: 'Sign your lease and move into your new home in Thailand. We\'re here to help every step of the way.',
  },
]

const LANDLORD_STEPS = [
  {
    icon: <ClipboardCheck className="w-7 h-7 text-emerald-600" />,
    title: 'Submit',
    description: 'Fill in your property details, upload photos, and add a virtual tour. Our AI can help generate descriptions in 15 languages.',
  },
  {
    icon: <Building2 className="w-7 h-7 text-emerald-600" />,
    title: 'Review',
    description: 'Our team reviews your listing to ensure quality and accuracy before it goes live on the platform.',
  },
  {
    icon: <MessageCircle className="w-7 h-7 text-emerald-600" />,
    title: 'Get Inquiries',
    description: 'Verified expat tenants contact you directly. Manage inquiries and schedule viewings with ease.',
  },
]

const FAQ = [
  {
    question: 'Is it free to list my property?',
    answer: 'Yes, basic listings are free. We offer premium packages for enhanced visibility and featured placements.',
  },
  {
    question: 'How do I know if a tenant is legitimate?',
    answer: 'We screen all inquiries and provide contact details only from verified users on our platform.',
  },
  {
    question: 'What languages does the platform support?',
    answer: 'DoubleN Realty supports 15 languages including English, Thai, Chinese (Simplified & Traditional), Japanese, Korean, Russian, German, French, Spanish, Italian, Dutch, Swedish, Arabic, and Hindi.',
  },
  {
    question: 'How long does it take for my listing to be approved?',
    answer: 'Listings are typically reviewed and approved within 1-2 business days.',
  },
  {
    question: 'Can I post in multiple currencies?',
    answer: 'Prices are listed in Thai Baht (THB) as the standard currency, which is the most transparent option for the Thai rental market.',
  },
]

export default async function HowItWorksPage({ params }: HowItWorksPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'how_it_works' })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-blue-200 text-lg">
            DoubleN Realty makes finding and listing rental properties in Thailand simple, transparent, and stress-free.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Two-column: tenants & landlords */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* For Tenants */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('for_tenants')}</h2>
            </div>
            <div className="space-y-6">
              {TENANT_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                      {step.icon}
                    </div>
                    {i < TENANT_STEPS.length - 1 && <div className="w-0.5 h-8 bg-blue-100 mt-2" />}
                  </div>
                  <div className="pt-1.5 pb-6">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Landlords */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('for_landlords')}</h2>
            </div>
            <div className="space-y-6">
              {LANDLORD_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                      {step.icon}
                    </div>
                    {i < LANDLORD_STEPS.length - 1 && <div className="w-0.5 h-8 bg-emerald-100 mt-2" />}
                  </div>
                  <div className="pt-1.5 pb-6">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
