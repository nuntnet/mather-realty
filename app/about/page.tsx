import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
  description: 'Learn about Mather — your trusted partner for rental properties in Thailand.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Mather</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your trusted partner for finding premium rental properties in Thailand.
        </p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p>
            Mather specialises in helping expats and foreigners find their perfect rental
            home in Thailand. We offer a curated selection of verified properties across Bangkok,
            Chiang Mai, Phuket, and other major destinations.
          </p>
          <p>
            Our platform supports 15 languages and provides transparent pricing, verified listings,
            and dedicated support throughout your rental journey.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10">Our Mission</h2>
          <p>
            To make renting property in Thailand simple, transparent, and stress-free for
            international residents.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-10">Contact Us</h2>
          <p>
            Email:{' '}
            <a href="mailto:hello@mather.to" className="text-blue-600 hover:underline">
              hello@mather.to
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
