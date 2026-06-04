'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, ExternalLink } from 'lucide-react'

interface PropertyMapProps {
  lat: number
  lng: number
  title: string
  address: string
}

export default function PropertyMap({ lat, lng, title, address }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    // Wait for Google Maps to be loaded by the Script tag in layout
    const tryInit = () => {
      if (typeof window === 'undefined' || !window.google?.maps) return false
      if (!mapRef.current) return false

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })

      // Custom marker
      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#46a758',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      })

      mapInstanceRef.current = map
      setMapLoaded(true)
      return true
    }

    if (!tryInit()) {
      // Retry until Google Maps loads
      const interval = setInterval(() => {
        if (tryInit()) clearInterval(interval)
      }, 300)
      return () => clearInterval(interval)
    }
  }, [lat, lng, title])

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <div className="rounded-2xl overflow-hidden border border-[#e2e5e0] shadow-sm">
      {/* Map */}
      <div
        ref={mapRef}
        className="w-full bg-[#f1f4f0]"
        style={{ height: 280 }}
      >
        {!mapLoaded && (
          <div className="w-full h-full flex items-center justify-center gap-2 text-[#898e87]">
            <div className="w-5 h-5 border-2 border-[#46a758] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading map...</span>
          </div>
        )}
      </div>

      {/* Address + action buttons */}
      <div className="px-4 py-3 bg-white flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-[#46a758] shrink-0 mt-0.5" />
          <p className="text-sm text-[#5e6360] leading-snug truncate">{address}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#46a758] hover:bg-[#3d9a4f] px-3 py-1.5 rounded-lg transition-colors"
          >
            Directions
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#5e6360] border border-[#d9ddd8] hover:bg-[#f1f4f0] px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Maps
          </a>
        </div>
      </div>
    </div>
  )
}
