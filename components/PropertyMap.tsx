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
    let interval: ReturnType<typeof setInterval> | null = null

    const tryInit = async (): Promise<boolean> => {
      try {
        if (typeof window === 'undefined' || !window.google?.maps) return false
        if (!mapRef.current) return false
        if (mapInstanceRef.current) return true // already initialized

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER,
          },
        })

        const markerEl = document.createElement('div')
        markerEl.style.cssText = `
          width: 28px; height: 28px;
          background: #1E6B69;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        `

        const { AdvancedMarkerElement } = (await window.google.maps.importLibrary('marker')) as google.maps.MarkerLibrary
        new AdvancedMarkerElement({
          position: { lat, lng },
          map,
          title,
          content: markerEl,
        })

        mapInstanceRef.current = map
        setMapLoaded(true)
        return true
      } catch {
        return false
      }
    }

    tryInit().then(ok => {
      if (!ok) {
        interval = setInterval(() => {
          tryInit().then(done => {
            if (done && interval) clearInterval(interval)
          })
        }, 300)
      }
    })

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [lat, lng, title])

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <div className="rounded-2xl overflow-hidden border border-[#e2e5e0] shadow-sm">
      <div className="relative" style={{ height: 280 }}>
        {/* mapRef is Google Maps territory — never put React children inside it */}
        <div
          ref={mapRef}
          className="w-full h-full bg-[#f1f4f0]"
        />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-[#898e87]">
            <div className="w-5 h-5 border-2 border-[#1E6B69] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading map...</span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-white flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-[#1E6B69] shrink-0 mt-0.5" />
          <p className="text-sm text-[#5e6360] leading-snug truncate">{address}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#1E6B69] hover:bg-[#18605E] px-3 py-1.5 rounded-lg transition-colors"
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
