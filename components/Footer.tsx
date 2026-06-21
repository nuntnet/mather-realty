import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

const LINE_SVG = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

const WHATSAPP_SVG = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const INSTAGRAM_SVG = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0C1A1A] text-white">

      {/* ── Top CTA band ─────────────────────────────────────────────────── */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-white leading-snug">
              {t("looking_for_home")}
            </p>
            <p className="text-sm text-white/50 mt-1">
              {t("here_247")}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/66869902999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1dbd57] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
            >
              {WHATSAPP_SVG}
              WhatsApp
            </a>
            <a
              href="https://line.me/R/ti/p/treasurenui"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#00B900] hover:bg-[#009900] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
            >
              {LINE_SVG}
              LINE
            </a>
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1: Brand */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" aria-label="DoubleN Realty" className="inline-block hover:opacity-80 transition-opacity">
              <span className="font-serif font-semibold tracking-tight text-2xl leading-none">
                <span className="text-white">Double</span>
                <span className="text-[#C9935A]">N</span>
                <span className="text-white"> Realty</span>
              </span>
            </Link>
            <p className="text-sm text-white/45 leading-relaxed">
              {site.description}.<br />
              Bangkok &amp; beyond 🇹🇭
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2.5">
              <a href="https://wa.me/66869902999" target="_blank" rel="noopener noreferrer"
                 className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all" aria-label="WhatsApp">
                {WHATSAPP_SVG}
              </a>
              {site.social.line && (
                <a href={site.social.line} target="_blank" rel="noopener noreferrer"
                   className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00B900]/15 text-[#00B900] hover:bg-[#00B900] hover:text-white transition-all" aria-label="LINE">
                  {LINE_SVG}
                </a>
              )}
              {site.social.instagram && (
                <a href={`https://instagram.com/${site.social.instagram}`} target="_blank" rel="noopener noreferrer"
                   className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-white/60 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 hover:text-white transition-all" aria-label="Instagram">
                  {INSTAGRAM_SVG}
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Explore */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">{t("explore")}</h3>
            <ul className="space-y-2.5">
              {([
                { label: tNav("properties"), href: "/properties" },
                { label: tNav("blog"), href: "/blog" },
                { label: tNav("howItWorks"), href: "/how-it-works" },
                { label: tNav("submitListing"), href: "/submit" },
              ] as { label: string; href: string }[]).map(({ label, href }) => (
                <li key={href}>
                  <Link href={href as Parameters<typeof Link>[0]["href"]} className="text-sm text-white/50 hover:text-[#4DB5B2] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">{t("company")}</h3>
            <ul className="space-y-2.5">
              {([
                { label: t("about_us"), href: "/about" },
                { label: t("contact_us"), href: "/contact" },
              ] as { label: string; href: string }[]).map(({ label, href }) => (
                <li key={href}>
                  <Link href={href as Parameters<typeof Link>[0]["href"]} className="text-sm text-white/50 hover:text-[#4DB5B2] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">{t("contact_us")}</h3>
            <address className="not-italic space-y-2.5 text-sm text-white/50">
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-[#4DB5B2] transition-colors">
                  {site.email}
                </a>
              </p>
              <p>
                <a href="tel:+66869902999" className="hover:text-[#4DB5B2] transition-colors">
                  +66 86 990 2999
                </a>
              </p>
              <p>LINE: <span className="text-white/70">treasurenui</span></p>
            </address>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4DB5B2] bg-[#1E6B69]/12 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DB5B2] animate-pulse" />
              {t("available_badge")}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {year} DoubleN Realty · {t("rights")}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">{t("privacy")}</Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">{t("terms")}</Link>
            <Link href="/cookie-policy" className="text-xs text-white/30 hover:text-white/60 transition-colors">{t("cookies")}</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
