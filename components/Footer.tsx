import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const quickLinks = [
  { label: "หน้าแรก", href: "/" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "แบรนด์รถยนต์", href: "/cars" },
  { label: "ข่าวสารและกิจกรรม", href: "/blog" },
  { label: "รางวัลและกิจกรรม", href: "/awards" },
  { label: "สาขาของเรา", href: "/branches" },
];

const serviceLinks = [
  { label: "นัดหมายทดลองขับ", href: "/booking?type=test_drive" },
  { label: "นัดหมายบริการ", href: "/booking?type=service" },
  { label: "ประกันภัยรถยนต์", href: "/insurance" },
  { label: "ซื้อขายรถมือสอง", href: "/secondhand" },
  { label: "เรื่องราวลูกค้า", href: "/stories" },
  { label: "ร่วมงานกับเรา", href: "/career" },
];

const brands = ["Mazda", "Ford", "Mitsubishi", "GWM", "Deepal", "Kia"];

export default function Footer() {
  return (
    <footer className="bg-[#131F3C] text-white">
      {/* Main footer */}
      <div className="container py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: Logo + About + Contact */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 shrink-0">
                  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M18 2L4 8V18C4 25.73 10.24 32.98 18 35C25.76 32.98 32 25.73 32 18V8L18 2Z" fill="url(#footer-shield)"/>
                    <text x="18" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="serif">ช</text>
                    <defs>
                      <linearGradient id="footer-shield" x1="18" y1="2" x2="18" y2="35" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3B82F6"/>
                        <stop offset="1" stopColor="#1B3A6B"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-white text-[15px] leading-tight">CH.ERAWAN</div>
                  <div className="text-[9px] text-white/40 tracking-[0.12em] uppercase">Auto Group</div>
                </div>
            </Link>

            <p className="text-white/50 text-sm leading-relaxed mb-6">
              กลุ่มบริษัท ช.เอราวัณ ผู้จำหน่ายรถยนต์อย่างเป็นทางการ 6 แบรนด์ชั้นนำ ด้วยประสบการณ์กว่า 57 ปี ในจังหวัดนครปฐมและนครปฐม
            </p>

            {/* Contact details */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/30" />
                <span>75/2 หมู่ 1 ต.ธรรมศาลา อ.เมือง<br />จ.นครปฐม 73000</span>
              </div>
              <a href="tel:034305500" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0 text-white/30" />
                034-305-500
              </a>
              <a href="mailto:info@cherawan.co.th" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors">
                <Mail className="w-4 h-4 shrink-0 text-white/30" />
                info@cherawan.co.th
              </a>
              <div className="flex items-start gap-2.5 text-sm text-white/60">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-white/30" />
                <span>จันทร์ – เสาร์: 08.30 – 17.30 น.<br />อาทิตย์: 09.00 – 17.00 น.</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">เกี่ยวกับเรา</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">บริการ</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Brands + Social */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">แบรนด์รถยนต์</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {brands.map((brand) => (
                <Link key={brand} href={`/cars?brand=${brand}`} className="text-xs text-white/50 border border-white/15 px-3 py-1.5 rounded-md hover:border-white/40 hover:text-white transition-all">
                  {brand}
                </Link>
              ))}
            </div>

            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">ติดตามเรา</h3>
            <div className="flex items-center gap-2">
              {/* LINE */}
              <a href="https://lin.ee/erawan" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/8 hover:bg-[#06C755] flex items-center justify-center text-white/50 hover:text-white transition-all"
                aria-label="LINE">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/cherawan.autogroup" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/8 hover:bg-[#1877F2] flex items-center justify-center text-white/50 hover:text-white transition-all"
                aria-label="Facebook">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* YouTube - ยังไม่มี channel */}
              <a href="https://www.youtube.com/@cherawanautogroup" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/8 hover:bg-[#FF0000] flex items-center justify-center text-white/50 hover:text-white transition-all"
                aria-label="YouTube">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Instagram - ยังไม่มี account */}
              <a href="https://www.instagram.com/cherawanautogroup/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/8 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#FCAF45] flex items-center justify-center text-white/50 hover:text-white transition-all"
                aria-label="Instagram">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30 text-center md:text-left">
            © {new Date().getFullYear()} บริษัท ช.เอราวัณ จำกัด · สงวนลิขสิทธิ์ทั้งหมด
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">นโยบายคุ้มครองข้อมูลส่วนบุคคล</Link>
            <span className="hidden md:inline text-white/15">|</span>
            <Link href="/privacy-cctv" className="hover:text-white/70 transition-colors">นโยบาย CCTV</Link>
            <span className="hidden md:inline text-white/15">|</span>
            <Link href="/cookie-policy" className="hover:text-white/70 transition-colors">นโยบายคุกกี้</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
