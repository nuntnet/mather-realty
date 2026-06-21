import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SITE_NAME, site, pageMetadata } from "@/lib/site";
import {
  Mail, MessageCircle, ArrowRight, Shield, Zap, Globe, Handshake,
  MapPin, Languages, CheckCircle2, Users,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: `About Us | ${SITE_NAME}`,
    description: site.description,
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

const STATS = [
  { icon: <MapPin className="w-5 h-5" />, value: "10+", label: "Cities in Thailand" },
  { icon: <Languages className="w-5 h-5" />, value: "15", label: "Languages supported" },
  { icon: <CheckCircle2 className="w-5 h-5" />, value: "100%", label: "Verified listings" },
  { icon: <Users className="w-5 h-5" />, value: "24 hrs", label: "Response time" },
];

const TEAM = [
  { initials: "NN", name: "Nunt N.", role: "Co-founder & CEO" },
  { initials: "AP", name: "Alex P.", role: "Co-founder & Head of Operations" },
  { initials: "SK", name: "Sara K.", role: "Head of Listings" },
  { initials: "JM", name: "James M.", role: "Customer Success" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF]">

      {/* Hero */}
      <section className="-mt-16 pt-16 bg-gradient-to-br from-[#0F1C1B] via-[#16302E] to-[#0F1C1B] text-white py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1E6B69]/25 border border-[#1E6B69]/40 rounded-full px-4 py-1.5 text-sm text-[#7FCECC] mb-6">
            Founded by expats, for expats
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium text-white mb-5 leading-[1.05]">
            About <span className="text-[#C9935A]">DoubleN</span> Realty
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Thailand&apos;s rental platform for expats and foreigners.
            Verified properties. Multilingual support. No language barrier.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1E6B69] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className="text-[#A7D8D6]">{s.icon}</div>
              <div className="text-4xl font-serif font-medium">{s.value}</div>
              <div className="text-[#A7D8D6] text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 px-4 bg-[#F7F4EF]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-serif font-medium text-[#1A2624] mb-4">What We Do</h2>
            <p className="text-lg text-[#3a4543] leading-relaxed mb-4">
              DoubleN Realty is a rental property platform built for foreigners living in Thailand.
              We list verified homes, condos, and apartments across Bangkok, Chiang Mai, Phuket,
              and beyond — with full listings in 15 languages so you can find your next home
              without the language barrier.
            </p>
            <p className="text-[#6B8280] leading-relaxed">
              Whether you&apos;re relocating for work, retiring in the tropics, or just exploring
              long-term stays — we help you find the right home at the right price.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#E8F6F5] to-white rounded-2xl p-8 border border-[#E2DDD7]">
            <div className="space-y-4">
              {[
                "Verified listings only",
                "No hidden commissions",
                "Support in 15 languages",
                "Response within 24 hours",
                "Bangkok, Chiang Mai, Phuket & more",
                "Prices shown in THB & USD",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1E6B69] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[#1A2624] font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-serif font-medium text-[#1A2624] mb-6 text-center">Our Story</h2>
          <p className="text-xl text-[#1E6B69] leading-relaxed mb-8 text-center font-serif italic">
            Founded by expats, for expats.
          </p>
          <div className="space-y-5 text-[#6B8280] leading-relaxed text-lg">
            <p>
              Finding a rental property in Thailand as a foreigner can be complicated —
              language barriers, unverified listings, and confusing lease terms make the
              process frustrating.
            </p>
            <p>
              <strong className="text-[#1A2624] font-semibold">DoubleN Realty was built to fix that.</strong>
            </p>
            <p>
              We connect expats and international residents with trusted landlords across
              Thailand&apos;s most popular cities — Bangkok, Chiang Mai, Phuket, Pattaya, and more.
              Every listing is reviewed and verified by our team before it goes live.
            </p>
            <p>
              Our platform supports 15 languages including English, Thai, Japanese, Korean,
              Chinese, Russian, Arabic, and more — so wherever you&apos;re from, you can search,
              compare, and inquire in your own language.
            </p>
            <p>
              Every feature on this platform was designed from personal experience of arriving
              in Bangkok with a suitcase and needing a home fast.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 bg-[#F7F4EF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-medium text-[#1A2624] mb-3">What We Stand For</h2>
            <p className="text-[#6B8280]">Four principles we never compromise on.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-6 border border-[#E2DDD7] hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1E6B69] text-white flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-serif text-xl text-[#1A2624] mb-2">{v.title}</h3>
                <p className="text-sm text-[#6B8280] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-medium text-[#1A2624] mb-3">Meet the Team</h2>
            <p className="text-[#6B8280]">
              A small, passionate team of expats and Thailand lovers.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.initials} className="bg-[#F7F4EF] rounded-2xl p-6 text-center border border-[#E2DDD7]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E6B69] to-[#0F1C1B] text-white text-xl font-serif font-medium flex items-center justify-center mx-auto mb-4">
                  {member.initials}
                </div>
                <div className="font-semibold text-[#1A2624] text-sm">{member.name}</div>
                <div className="text-xs text-[#9BAEAC] mt-1">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#1E6B69] to-[#18605E] text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-medium text-white mb-4">Get in Touch</h2>
          <p className="text-white/80 mb-8 text-lg">
            Questions? We&apos;re here to help — in your language, on your timeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#1E6B69] font-semibold px-6 py-3 rounded-xl hover:bg-[#E8F6F5] transition-colors"
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
