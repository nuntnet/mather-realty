import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service | DoubleN Realty' }

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 pt-28">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: June 2025</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <p>By using DoubleN Realty, you agree to these Terms of Service. Please read them carefully.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">Service Description</h2>
        <p>DoubleN Realty is a rental property discovery platform connecting expats and foreigners in Thailand with landlords. We are a marketplace and do not own any of the listed properties.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">User Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You must be 18+ to use our platform</li>
          <li>You agree to provide accurate information in inquiries and submissions</li>
          <li>You will not use our platform for fraudulent or illegal purposes</li>
        </ul>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">Landlord Listings</h2>
        <p>Property listings are provided by third-party landlords. DoubleN Realty reviews listings but does not guarantee their accuracy. Always verify property details before signing any agreement.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">No Commission Policy</h2>
        <p>DoubleN Realty does not charge tenants any commission or fees for using the platform during the current beta period.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">Contact</h2>
        <p>Questions about these terms? Contact us at <a href="mailto:janjiranui@gmail.com" className="text-[#46a758]">janjiranui@gmail.com</a>.</p>
      </div>
    </div>
  )
}
