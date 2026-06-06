import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SITE_NAME, pageMetadata } from "@/lib/site";
import { Mail, MessageCircle, ArrowRight, Shield, Zap, Globe, Handshake } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: `About Us | ${SITE_NAME}`,
    description:
      "DoubleN Realty connects expats and foreigners with the best rental homes in Thailand. Transparent, fast, no commissions.",
    path: "/about",
  });
}

const VALUES = [
  {
    icon: <Handshake className="w-6 h-6" />,
    title: "Transparency",
    description:
      "No hidden fees, no inflated prices. Every listing shows the real rent — what you see is what you pay.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Speed",
    description:
      "Browse verified listings instantly. Book a viewing in minutes via LINE, WhatsApp, or email.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified",
    description:
      "Every property is reviewed by our team before it goes live. No scams, no ghost listings.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Multilingual",
    description:
      "Our platform speaks 15 languages so you can search, compare, and communicate in your own language.",
  },
];

const TEAM = [
  { initials: "NN", name: "Nunt N.", role: "Co-founder & CEO" },
  { initials: "AP", name: "Alex P.", role: "Co-founder & Head of Operations" },
  { initials: "SK", name: "Sara K.", role: "Head of Listings" },
  { initials: "JM", name: "James M.", role: "Customer Success" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
            Founded by expats, for expats
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
            About <span className="text-blue-400">DoubleN</span> Realty
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We connect expats and foreigners with the best rental homes in Thailand.
            Transparent, fast, no commissions.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              We believe finding a home should be exciting — not stressful. Our mission is to
              make renting property in Thailand simple, transparent, and stress-free for
              international residents.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We curate only verified properties, surface real prices, and support you in 15
              languages every step of the way.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-3xl p-8">
            <div className="space-y-4">
              {["Verified listings only", "No hidden commissions", "Support in 15 languages", "Response within 24 hours"].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Our Story</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Founded by expats, for expats.
          </p>
          <p className="text-gray-500 leading-relaxed text-lg max-w-2xl mx-auto">
            We know how hard it is to find a good home in Thailand as a foreigner — language
            barriers, unreliable listings, surprise fees. We built DoubleN to change that.
            Every feature on this platform was designed from personal experience of arriving in
            Bangkok with a suitcase and needing a home fast.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900 mb-3">What We Stand For</h2>
            <p className="text-gray-500">Four principles we never compromise on.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Meet the Team</h2>
            <p className="text-gray-500">
              A small, passionate team of expats and Thailand lovers.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.initials} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xl font-black flex items-center justify-center mx-auto mb-4">
                  {member.initials}
                </div>
                <div className="font-bold text-gray-900 text-sm">{member.name}</div>
                <div className="text-xs text-gray-400 mt-1">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Get in Touch</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Questions? We&apos;re here to help — in your language, on your timeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:hello@doublen-realty.com"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@doublen-realty.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
