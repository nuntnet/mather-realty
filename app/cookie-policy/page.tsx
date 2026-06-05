import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy | DoubleN Realty',
  description: 'Learn how DoubleN Realty uses cookies and similar technologies on our platform.',
}

export default function CookiePolicyPage() {
  return (
    <div className="pt-28 pb-16 max-w-3xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: June 2025</p>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">

        <p>
          DoubleN Realty (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website at{' '}
          <strong>doublen-realty.com</strong>. This Cookie Policy explains what cookies are, how
          we use them, and how you can control them. By continuing to use our site, you consent to
          our use of cookies as described in this policy.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your device (computer, smartphone, or tablet) when
          you visit a website. They allow the site to remember your actions and preferences over
          time, so you don&apos;t have to re-enter them each visit. Cookies can be &quot;session
          cookies&quot; (deleted when you close your browser) or &quot;persistent cookies&quot;
          (stored for a set period).
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Cookies We Use</h2>
        <p>We use the following categories of cookies:</p>

        <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">a) Strictly Necessary Cookies</h3>
        <p>
          These cookies are essential for our platform to function. They enable core features such
          as secure login sessions, CSRF protection, and locale routing. You cannot opt out of
          these cookies as the site cannot operate without them.
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Session token</strong> — maintains your authenticated session</li>
          <li><strong>CSRF token</strong> — protects form submissions from cross-site attacks</li>
          <li><strong>Locale preference</strong> — remembers your selected language</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">b) Analytics Cookies</h3>
        <p>
          We use Google Analytics to understand how visitors interact with our site. This helps us
          improve the platform experience. All data collected is aggregated and anonymised.
        </p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border border-gray-200 border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-700">Cookie</th>
                <th className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-700">Provider</th>
                <th className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-700">Purpose</th>
                <th className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-700">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border border-gray-200 font-mono text-xs">_ga</td>
                <td className="px-4 py-2 border border-gray-200">Google Analytics</td>
                <td className="px-4 py-2 border border-gray-200">Distinguishes unique users</td>
                <td className="px-4 py-2 border border-gray-200">2 years</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border border-gray-200 font-mono text-xs">_gid</td>
                <td className="px-4 py-2 border border-gray-200">Google Analytics</td>
                <td className="px-4 py-2 border border-gray-200">Distinguishes users (short-term)</td>
                <td className="px-4 py-2 border border-gray-200">24 hours</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 font-mono text-xs">_ga_*</td>
                <td className="px-4 py-2 border border-gray-200">Google Analytics (GA4)</td>
                <td className="px-4 py-2 border border-gray-200">Maintains session state</td>
                <td className="px-4 py-2 border border-gray-200">2 years</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border border-gray-200 font-mono text-xs">_gat</td>
                <td className="px-4 py-2 border border-gray-200">Google Analytics</td>
                <td className="px-4 py-2 border border-gray-200">Throttles request rate</td>
                <td className="px-4 py-2 border border-gray-200">1 minute</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          For more information on how Google uses cookie data, visit{' '}
          <a
            href="https://policies.google.com/technologies/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E6B69] hover:underline"
          >
            policies.google.com/technologies/cookies
          </a>.
        </p>

        <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">c) Functional Cookies</h3>
        <p>
          Functional cookies remember choices you make to improve your experience, such as your
          preferred language or region. Disabling these may affect how the site behaves but will
          not prevent you from using core features.
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Locale/language</strong> — stores your preferred display language across visits</li>
          <li><strong>Search filters</strong> — remembers your last property search preferences</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. How to Manage Cookies</h2>
        <p>
          You can control and manage cookies in several ways. Please bear in mind that removing or
          blocking cookies can affect your user experience and some functionality may no longer be
          available.
        </p>

        <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">Browser Settings</h3>
        <p>
          Most browsers allow you to view, delete, and block cookies. Find instructions for your
          browser below:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            <strong>Google Chrome:</strong>{' '}
            Settings &rarr; Privacy and security &rarr; Cookies and other site data
          </li>
          <li>
            <strong>Mozilla Firefox:</strong>{' '}
            Options &rarr; Privacy &amp; Security &rarr; Cookies and Site Data
          </li>
          <li>
            <strong>Safari:</strong>{' '}
            Preferences &rarr; Privacy &rarr; Manage Website Data
          </li>
          <li>
            <strong>Microsoft Edge:</strong>{' '}
            Settings &rarr; Privacy, search, and services &rarr; Cookies
          </li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">Opt Out of Google Analytics</h3>
        <p>
          To opt out of Google Analytics tracking across all websites, you can install the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E6B69] hover:underline"
          >
            Google Analytics Opt-out Browser Add-on
          </a>.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Third-Party Cookies</h2>
        <p>
          Some pages on our site may embed content from third-party services (such as Google Maps
          for property location previews). These services may set their own cookies subject to their
          respective privacy policies. We do not control these cookies.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in technology,
          legislation, or our practices. When we do, we will revise the &quot;last updated&quot;
          date at the top of this page. We encourage you to review this policy periodically.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact us at:{' '}
          <a href="mailto:janjiranui@gmail.com" className="text-[#1E6B69] hover:underline">
            janjiranui@gmail.com
          </a>
        </p>

        <p className="mt-6">
          For more information on how we handle your personal data, please see our{' '}
          <Link href="/en/privacy" className="text-[#1E6B69] hover:underline">
            Privacy Policy
          </Link>.
        </p>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-[#1E6B69] hover:underline text-sm font-medium">
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}
