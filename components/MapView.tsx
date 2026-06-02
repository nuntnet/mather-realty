"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Bed, Bath, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MapProperty {
  id: string;
  slug: string;
  title: Record<string, string>;
  lat: number;
  lng: number;
  priceTHB: number;
  coverImage: string;
  bedrooms: number;
  status: string;
}

interface MapViewProps {
  properties: MapProperty[];
  locale: string;
  className?: string;
}

// google.maps types come from @types/google.maps — no Window augmentation needed

function formatPrice(thb: number): string {
  if (thb >= 1_000_000) return `฿${(thb / 1_000_000).toFixed(1)}M`;
  if (thb >= 1_000) return `฿${Math.round(thb / 1_000)}K`;
  return `฿${thb.toLocaleString()}`;
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-500",
  rented: "bg-rose-500",
  coming_soon: "bg-amber-500",
  pending: "bg-yellow-400",
  archived: "bg-gray-400",
};

// Marker icon as SVG data URI
function makeMarkerSvg(label: string, active = false): string {
  const bg = active ? "#2563eb" : "#1e293b";
  const text = label.length > 6 ? label.slice(0, 6) : label;
  const w = Math.max(56, text.length * 8 + 24);
  const h = 32;
  const r = 8;
  const tip = 8;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + tip}" viewBox="0 0 ${w} ${h + tip}">
  <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${bg}" />
  <polygon points="${w / 2 - 6},${h} ${w / 2 + 6},${h} ${w / 2},${h + tip}" fill="${bg}" />
  <text x="${w / 2}" y="${h / 2 + 5}" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="white" text-anchor="middle">${text}</text>
</svg>`.trim();
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

export default function MapView({ properties, locale, className }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 13.7, lng: 100.5 },
      zoom: 6,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
      },
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();
    setIsLoaded(true);
  }, []);

  // Poll for google.maps to be available (loaded via next/script in layout)
  useEffect(() => {
    let retries = 0;
    const maxRetries = 50;
    const poll = () => {
      if (window.google?.maps?.Map) {
        initMap();
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(poll, 200);
      }
    };
    poll();
  }, [initMap]);

  // Add/update markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current!;

    // Clear existing
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!properties.length) return;

    const bounds = new window.google.maps.LatLngBounds();

    properties.forEach((prop) => {
      const label = formatPrice(prop.priceTHB);
      const isActive = activeId === prop.id;
      const iconUrl = makeMarkerSvg(label, isActive);

      const marker = new window.google.maps.Marker({
        position: { lat: prop.lat, lng: prop.lng },
        map,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(
            Math.max(56, label.length * 8 + 24),
            40
          ),
          anchor: new window.google.maps.Point(
            Math.max(56, label.length * 8 + 24) / 2,
            40
          ),
        },
        title: prop.title[locale] ?? prop.title["en"] ?? "",
        zIndex: isActive ? 1000 : 1,
      });

      marker.addListener("click", () => {
        setActiveId(prop.id);
        const localTitle = prop.title[locale] ?? prop.title["en"] ?? prop.id;
        const statusColor = STATUS_COLORS[prop.status] ?? "bg-gray-400";
        const content = `
          <div style="width:200px;font-family:system-ui,sans-serif">
            <div style="position:relative;height:110px;border-radius:6px;overflow:hidden;margin-bottom:8px">
              <img src="${prop.coverImage}" alt="${localTitle}" style="width:100%;height:100%;object-fit:cover" />
              <span style="position:absolute;top:6px;left:6px;background:${prop.status === "available" ? "#10b981" : prop.status === "rented" ? "#ef4444" : "#f59e0b"};color:white;font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;text-transform:uppercase">${prop.status.replace("_", " ")}</span>
            </div>
            <p style="font-size:13px;font-weight:700;margin:0 0 4px;line-height:1.3;color:#0f172a">${localTitle}</p>
            <p style="font-size:14px;font-weight:800;color:#2563eb;margin:0 0 4px">${formatPrice(prop.priceTHB)}<span style="font-size:11px;font-weight:500;color:#64748b">/mo</span></p>
            <p style="font-size:11px;color:#64748b;margin:0 0 8px">🛏 ${prop.bedrooms} bed</p>
            <a href="/${locale}/properties/${prop.slug}" style="display:block;text-align:center;background:#2563eb;color:white;font-size:12px;font-weight:600;padding:6px 0;border-radius:6px;text-decoration:none">View Details →</a>
          </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      bounds.extend(marker.getPosition()!);
      markersRef.current.push(marker);
    });

    if (properties.length === 1) {
      map.setCenter({ lat: properties[0].lat, lng: properties[0].lng });
      map.setZoom(14);
    } else if (properties.length > 1) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [isLoaded, properties, locale, activeId]);

  return (
    <div className={cn("relative rounded-xl overflow-hidden border shadow-sm", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm">Loading map…</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
}
