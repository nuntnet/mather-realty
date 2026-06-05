import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | DoubleN Realty',
  description:
    'Learn how DoubleN Realty collects, uses, and protects your personal information in accordance with Thai PDPA law.',
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="pt-28 pb-16 max-w-3xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: June 2025</p>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">

        <p>
          DoubleN Realty (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to
          protecting your privacy. This Privacy Policy describes how we collect, use, share, and
          protect personal information when you use our platform at{' '}
          <strong>doublen-realty.com</strong> — a rental property marketplace connecting expats and
          foreigners in Thailand with local landlords.
        </p>
        <p>
          This policy is written in compliance with the{' '}
          <strong>Personal Data Protection Act B.E. 2562 (PDPA)</strong>, Thailand&apos;s data
          protection law.
        </p>

        {/* 1 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Data Controller</h2>
        <p>
          DoubleN Realty is the data controller responsible for your personal data. You can contact
          us at{' '}
          <a href="mailto:janjiranui@gmail.com" className="text-[#46a758] hover:underline">
            janjiranui@gmail.com
          </a>{' '}
          with any data-related requests or questions.
        </p>

        {/* 2 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          2. Information We Collect
        </h2>
        <p>We collect personal information in the following ways:</p>

        <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">
          a) Information You Provide
        </h3>
        <p>
          When you submit a property inquiry or contact form on our platform, we collect:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            <strong>Full name</strong> — to identify you in communications with landlords
          </li>
          <li>
            <strong>Email address</strong> — for follow-up and notifications
          </li>
          <li>
            <strong>Phone number</strong> — for direct contact by the landlord
          </li>
          <li>
            <strong>LINE or WhatsApp contact</strong> — if provided, as an alternative contact
            channel
          </li>
          <li>
            <strong>Preferred viewing date</strong> — to schedule property viewings
          </li>
          <li>
            <strong>Message / notes</strong> — any additional information you choose to share
          </li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">
          b) Information Collected Automatically
        </h3>
        <p>When you visit our site, we automatically collect:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>IP address and approximate location (country/city level)</li>
          <li>Browser type, operating system, and device information</li>
          <li>Pages visited, time on site, and interaction data</li>
          <li>Search queries entered on our property search</li>
          <li>Referral source (how you found our site)</li>
        </ul>
        <p className="mt-3">
          This data is collected via cookies and analytics tools. See our{' '}
          <Link href="/cookie-policy" className="text-[#46a758] hover:underline">
            Cookie Policy
          </Link>{' '}
          for details.
        </p>

        <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">
          c) Account Information (if applicable)
        </h3>
        <p>
          If you register an account (e.g. as a landlord), we also collect your email address,
          hashed password, and account role. We do not store plaintext passwords.
        </p>

        {/* 3 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          3. How We Use Your Information
        </h2>
        <p>We use your personal data for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            <strong>Connecting you with landlords</strong> — your inquiry details are forwarded to
            the relevant landlord so they can arrange viewings and answer questions
          </li>
          <li>
            <strong>Platform operation</strong> — managing your account, authenticating sessions,
            and providing core functionality
          </li>
          <li>
            <strong>Communications</strong> — sending confirmation emails for submitted inquiries
            and responding to support requests
          </li>
          <li>
            <strong>Improving our platform</strong> — analysing usage patterns, search behaviour,
            and property views to enhance the user experience
          </li>
          <li>
            <strong>Legal compliance</strong> — fulfilling obligations under applicable Thai laws
          </li>
        </ul>

        {/* 4 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Legal Basis</h2>
        <p>Under the PDPA, we process your data based on the following lawful grounds:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            <strong>Contractual necessity</strong> — processing your inquiry to fulfil your request
            to connect with a landlord
          </li>
          <li>
            <strong>Legitimate interests</strong> — analysing platform performance and preventing
            fraud
          </li>
          <li>
            <strong>Consent</strong> — for analytics cookies (where required)
          </li>
          <li>
            <strong>Legal obligation</strong> — where required by Thai law
          </li>
        </ul>

        {/* 5 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Data Sharing</h2>
        <p>
          We do <strong>not</strong> sell your personal data. We share your information only in
          the following limited circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            <strong>Landlords</strong> — when you submit an inquiry for a specific property, your
            name and contact details are shared with that property&apos;s landlord solely to
            facilitate the viewing or rental process
          </li>
          <li>
            <strong>Service providers</strong> — we use third-party services that process data on
            our behalf under strict data processing agreements:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>
                <strong>Vercel</strong> — website hosting and serverless infrastructure
              </li>
              <li>
                <strong>Notion</strong> — content management system (property and blog data)
              </li>
              <li>
                <strong>Google Analytics</strong> — anonymised usage analytics
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery
              </li>
              <li>
                <strong>Cloudinary</strong> — property image hosting
              </li>
              <li>
                <strong>Turso (SQLite)</strong> — authentication and session storage
              </li>
            </ul>
          </li>
          <li>
            <strong>Legal requirements</strong> — if required by a court order, government
            authority, or applicable law
          </li>
        </ul>

        {/* 6 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Data Retention</h2>
        <p>
          We retain your personal data only for as long as necessary for the purposes described
          in this policy:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            <strong>Inquiry data</strong> — retained for up to 2 years to support follow-up
            and dispute resolution
          </li>
          <li>
            <strong>Account data</strong> — retained for the duration of your account and up
            to 1 year after deletion on request
          </li>
          <li>
            <strong>Analytics data</strong> — retained for up to 26 months as set by Google
            Analytics
          </li>
        </ul>

        {/* 7 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Cookies</h2>
        <p>
          We use cookies for session management, analytics, and functional preferences. For a full
          explanation of which cookies we use and how to control them, please see our{' '}
          <Link href="/cookie-policy" className="text-[#46a758] hover:underline">
            Cookie Policy
          </Link>.
        </p>

        {/* 8 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          8. Your Rights Under PDPA
        </h2>
        <p>
          Under Thailand&apos;s Personal Data Protection Act (PDPA), you have the following rights
          with respect to your personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Right of access</strong> — request a copy of the personal data we hold about
            you
          </li>
          <li>
            <strong>Right to rectification</strong> — request correction of inaccurate or
            incomplete data
          </li>
          <li>
            <strong>Right to erasure</strong> — request deletion of your data (&quot;right to be
            forgotten&quot;), subject to legal retention requirements
          </li>
          <li>
            <strong>Right to restriction</strong> — request that we limit how we process your data
            in certain circumstances
          </li>
          <li>
            <strong>Right to data portability</strong> — receive your data in a structured,
            machine-readable format
          </li>
          <li>
            <strong>Right to object</strong> — object to processing based on legitimate interests
          </li>
          <li>
            <strong>Right to withdraw consent</strong> — withdraw consent at any time where
            processing is based on consent (this does not affect the lawfulness of prior
            processing)
          </li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, please contact us at{' '}
          <a href="mailto:janjiranui@gmail.com" className="text-[#46a758] hover:underline">
            janjiranui@gmail.com
          </a>. We will respond within 30 days.
        </p>

        {/* 9 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          9. Data Security
        </h2>
        <p>
          We implement appropriate technical and organisational measures to protect your personal
          data against unauthorised access, loss, or disclosure. These include HTTPS encryption,
          hashed password storage, and access controls limiting who can view your data internally.
          However, no internet transmission is entirely secure, and we cannot guarantee absolute
          security.
        </p>

        {/* 10 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          10. International Transfers
        </h2>
        <p>
          Some of our service providers (such as Vercel, Google, and Cloudinary) are based outside
          Thailand. Where data is transferred internationally, we ensure appropriate safeguards are
          in place consistent with PDPA requirements.
        </p>

        {/* 11 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          11. Children&apos;s Privacy
        </h2>
        <p>
          Our platform is not directed at individuals under 18 years of age. We do not knowingly
          collect personal data from minors. If you believe we have inadvertently collected such
          data, please contact us immediately so we can delete it.
        </p>

        {/* 12 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          12. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy periodically. Material changes will be announced on
          our website with a revised &quot;last updated&quot; date. We encourage you to review
          this policy whenever you use our platform.
        </p>

        {/* 13 */}
        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">13. Contact Us</h2>
        <p>
          For any privacy-related questions, requests, or complaints, please contact our data
          controller:
        </p>
        <div className="mt-3 bg-gray-50 rounded-lg p-4 text-sm space-y-1">
          <p>
            <strong>DoubleN Realty</strong>
          </p>
          <p>Bangkok, Thailand</p>
          <p>
            Email:{' '}
            <a href="mailto:janjiranui@gmail.com" className="text-[#46a758] hover:underline">
              janjiranui@gmail.com
            </a>
          </p>
        </div>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-[#46a758] hover:underline text-sm font-medium">
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}
