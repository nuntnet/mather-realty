import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import CompanyLogo from "@/components/CompanyLogo";
import { branches } from "@/lib/branchData";

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

export default function Footer() {
  return (
    <footer className="bg-[#131F3C] text-white">
      {/* Main footer */}
      <div className="container py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: Logo + About + Contact */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="inline-flex mb-5" aria-label="ช.เอราวัณ ออโต้ กรุ๊ป — หน้าแรก">
              <CompanyLogo height={56} className="h-14 w-auto" />
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

          {/* Column 4: Branches + Social */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">สาขาของเรา</h3>
            <ul className="space-y-3 mb-6">
              {branches.map((branch) => (
                <li key={branch.id}>
                  <Link
                    href="/branches"
                    className="text-sm text-white/50 hover:text-white transition-colors leading-snug block"
                  >
                    {branch.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/branches"
              className="inline-flex items-center text-xs text-white/40 hover:text-white/70 transition-colors mb-8"
            >
              ดูสาขาทั้งหมดและแผนที่ →
            </Link>

            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">ติดตามเรา</h3>
            <div className="flex items-center gap-2">
              {/* Facebook - verified */}
              <a href="https://www.facebook.com/cherawan.autogroup" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/8 hover:bg-[#1877F2] flex items-center justify-center text-white/50 hover:text-white transition-all"
                aria-label="Facebook">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* LINE - placeholder, disabled until real link */}
              <span
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/20 cursor-not-allowed"
                title="เร็วๆ นี้"
                aria-label="LINE (เร็วๆ นี้)">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30 text-center md:text-left">
            © {new Date().getFullYear()} กลุ่มบริษัท ช.เอราวัณ ออโต้ กรุ๊ป · สงวนลิขสิทธิ์ทั้งหมด
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
