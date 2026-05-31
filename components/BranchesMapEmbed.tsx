"use client";

import { useState } from "react";
import { branches } from "@/lib/branchData";
import { Phone, MapPin, Clock, ExternalLink, ChevronRight } from "lucide-react";

const BRAND_COLOR: Record<string, string> = {
  Mazda:      "#e60012",
  Ford:       "#003478",
  Mitsubishi: "#c8102e",
  GWM:        "#c8102e",
  Deepal:     "#0066ff",
  Kia:        "#05141f",
};

export default function BranchesMapEmbed() {
  const [selected, setSelected] = useState(branches[0]);
  const color = BRAND_COLOR[selected.brand] ?? "#DD5259";

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B1220]">

      {/* ── Mobile: horizontal pill tabs ── */}
      <div className="lg:hidden border-b border-white/10">
        <div className="flex overflow-x-auto scrollbar-none px-3 py-2.5 gap-2">
          {branches.map((b) => {
            const isActive = selected.id === b.id;
            const bc = BRAND_COLOR[b.brand] ?? "#DD5259";
            return (
              <button
                key={b.id}
                onClick={() => setSelected(b)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? "text-white border-white/20 bg-white/10"
                    : "text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: bc, boxShadow: isActive ? `0 0 6px 1px ${bc}` : "none" }}
                />
                {b.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop: sidebar + map / Mobile: map stacked ── */}
      <div className="flex flex-col lg:flex-row">

        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-[220px] shrink-0 bg-[#0B1220]/95 border-r border-white/10 flex-col">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">7 สาขา</p>
            <p className="text-sm font-bold text-white">ช.เอราวัณ กรุป</p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {branches.map((b) => {
              const isActive = selected.id === b.id;
              const bc = BRAND_COLOR[b.brand] ?? "#DD5259";
              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className={`w-full text-left px-3 py-2.5 transition-all flex items-start gap-2.5 ${
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: bc, boxShadow: isActive ? `0 0 8px 2px ${bc}` : "none" }}
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-white/70"}`}>
                      {b.shortName}
                    </p>
                    <p className={`text-[10px] truncate ${isActive ? "text-white/50" : "text-white/30"}`}>
                      {b.brand}{b.isHQ && <span className="ml-1 text-amber-400">★</span>}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map + info */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Iframe */}
          <div className="relative w-full" style={{ height: 320 }}>
            <div className="lg:hidden" style={{ height: 320 }} />
            <div className="hidden lg:block" style={{ height: 400 }} />

            {selected.mapEmbed ? (
              <iframe
                key={selected.id}
                src={selected.mapEmbed}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`แผนที่ ${selected.name}`}
                className="absolute inset-0 border-0 w-full h-full"
                style={{ filter: "invert(0.92) hue-rotate(180deg) saturate(1.4) brightness(0.85)" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-white/20" />
              </div>
            )}

            {/* Gradient overlay bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0B1220] to-transparent pointer-events-none" />
          </div>

          {/* Info card */}
          <div className="px-4 pb-4 pt-2 -mt-4 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span
                  className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white mb-1.5"
                  style={{ backgroundColor: color }}
                >
                  {selected.brand}{selected.isHQ && " · HQ"}
                </span>
                <p className="font-bold text-white text-sm leading-snug">{selected.name}</p>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-1.5">
                  <div className="flex items-start gap-1.5 text-white/50 text-xs">
                    <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 sm:line-clamp-1">{selected.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50 text-xs">
                    <Phone className="w-3 h-3 shrink-0" />
                    <a href={`tel:${selected.phone}`} className="hover:text-white transition-colors">{selected.phone}</a>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50 text-xs">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{selected.hours}</span>
                  </div>
                </div>
              </div>

              <a
                href={selected.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-xl transition-all whitespace-nowrap"
                style={{ backgroundColor: color }}
              >
                <ExternalLink className="w-3 h-3" />
                นำทาง
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
