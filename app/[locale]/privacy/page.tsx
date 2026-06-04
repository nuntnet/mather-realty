import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy | DoubleN Realty' }

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 pt-28">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: June 2025</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <p>DoubleN Realty ("we", "us", "our") is committed to protecting your personal information. This policy explains how we collect, use, and protect your data when you use our platform.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you submit an inquiry, register an account, or contact us. This may include your name, email address, phone number, and LINE/WhatsApp contact details.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To connect you with property landlords</li>
          <li>To send you property updates and notifications (with consent)</li>
          <li>To improve our platform and services</li>
          <li>To comply with legal obligations</li>
        </ul>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">Data Sharing</h2>
        <p>We do not sell your personal data. We share your contact details with landlords only when you submit an inquiry for their property.</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-8">Contact</h2>
        <p>For privacy-related questions, please contact us at <a href="mailto:janjiranui@gmail.com" className="text-[#46a758]">janjiranui@gmail.com</a>.</p>
      </div>
    </div>
  )
}
