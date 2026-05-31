"use client";

import { useState } from "react";
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";
import { branches } from "@/lib/branchData";
import { Phone, MapPin, Clock, ExternalLink, X } from "lucide-react";

// Brand accent colors — futuristic palette
const BRAND_GLOW: Record<string, { bg: string; ring: string; text: string }> = {
  Mazda:      { bg: "#e60012", ring: "rgba(230,0,18,0.4)",   text: "#fff" },
  Ford:       { bg: "#003478", ring: "rgba(0,52,120,0.45)",  text: "#fff" },
  Mitsubishi: { bg: "#c8102e", ring: "rgba(200,16,46,0.4)",  text: "#fff" },
  GWM:        { bg: "#c8102e", ring: "rgba(200,16,46,0.4)",  text: "#fff" },
  Deepal:     { bg: "#0066ff", ring: "rgba(0,102,255,0.45)", text: "#fff" },
  Kia:        { bg: "#05141f", ring: "rgba(5,20,31,0.5)",    text: "#fff" },
};

// Centre of all branches (Nakhon Pathom area)
const CENTER: [number, number] = [100.315, 13.785];

/**
 * Inline raster style using OSM tiles (CORS=* — no external style.json fetch needed)
 * CSS invert+hue-rotate applied to canvas gives the dark futuristic look.
 */
const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    },
  },
  layers: [{ id: "osm-tiles", type: "raster" as const, source: "osm" }],
};

export default function BranchesMapLibre() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* Inline OSM raster style — no external style.json fetch, CORS=* on tiles */}
      {/* CSS invert+hue-rotate on canvas element gives dark futuristic look */}
      <Map
        theme="light"
        center={CENTER}
        zoom={10.5}
        pitch={0}
        className="w-full h-full [&_.maplibregl-canvas]:invert [&_.maplibregl-canvas]:hue-rotate-180 [&_.maplibregl-canvas]:saturate-150 [&_.maplibregl-canvas]:brightness-85"
        styles={{ light: OSM_STYLE, dark: OSM_STYLE }}
      >
        <MapControls position="bottom-right" showZoom />

        {branches.map((branch) => {
          const glow = BRAND_GLOW[branch.brand] ?? { bg: "#0F172A", ring: "rgba(15,23,42,0.4)", text: "#fff" };
          const isActive = activeId === branch.id;

          return (
            <MapMarker
              key={branch.id}
              longitude={branch.lng}
              latitude={branch.lat}
              anchor="bottom"
            >
              {/* Custom futuristic marker */}
              <MarkerContent>
                <button
                  onClick={() => setActiveId(isActive ? null : branch.id)}
                  className="relative flex flex-col items-center group focus:outline-none"
                  aria-label={branch.name}
                >
                  {/* Pulsing glow ring */}
                  <span
                    className={`absolute inset-0 rounded-full animate-ping ${isActive ? "opacity-75" : "opacity-0 group-hover:opacity-50"}`}
                    style={{ backgroundColor: glow.ring, animationDuration: "1.5s" }}
                  />
                  {/* Pin body */}
                  <span
                    className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full shadow-lg border-2 border-white/20 transition-transform duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: glow.bg,
                      boxShadow: isActive ? `0 0 20px 4px ${glow.ring}` : `0 0 12px 2px ${glow.ring}`,
                      transform: isActive ? "scale(1.15)" : undefined,
                    }}
                  >
                    <span className="text-white text-[10px] font-black uppercase tracking-tight leading-none">
                      {branch.brand.slice(0, 2)}
                    </span>
                  </span>
                  {/* Pin tail */}
                  <span
                    className="w-0.5 h-2 rounded-full opacity-60"
                    style={{ backgroundColor: glow.bg }}
                  />
                </button>
              </MarkerContent>

              {/* Popup */}
              {isActive && (
                <MarkerPopup
                  closeOnClick={false}
                  anchor="bottom"
                  offset={52}
                  className="!bg-[#0B1220] !border-white/10 !text-white min-w-[240px] !rounded-xl !shadow-2xl"
                >
                  <div className="relative">
                    {/* Close */}
                    <button
                      onClick={() => setActiveId(null)}
                      className="absolute top-0 right-0 p-1 text-white/50 hover:text-white transition-colors"
                      aria-label="ปิด"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Brand badge */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: glow.bg }}
                      >
                        {branch.brand}
                      </span>
                      {branch.isHQ && (
                        <span className="text-[10px] text-amber-400 font-medium">สำนักงานใหญ่</span>
                      )}
                    </div>

                    {/* Name */}
                    <p className="font-bold text-sm text-white leading-snug mb-2 pr-5">
                      {branch.name}
                    </p>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-white/60">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: glow.bg }} />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: glow.bg }} />
                        <a href={`tel:${branch.phone}`} className="text-white/80 hover:text-white transition-colors">
                          {branch.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: glow.bg }} />
                        <span className="truncate">{branch.hours}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold text-white transition-all"
                      style={{ backgroundColor: glow.bg }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      นำทาง Google Maps
                    </a>
                  </div>
                </MarkerPopup>
              )}
            </MapMarker>
          );
        })}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-12 left-3 bg-[#0B1220]/90 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-xs space-y-1.5">
        {Object.entries(BRAND_GLOW).map(([brand, { bg }]) => {
          const count = branches.filter((b) => b.brand === brand).length;
          if (!count) return null;
          return (
            <div key={brand} className="flex items-center gap-2 text-white/70">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: bg }} />
              <span>{brand}</span>
              <span className="text-white/30">({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
