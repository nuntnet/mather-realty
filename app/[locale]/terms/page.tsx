import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | DoubleN Realty',
  description:
    'Read the Terms of Service for DoubleN Realty — the rental property platform for expats and foreigners in Thailand.',
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="pt-28 pb-16 max-w-3xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: June 2025</p>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">

        <p>
          Please read these Terms of Service (&quot;Terms&quot;) carefully before using{' '}
          <strong>doublen-realty.com</strong> (the &quot;Platform&quot;) operated by{' '}
          <strong>DoubleN Realty</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By
          accessing or using our Platform, you agree to be bound by these Terms. If you do not
          agree, please do not use the Platform.
        </p>

        {/* 1 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          1. About DoubleN Realty
        </h2>
        <p>
          DoubleN Realty is an online rental property discovery marketplace designed specifically
          for expats, foreigners, and international residents seeking rental accommodation in
          Thailand. We aggregate property listings from third-party landlords and facilitate
          connections between prospective tenants and landlords.
        </p>
        <p className="mt-3">
          <strong>
            DoubleN Realty is a marketplace platform only. We are not a landlord, property owner,
            real estate agent, or party to any rental agreement.
          </strong>{' '}
          All rental agreements are made directly between tenants and landlords.
        </p>

        {/* 2 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Eligibility</h2>
        <p>To use our Platform, you must:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Be at least <strong>18 years of age</strong></li>
          <li>Have the legal capacity to enter into binding agreements</li>
          <li>Not be prohibited from using the Platform under applicable law</li>
        </ul>
        <p className="mt-3">
          By using the Platform, you represent and warrant that you meet all eligibility
          requirements listed above.
        </p>

        {/* 3 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          3. Property Listings
        </h2>
        <p>
          Property listings on our Platform are provided by third-party landlords. While we review
          listings before publication, we make no representations or warranties regarding:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>The accuracy, completeness, or currency of any listing</li>
          <li>The availability of any listed property</li>
          <li>The condition, fitness, or legal status of any property</li>
          <li>The identity, reliability, or conduct of any landlord</li>
        </ul>
        <p className="mt-3">
          You are solely responsible for verifying all property details, visiting the property in
          person, and conducting your own due diligence before signing any rental agreement.
        </p>

        {/* 4 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          4. No Fees for Tenants
        </h2>
        <p>
          DoubleN Realty does <strong>not</strong> charge tenants any commission, referral fee, or
          service fee for using our Platform or submitting inquiries. If anyone claims to be
          representing DoubleN Realty and requests payment from you as a tenant, please report
          this to us immediately at{' '}
          <a href="mailto:janjiranui@gmail.com" className="text-[#1E6B69] hover:underline">
            janjiranui@gmail.com
          </a>.
        </p>

        {/* 5 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. User Conduct</h2>
        <p>When using our Platform, you agree to:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Provide accurate and truthful information in all inquiry forms and submissions</li>
          <li>Use the Platform only for lawful purposes</li>
          <li>Not submit fraudulent, misleading, or duplicate inquiries</li>
          <li>Not impersonate any person or entity</li>
          <li>Not attempt to circumvent, disable, or interfere with the Platform&apos;s security</li>
          <li>Not scrape, harvest, or systematically download content from the Platform</li>
          <li>Not use the Platform to send unsolicited communications or spam</li>
        </ul>
        <p className="mt-3">
          We reserve the right to suspend or terminate access for any user who violates these
          conduct requirements.
        </p>

        {/* 6 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          6. Landlord Submissions
        </h2>
        <p>
          Landlords who submit property listings to our Platform represent and warrant that:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            They are the legal owner of, or are authorised to list, the property
          </li>
          <li>
            All information provided in the listing is accurate, current, and not misleading
          </li>
          <li>
            The property is legally available for rental and complies with applicable Thai law
          </li>
          <li>
            They will respond to tenant inquiries in a timely and professional manner
          </li>
        </ul>
        <p className="mt-3">
          We reserve the right to refuse, edit, or remove any listing that violates our guidelines
          or these Terms.
        </p>

        {/* 7 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          7. Intellectual Property
        </h2>
        <p>
          All content on the Platform produced by DoubleN Realty — including text, graphics,
          logos, and software — is our intellectual property and is protected under applicable Thai
          and international copyright law. You may not reproduce, distribute, or create derivative
          works without our prior written consent.
        </p>
        <p className="mt-3">
          Property photos, descriptions, and details provided by landlords remain the intellectual
          property of the respective landlord. By submitting content to us, landlords grant
          DoubleN Realty a non-exclusive, royalty-free licence to display and promote that content
          on the Platform.
        </p>

        {/* 8 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          8. Disclaimer of Warranties
        </h2>
        <p>
          The Platform is provided on an <strong>&quot;as is&quot;</strong> and{' '}
          <strong>&quot;as available&quot;</strong> basis without warranties of any kind, whether
          express or implied. We do not warrant that:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>The Platform will be uninterrupted, error-free, or secure</li>
          <li>Any information or listings are accurate, complete, or up to date</li>
          <li>Results obtained from using the Platform will meet your expectations</li>
        </ul>

        {/* 9 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          9. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by Thai law, DoubleN Realty and its team shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages arising
          from:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Your use of, or inability to use, the Platform</li>
          <li>Any rental transaction or agreement between you and a landlord</li>
          <li>Any inaccuracy or omission in a property listing</li>
          <li>Conduct of any landlord or other Platform user</li>
          <li>Unauthorised access to your account or data</li>
        </ul>
        <p className="mt-3">
          Our total aggregate liability for any claim arising from these Terms or your use of
          the Platform shall not exceed the greater of (a) any fees you have paid us in the
          preceding 12 months or (b) THB 1,000.
        </p>

        {/* 10 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          10. Third-Party Links
        </h2>
        <p>
          The Platform may contain links to third-party websites or services (such as Google Maps
          or LINE). These links are provided for convenience only. We have no control over
          third-party sites and accept no responsibility for their content, privacy practices, or
          availability.
        </p>

        {/* 11 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          11. Privacy
        </h2>
        <p>
          Our collection and use of your personal data is governed by our{' '}
          <Link href={`/${locale}/privacy`} className="text-[#1E6B69] hover:underline">
            Privacy Policy
          </Link>
          , which forms part of these Terms.
        </p>

        {/* 12 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          12. Changes to These Terms
        </h2>
        <p>
          We may revise these Terms at any time by updating this page. Material changes will be
          noted with a revised &quot;last updated&quot; date. Your continued use of the Platform
          after any changes constitutes your acceptance of the revised Terms.
        </p>

        {/* 13 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          13. Governing Law &amp; Dispute Resolution
        </h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the{' '}
          <strong>Kingdom of Thailand</strong>. Any dispute arising from or relating to these Terms
          or your use of the Platform shall be subject to the exclusive jurisdiction of the courts
          of Bangkok, Thailand.
        </p>

        {/* 14 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">14. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us:
        </p>
        <div className="mt-3 bg-gray-50 rounded-lg p-4 text-sm space-y-1">
          <p>
            <strong>DoubleN Realty</strong>
          </p>
          <p>Bangkok, Thailand</p>
          <p>
            Email:{' '}
            <a href="mailto:janjiranui@gmail.com" className="text-[#1E6B69] hover:underline">
              janjiranui@gmail.com
            </a>
          </p>
        </div>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-[#1E6B69] hover:underline text-sm font-medium">
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}
