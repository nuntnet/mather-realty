"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMegaMenuPanel, MobileBrandLinks } from "@/components/BrandNavMenu";
import CompanyLogo from "@/components/CompanyLogo";

const MEGA_MENU_LABEL = "แบรนด์รถยนต์";

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
  { label: MEGA_MENU_LABEL, href: "/cars", megaMenu: true },
  { label: "ทดลองขับ", href: "/booking?type=test_drive" },
  { label: "การประกันรถยนต์", href: "/insurance" },
  { label: "ข่าวสารและกิจกรรม", href: "/blog" },
  { label: "ติดต่อเรา", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeDropdown = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMobileBrandOpen(false);
    closeDropdown();
  }, [pathname, closeDropdown]);

  useEffect(() => {
    if (!activeDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      closeDropdown();
    };

    const handleScrollClose = () => closeDropdown();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDropdown();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollClose, { passive: true });
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollClose);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [activeDropdown, closeDropdown]);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  const megaMenuOpen = activeDropdown === MEGA_MENU_LABEL;

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 bg-white ${
        scrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-[68px]">
          <Link
            href="/"
            className="flex items-center shrink-0"
            aria-label="ช.เอราวัณ ออโต้ กรุ๊ป — หน้าแรก"
          >
            <CompanyLogo height={44} priority className="h-11 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() =>
                  item.children || item.megaMenu
                    ? handleMouseEnter(item.label)
                    : undefined
                }
                onMouseLeave={
                  item.megaMenu ? undefined : handleMouseLeave
                }
              >
                {item.megaMenu ? (
                  <button
                    type="button"
                    className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium transition-all whitespace-nowrap relative ${
                      isActive(item.href)
                        ? "text-[#131F3C] font-semibold"
                        : "text-[#4A5568] hover:text-[#131F3C]"
                    }`}
                    aria-expanded={megaMenuOpen}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        megaMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#DD5259] rounded-full" />
                    )}
                  </button>
                ) : (
                  <Link href={item.href}>
                    <span
                      className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium transition-all whitespace-nowrap relative ${
                        isActive(item.href)
                          ? "text-[#131F3C] font-semibold"
                          : "text-[#4A5568] hover:text-[#131F3C]"
                      }`}
                    >
                      {item.label}
                      {item.children && (
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            activeDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      )}
                      {isActive(item.href) && (
                        <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#DD5259] rounded-full" />
                      )}
                    </span>
                  </Link>
                )}

                {item.children && activeDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 mt-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100/80 py-2 z-50"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#131F3C] transition-colors font-medium"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center">
            <a href="tel:034305500">
              <Button
                size="sm"
                className="bg-[#131F3C] hover:bg-[#1a2a50] text-white font-semibold px-5 rounded-lg text-[13px] h-9 shadow-sm gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                034-305500
              </Button>
            </a>
          </div>

          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mega menu — full-width panel anchored to nav, not nested in narrow item */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            key="brand-mega-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden lg:block absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-100 z-50"
            onMouseEnter={() => handleMouseEnter(MEGA_MENU_LABEL)}
            onMouseLeave={handleMouseLeave}
          >
            <BrandMegaMenuPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="container py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.megaMenu ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMobileBrandOpen((open) => !open)}
                      className={`flex w-full items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-[#131F3C] bg-gray-50 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      aria-expanded={mobileBrandOpen}
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          mobileBrandOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileBrandOpen && <MobileBrandLinks />}
                  </>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-[#131F3C] bg-gray-50 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 mt-0.5 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-[#131F3C]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
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
