"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  BRANDS,
  GWM_SUB_LINES,
  getBrandHref,
  getGwmLineHref,
  type BrandSlug,
} from "@/lib/brandConfig";
import { cn } from "@/lib/utils";

interface BrandNavTileProps {
  href: string;
  logoSrc: string;
  name: string;
  sublabel?: string;
  compact?: boolean;
  className?: string;
}

export function BrandNavTile({
  href,
  logoSrc,
  name,
  sublabel,
  compact = false,
  className,
}: BrandNavTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center justify-center rounded-xl border border-gray-100 hover:border-[#DD5259]/30 hover:shadow-lg transition-all bg-white text-center min-h-[44px]",
        compact ? "p-3" : "p-5",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-gray-50 mb-2",
          compact ? "w-12 h-12" : "w-16 h-16"
        )}
      >
        <BrandLogo
          src={logoSrc}
          alt={name}
          width={compact ? 64 : 88}
          height={compact ? 24 : 32}
          className={cn(
            "object-contain opacity-80 group-hover:opacity-100 transition-opacity",
            compact ? "h-5" : "h-7"
          )}
        />
      </div>
      <div className="font-semibold text-sm text-[#131F3C]">{name}</div>
      {sublabel && (
        <div className="text-xs text-gray-400 mt-0.5 group-hover:text-[#DD5259] transition-colors">
          {sublabel}
        </div>
      )}
    </Link>
  );
}

function GwmSubLineLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", compact ? "mt-2" : "mt-3 justify-center")}>
      {GWM_SUB_LINES.map((line) => (
        <Link
          key={line.slug}
          href={getGwmLineHref(line.slug)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-100 hover:border-[#DD5259]/30 px-2 py-1 min-h-[32px] bg-gray-50/80 hover:bg-white transition-all text-xs font-medium text-gray-600 hover:text-[#131F3C]"
        >
          <BrandLogo
            src={line.logoPath}
            alt={line.displayName}
            width={48}
            height={16}
            className="h-3.5 w-auto opacity-70"
          />
          {line.displayName}
        </Link>
      ))}
    </div>
  );
}

export function BrandMegaMenuGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {BRANDS.map((brand) =>
        brand.slug === "gwm" ? (
          <div key={brand.slug} className="flex flex-col">
            <BrandNavTile
              href={brand.hubPath}
              logoSrc={brand.logoPath}
              name={brand.displayNameTh}
              sublabel="ดูรุ่นรถ →"
              className="flex-1"
            />
            <GwmSubLineLinks />
          </div>
        ) : (
          <BrandNavTile
            key={brand.slug}
            href={brand.hubPath}
            logoSrc={brand.logoPath}
            name={brand.displayNameTh}
            sublabel="ดูรุ่นรถ →"
          />
        )
      )}
    </div>
  );
}

/** Full desktop mega menu panel — rendered only when dropdown is open */
export function BrandMegaMenuPanel() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#131F3C]">
          แบรนด์รถยนต์ที่ ช.เอราวัณ ออโต้ กรุ๊ป
        </h3>
        <p className="text-sm text-gray-400 mt-1">เลือกแบรนด์เพื่อดูรุ่นรถทั้งหมด</p>
      </div>
      <BrandMegaMenuGrid />
      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
        <Link
          href="/cars"
          className="text-sm text-[#131F3C] font-semibold hover:underline"
        >
          ดูรถยนต์ทั้งหมด →
        </Link>
        <Link
          href="/cars?condition=used"
          className="text-sm text-gray-400 hover:text-[#131F3C] transition-colors"
        >
          รถยนต์มือสอง →
        </Link>
      </div>
    </div>
  );
}

/** @deprecated Use nested GWM links in BrandMegaMenuGrid instead */
export function GwmSubLineRow({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        compact ? "mt-2" : "mt-4 pt-4 border-t border-gray-100"
      )}
    >
      {!compact && (
        <span className="w-full text-xs text-gray-400 mb-1">สายย่อย GWM</span>
      )}
      {GWM_SUB_LINES.map((line) => (
        <Link
          key={line.slug}
          href={getGwmLineHref(line.slug)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-100 hover:border-[#DD5259]/30 px-3 py-2 min-h-[44px] bg-gray-50/50 hover:bg-white transition-all"
        >
          <BrandLogo
            src={line.logoPath}
            alt={line.displayName}
            width={56}
            height={20}
            className="h-4 w-auto opacity-70"
          />
          <span className="text-xs font-medium text-gray-600">
            {line.displayName}
          </span>
        </Link>
      ))}
      <Link
        href={getBrandHref("gwm" as BrandSlug)}
        className="inline-flex items-center px-3 py-2 min-h-[44px] text-xs font-medium text-[#131F3C] hover:text-[#DD5259]"
      >
        GWM ทั้งหมด →
      </Link>
    </div>
  );
}

export function MobileBrandLinks() {
  return (
    <div className="ml-4 mt-1 space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            href={brand.hubPath}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-[#131F3C] min-h-[44px]"
          >
            <BrandLogo
              src={brand.logoPath}
              alt={brand.displayName}
              width={48}
              height={18}
              className="h-4 w-auto shrink-0 opacity-70"
            />
            <span className="font-medium truncate">{brand.displayNameTh}</span>
          </Link>
        ))}
      </div>
      <GwmSubLineRow compact />
      <Link
        href="/cars"
        className="block px-3 py-2.5 text-sm font-semibold text-[#131F3C] hover:text-[#DD5259]"
      >
        ดูรถยนต์ทั้งหมด →
      </Link>
    </div>
  );
}
