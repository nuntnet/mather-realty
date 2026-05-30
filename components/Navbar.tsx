"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BrandMegaMenuGrid,
  GwmSubLineRow,
  MobileBrandLinks,
} from "@/components/BrandNavMenu";

const navItems = [
  { label: "หน้าแรก", href: "/" },
  {
    label: "เกี่ยวกับเรา",
    href: "/about",
    children: [
      { label: "ประวัติบริษัท", href: "/about" },
      { label: "รางวัลและกิจกรรม", href: "/awards" },
      { label: "สาขาของเรา", href: "/branches" },
    ],
  },
  { label: "แบรนด์รถยนต์", href: "/cars", megaMenu: true },
  { label: "ทดลองขับ", href: "/booking?type=test_drive" },
  { label: "การประกันรถยนต์", href: "/insurance" },
  { label: "ข่าวสารและกิจกรรม", href: "/blog" },
  { label: "ติดต่อเรา", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white ${scrolled ? "shadow-md" : "border-b border-gray-100"}`}>
      <div className="container">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 shrink-0">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M18 2L4 8V18C4 25.73 10.24 32.98 18 35C25.76 32.98 32 25.73 32 18V8L18 2Z" fill="#1B3A6B"/>
                <path d="M18 2L4 8V18C4 25.73 10.24 32.98 18 35C25.76 32.98 32 25.73 32 18V8L18 2Z" fill="url(#sg)"/>
                <path d="M18 7L8 11.5V18C8 23.4 12.48 28.52 18 30.5C23.52 28.52 28 23.4 28 18V11.5L18 7Z" fill="#2E5EA8" opacity="0.5"/>
                <text x="18" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="serif">ช</text>
                <defs>
                  <linearGradient id="sg" x1="18" y1="2" x2="18" y2="35" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB"/><stop offset="1" stopColor="#1B3A6B"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="font-bold text-[#131F3C] text-[15px] leading-tight tracking-tight">CH.ERAWAN</div>
              <div className="text-[9px] text-gray-400 leading-tight tracking-[0.12em] uppercase font-medium">Auto Group</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => (item.children || item.megaMenu) ? handleMouseEnter(item.label) : undefined}
                onMouseLeave={handleMouseLeave}
              >
                <Link href={item.href}>
                  <button className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium transition-all whitespace-nowrap relative ${
                    isActive(item.href) ? "text-[#131F3C] font-semibold" : "text-[#4A5568] hover:text-[#131F3C]"
                  }`}>
                    {item.label}
                    {(item.children || item.megaMenu) && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                    )}
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#DD5259] rounded-full" />
                    )}
                  </button>
                </Link>

                {/* Dropdown submenu */}
                {item.children && activeDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 mt-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100/80 py-2 z-50"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.children.map((child) => (
                      <Link key={child.label} href={child.href}
                        className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#131F3C] transition-colors font-medium"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Mega menu */}
                {item.megaMenu && activeDropdown === item.label && (
                  <div
                    className="fixed left-0 right-0 top-[68px] bg-white shadow-2xl border-t border-gray-100 z-50"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="container py-8">
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#131F3C]">แบรนด์รถยนต์ที่ ช.เอราวัณ ออโต้ กรุ๊ป</h3>
                        <p className="text-sm text-gray-400 mt-1">เลือกแบรนด์เพื่อดูรุ่นรถทั้งหมด</p>
                      </div>
                      <BrandMegaMenuGrid />
                      <GwmSubLineRow />
                      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                        <Link href="/cars" className="text-sm text-[#131F3C] font-semibold hover:underline">ดูรถยนต์ทั้งหมด →</Link>
                        <Link href="/cars?condition=used" className="text-sm text-gray-400 hover:text-[#131F3C] transition-colors">รถยนต์มือสอง →</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center">
            <a href="tel:034305500">
              <Button size="sm" className="bg-[#131F3C] hover:bg-[#1a2a50] text-white font-semibold px-5 rounded-lg text-[13px] h-9 shadow-sm gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                034-305500
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="container py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link href={item.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    isActive(item.href) ? "text-[#131F3C] bg-gray-50 font-semibold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link key={child.label} href={child.href}
                        className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-[#131F3C]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
                {item.megaMenu && <MobileBrandLinks />}
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100">
              <a href="tel:034305500">
                <Button className="w-full bg-[#131F3C] hover:bg-[#1a2a50] text-white font-semibold h-11 gap-2">
                  <Phone className="w-4 h-4" />
                  034-305500
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
