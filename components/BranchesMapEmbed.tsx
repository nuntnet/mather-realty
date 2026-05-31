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

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B1220]"
         style={{ minHeight: 520 }}>

      {/* Left panel — branch list */}
      <div className="absolute left-0 top-0 bottom-0 z-10 w-[220px] bg-[#0B1220]/95 backdrop-blur-sm border-r border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">7 สาขา</p>
          <p className="text-sm font-bold text-white">ช.เอราวัณ กรุป</p>
        </div>

        {/* Branch list */}
        <div className="flex-1 overflow-y-auto py-1">
          {branches.map((b) => {
            const isActive = selected.id === b.id;
            const color = BRAND_COLOR[b.brand] ?? "#DD5259";
            return (
              <button
                key={b.id}
                onClick={() => setSelected(b)}
                className={`w-full text-left px-3 py-2.5 transition-all flex items-start gap-2.5 ${
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                {/* Brand dot */}
                <span
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: color,
                    boxShadow: isActive ? `0 0 8px 2px ${color}` : "none" }}
                />
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-white/70"}`}>
                    {b.shortName}
                  </p>
                  <p className={`text-[10px] truncate ${isActive ? "text-white/50" : "text-white/30"}`}>
                    {b.brand}
                    {b.isHQ && <span className="ml-1 text-amber-400">★ HQ</span>}
                  </p>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map iframe */}
      <div className="absolute inset-0 ml-[220px]">
        {selected.mapEmbed ? (
          <iframe
            key={selected.id}
            src={selected.mapEmbed}
            width="100%"
            height="100%"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`แผนที่ ${selected.name}`}
            className="border-0 w-full h-full"
            style={{ filter: "invert(0.92) hue-rotate(180deg) saturate(1.4) brightness(0.85)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-10 h-10 text-white/20" />
          </div>
        )}
      </div>

      {/* Bottom info card */}
      <div className="absolute bottom-0 left-[220px] right-0 z-10 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/80 to-transparent pt-16 pb-4 px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {/* Brand badge */}
            <span
              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white mb-1.5"
              style={{ backgroundColor: BRAND_COLOR[selected.brand] ?? "#DD5259" }}
            >
              {selected.brand}
              {selected.isHQ && " · HQ"}
            </span>
            <p className="font-bold text-white text-sm leading-snug">{selected.name}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[220px]">{selected.address}</span>
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

          {/* Google Maps CTA */}
          <a
            href={selected.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-xl transition-all"
            style={{ backgroundColor: BRAND_COLOR[selected.brand] ?? "#DD5259" }}
          >
            <ExternalLink className="w-3 h-3" />
            นำทาง
          </a>
        </div>
      </div>
    </div>
  );
}
