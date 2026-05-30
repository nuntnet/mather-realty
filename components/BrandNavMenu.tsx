"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import {
  BRANDS,
  GWM_SUB_LINES,
  getBrandHref,
  getGwmLineHref,
  type BrandConfig,
  type BrandSlug,
} from "@/lib/brandConfig";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface BrandNavTileProps {
  brand: BrandConfig;
  compact?: boolean;
  showFeatured?: boolean;
  showGwmSubLines?: boolean;
  className?: string;
}

function FeaturedModelLinks({
  brand,
  compact = false,
}: {
  brand: BrandConfig;
  compact?: boolean;
}) {
  if (!brand.featuredModels?.length) return null;

  return (
    <ul
      className={cn(
        "space-y-1",
        compact ? "mt-2" : "mt-3 border-t border-gray-100/80 pt-3"
      )}
    >
      {brand.featuredModels.map((model) => (
        <li key={model.slug}>
          <Link
            href={`/cars/${model.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="group/model flex items-center justify-between gap-2 rounded-md px-2 py-1.5 min-h-[32px] text-xs text-gray-500 hover:bg-[#131F3C]/5 hover:text-[#131F3C] transition-colors"
          >
            <span className="truncate">{model.name}</span>
            <ChevronRight className="w-3 h-3 shrink-0 opacity-0 -translate-x-1 group-hover/model:opacity-60 group-hover/model:translate-x-0 transition-all" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GwmSubLineLinks({
  compact = false,
  visible = true,
}: {
  compact?: boolean;
  visible?: boolean;
}) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("overflow-hidden", compact ? "mt-2" : "mt-3")}
    >
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 px-1">
        สายย่อย GWM
      </p>
      <div className={cn("flex flex-wrap gap-1.5", compact ? "" : "justify-center")}>
        {GWM_SUB_LINES.map((line) => (
          <Link
            key={line.slug}
            href={getGwmLineHref(line.slug)}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-100 hover:border-[#DD5259]/40 px-2 py-1 min-h-[32px] bg-gray-50/80 hover:bg-white transition-all text-xs font-medium text-gray-600 hover:text-[#131F3C]"
          >
            <BrandLogo
              src={line.logoPath}
              alt={line.displayName}
              width={48}
              height={16}
              className="h-3.5 w-auto opacity-80"
            />
            {line.displayName}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export function BrandNavTile({
  brand,
  compact = false,
  showFeatured = false,
  showGwmSubLines = false,
  className,
}: BrandNavTileProps) {
  const [hovered, setHovered] = useState(false);
  const tileRef = useRef<HTMLAnchorElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50 });

  const handleMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = tileRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const active = hovered || showFeatured || showGwmSubLines;

  return (
    <Link
      ref={tileRef}
      href={brand.hubPath}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setSpot({ x: 50, y: 50 });
      }}
      onMouseMove={handleMove}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-white text-center min-h-[44px] transition-[border-color,box-shadow,transform] duration-300",
        active
          ? "border-[#DD5259]/35 shadow-lg shadow-[#131F3C]/8 scale-[1.02]"
          : "border-gray-100 hover:border-[#DD5259]/20",
        compact ? "p-3" : "p-5",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity: active ? 1 : undefined,
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(221,82,89,0.12) 0%, rgba(19,31,60,0.04) 45%, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col flex-1">
        <motion.div
          className={cn(
            "mx-auto flex items-center justify-center rounded-lg bg-gray-50 mb-2",
            compact ? "w-12 h-12" : "w-16 h-16"
          )}
          animate={{ scale: active ? 1.05 : 1, y: active ? -2 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <BrandLogo
            src={brand.logoPath}
            alt={brand.displayName}
            width={compact ? 64 : 100}
            height={compact ? 24 : 36}
            className={cn(
              "object-contain transition-opacity duration-300",
              compact ? "h-5 max-w-[64px]" : "h-7 max-w-[88px]",
              active ? "opacity-100" : "opacity-75"
            )}
          />
        </motion.div>

        <div className="font-semibold text-sm text-[#131F3C]">
          {brand.displayNameTh}
        </div>
        <div
          className={cn(
            "text-xs mt-0.5 transition-colors",
            active ? "text-[#DD5259]" : "text-gray-400"
          )}
        >
          ดูรุ่นรถ →
        </div>

        <AnimatePresence>
          {showFeatured && brand.featuredModels?.length ? (
            <motion.div
              key="featured"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <FeaturedModelLinks brand={brand} compact={compact} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {brand.slug === "gwm" && (
          <AnimatePresence>
            {showGwmSubLines ? (
              <GwmSubLineLinks key="gwm-sublines" compact={compact} visible />
            ) : null}
          </AnimatePresence>
        )}
      </div>
    </Link>
  );
}

export function BrandMegaMenuGrid() {
  const [hoveredSlug, setHoveredSlug] = useState<BrandSlug | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelSpot, setPanelSpot] = useState({ x: 50, y: 30 });

  const handlePanelMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div
      ref={panelRef}
      onMouseMove={handlePanelMove}
      className="relative"
      onMouseLeave={() => setHoveredSlug(null)}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${panelSpot.x}% ${panelSpot.y}%, rgba(221,82,89,0.06), transparent 55%)`,
        }}
        aria-hidden
      />

      <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {BRANDS.map((brand) => (
          <div
            key={brand.slug}
            onMouseEnter={() => setHoveredSlug(brand.slug)}
          >
            <BrandNavTile
              brand={brand}
              showFeatured={hoveredSlug === brand.slug}
              showGwmSubLines={
                brand.slug === "gwm" && hoveredSlug === "gwm"
              }
            />
          </div>
        ))}
      </div>
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
        <p className="text-sm text-gray-400 mt-1">
          เลือกแบรนด์เพื่อดูรุ่นรถทั้งหมด — ชี้เมาส์เพื่อดูรุ่นยอดนิยม
        </p>
      </div>
      <BrandMegaMenuGrid />
      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
        <Link
          href="/cars"
          className="text-sm text-[#131F3C] font-semibold hover:text-[#DD5259] transition-colors"
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

function MobileBrandTile({ brand }: { brand: BrandConfig }) {
  const [expanded, setExpanded] = useState(false);
  const isGwm = brand.slug === "gwm";
  const hasExtra = isGwm || (brand.featuredModels?.length ?? 0) > 0;

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden bg-white">
      <div className="flex items-stretch min-h-[44px]">
        <Link
          href={brand.hubPath}
          className="flex flex-1 items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#131F3C] min-h-[44px]"
        >
          <BrandLogo
            src={brand.logoPath}
            alt={brand.displayName}
            width={56}
            height={20}
            className="h-4 w-auto shrink-0 opacity-80"
          />
          <span className="font-medium truncate">{brand.displayNameTh}</span>
        </Link>
        {hasExtra && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="px-3 border-l border-gray-100 text-gray-400 hover:text-[#131F3C] hover:bg-gray-50 min-w-[44px]"
            aria-expanded={expanded}
            aria-label={
              expanded
                ? `ซ่อนรายละเอียด ${brand.displayNameTh}`
                : `ดูรายละเอียด ${brand.displayNameTh}`
            }
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              ▾
            </motion.span>
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-gray-100 bg-gray-50/50 px-3 py-2"
          >
            {brand.featuredModels?.length ? (
              <FeaturedModelLinks brand={brand} compact />
            ) : null}
            {isGwm ? <GwmSubLineLinks compact visible /> : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileBrandLinks() {
  return (
    <div className="ml-4 mt-1 space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {BRANDS.map((brand) => (
          <MobileBrandTile key={brand.slug} brand={brand} />
        ))}
      </div>
      <Link
        href="/cars"
        className="block px-3 py-2.5 text-sm font-semibold text-[#131F3C] hover:text-[#DD5259] min-h-[44px]"
      >
        ดูรถยนต์ทั้งหมด →
      </Link>
    </div>
  );
}
