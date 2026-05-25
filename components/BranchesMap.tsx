import { useEffect, useRef } from "react";
import { branches } from "@/lib/branchData";
import { MapView } from "./Map";
import { brandLogoBase64 } from "@/lib/brandLogos";

export default function BranchesMap() {
  const markersRef = useRef<any[]>([]);
  const mapRef = useRef<any>(null);
  const infoWindowsRef = useRef<any[]>([]);

  const handleMapReady = (map: any) => {
    if (!map) return;

    mapRef.current = map;

    // Clear existing markers and info windows
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    infoWindowsRef.current.forEach((iw: any) => iw.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // Group branches by location for dual markers (Mazda + Deepal at Salaya)
    const locationGroups: Record<string, typeof branches> = {};
    branches.forEach((branch) => {
      const key = `${branch.lat},${branch.lng}`;
      if (!locationGroups[key]) {
        locationGroups[key] = [];
      }
      locationGroups[key].push(branch);
    });

    // Create SVG marker with base64 logo embedded directly (avoids CORS issues)
    const createMarkerSVG = (brand: string): string => {
      const logoData = brandLogoBase64[brand] || brandLogoBase64["Mazda"];
      const svg = `<svg width="90" height="64" viewBox="0 0 90 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="marker-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>
      <feOffset dx="0" dy="3" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.4"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="logo-clip">
      <rect x="5" y="5" width="80" height="42" rx="21"/>
    </clipPath>
  </defs>
  <!-- Main Pin Body -->
  <g filter="url(#marker-shadow)">
    <!-- White outer capsule background -->
    <rect x="5" y="5" width="80" height="42" rx="21" fill="white"/>
    <!-- Bottom tip of pin -->
    <path d="M 38 42 L 45 56 L 52 42 Z" fill="white" stroke-linejoin="round"/>
    <!-- Accent border -->
    <rect x="5" y="5" width="80" height="42" rx="21" fill="none" stroke="#f1f5f9" stroke-width="1"/>
    <!-- Brand logo container -->
    <rect x="7" y="7" width="76" height="38" rx="19" fill="#f8fafc"/>
    <!-- Brand logo with optimized placement container -->
    <image href="${logoData}" x="12" y="10" width="66" height="32" clip-path="url(#logo-clip)" preserveAspectRatio="xMidYMid meet"/>
  </g>
</svg>`;
      return svg;
    };

    // Add markers for all branches
    Object.entries(locationGroups).forEach(([_, branchesAtLocation]) => {
      const hasMultipleBrands = branchesAtLocation.length > 1;

      branchesAtLocation.forEach((branch, index) => {
        const svgData = createMarkerSVG(branch.brand);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Offset position for dual markers at same location
        const offsetLng = hasMultipleBrands ? (index > 0 ? 0.0008 : -0.0008) : 0;
        const markerPosition = {
          lat: branch.lat,
          lng: branch.lng + offsetLng,
        };

        const marker = new window.google.maps.Marker({
          position: markerPosition,
          map: map,
          title: branch.name,
          icon: {
            url: svgUrl,
            scaledSize: new window.google.maps.Size(60, 70),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(30, 68),
          },
          animation: window.google.maps.Animation.DROP,
        });

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 280px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                <img src="${brandLogoBase64[branch.brand] || ''}" 
                     style="width: 32px; height: 32px; object-fit: contain; border-radius: 50%; border: 1px solid #e2e8f0; background: white; padding: 2px;" 
                     alt="${branch.brand}" />
                <div style="font-weight: 700; font-size: 14px; color: #0F172A;">${branch.name}</div>
              </div>
              <div style="font-size: 12px; color: #555; margin-bottom: 5px;">
                📍 ${branch.address}
              </div>
              <div style="font-size: 12px; color: #555; margin-bottom: 5px;">
                📞 ${branch.phone}
              </div>
              <div style="font-size: 12px; color: #555; margin-bottom: 10px;">
                🕐 ${branch.hours}
              </div>
              <button style="
                width: 100%;
                padding: 8px 12px;
                background-color: #0F172A;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
              " onclick="window.location.href='/contact?branch=${branch.id}'">
                ดูรายละเอียดและติดต่อ →
              </button>
            </div>
          `,
        });

        // Show info window on marker click
        marker.addListener("click", () => {
          infoWindowsRef.current.forEach((iw: any) => iw.close());
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      });
    });

    // Fit map to show all markers with padding
    const bounds = new window.google.maps.LatLngBounds();
    branches.forEach((branch) => {
      bounds.extend({ lat: branch.lat, lng: branch.lng });
    });
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ค้นหาสาขาของเรา
        </h2>
        <p className="text-gray-600">
          คลิกที่ marker เพื่อดูข้อมูลสาขา หรือเลือกสาขาเพื่อติดต่อเรา
        </p>
      </div>

      {/* Map Container */}
      <MapView
        className="w-full h-96 md:h-[500px] rounded-lg shadow-lg border border-gray-200"
        initialCenter={{ lat: 13.78, lng: 100.18 }}
        initialZoom={11}
        onMapReady={handleMapReady}
      />
    </div>
  );
}
