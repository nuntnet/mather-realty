'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Search, RotateCcw } from 'lucide-react'

interface LocationPickerProps {
  lat: string
  lng: string
  onLatChange: (lat: string) => void
  onLngChange: (lng: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleMaps = any

export default function LocationPicker({ lat, lng, onLatChange, onLngChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const initMap = useCallback(async () => {
    if (!mapRef.current || !window.google?.maps) return
    if (mapInstanceRef.current) return

    const startLat = parseFloat(lat) || 13.736717
    const startLng = parseFloat(lng) || 100.523186

    const { Map } = await window.google?.maps.importLibrary('maps') as google.maps.MapsLibrary
    const { AdvancedMarkerElement } = await window.google?.maps.importLibrary('marker') as google.maps.MarkerLibrary

    const map = new Map(mapRef.current, {
      center: { lat: startLat, lng: startLng },
      zoom: lat && lng ? 15 : 11,
      mapId: 'DEMO_MAP_ID',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    const markerEl = document.createElement('div')
    markerEl.style.cssText = `
      width: 32px; height: 32px;
      background: #F4581A;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      cursor: pointer;
    `

    const marker = new AdvancedMarkerElement({
      position: { lat: startLat, lng: startLng },
      map,
      title: 'Property location',
      content: markerEl,
    })

    mapInstanceRef.current = map
    markerRef.current = marker

    // Click map to move marker
    map.addListener('click', (e: GoogleMaps) => {
      if (!e.latLng) return
      const newLat = e.latLng.lat().toFixed(6)
      const newLng = e.latLng.lng().toFixed(6)
      marker.position = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      onLatChange(newLat)
      onLngChange(newLng)
    })

    setMapReady(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let retryCount = 0
    const tryInit = () => {
      if (window.google?.maps) {
        initMap()
      } else if (retryCount < 20) {
        retryCount++
        setTimeout(tryInit, 300)
      }
    }
    tryInit()
  }, [initMap])

  // Sync external lat/lng changes to marker
  useEffect(() => {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    if (!isNaN(latNum) && !isNaN(lngNum) && mapInstanceRef.current && markerRef.current) {
      const pos = { lat: latNum, lng: lngNum }
      markerRef.current.position = pos
      mapInstanceRef.current.panTo(pos)
    }
  }, [lat, lng])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !mapInstanceRef.current) return
    setIsLoading(true)
    try {
      const { Geocoder } = await window.google?.maps.importLibrary('geocoding') as google.maps.GeocodingLibrary
      const geocoder = new Geocoder()
      const result = await geocoder.geocode({ address: searchQuery + ', Thailand' })
      if (result.results[0]) {
        const loc = result.results[0].geometry.location
        const newLat = loc.lat().toFixed(6)
        const newLng = loc.lng().toFixed(6)
        if (markerRef.current) markerRef.current.position = loc
        mapInstanceRef.current.panTo(loc)
        mapInstanceRef.current.setZoom(15)
        onLatChange(newLat)
        onLngChange(newLng)
      }
    } catch {
      // ignore geocoding errors
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    if (!isNaN(latNum) && !isNaN(lngNum) && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: latNum, lng: lngNum })
      mapInstanceRef.current.setZoom(15)
    }
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search address or area... (then click map to pin)"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E6B69]/20 bg-white"
          />
        </div>
        <button type="submit" disabled={isLoading}
          className="px-3 py-2 bg-[#1E6B69] text-white text-sm font-medium rounded-xl hover:bg-[#18605E] disabled:opacity-60 transition-colors shrink-0">
          {isLoading ? '…' : 'Go'}
        </button>
        {lat && lng && (
          <button type="button" onClick={handleReset}
            className="px-3 py-2 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition-colors shrink-0"
            title="Re-centre on current pin">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div ref={mapRef} className="w-full h-[300px] bg-gray-100" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-[#1E6B69] border-t-transparent rounded-full animate-spin" />
            Loading map…
          </div>
        )}
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] px-3 py-1 rounded-full pointer-events-none whitespace-nowrap">
          Click anywhere on the map to set the pin
        </p>
      </div>

      {/* Lat/lng read-out */}
      {lat && lng && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-[#F4581A] shrink-0" />
          <span className="font-mono">{parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}</span>
          <span className="text-gray-300 mx-1">|</span>
          <span>Edit values below if you need exact coordinates</span>
        </div>
      )}

      {/* Manual lat/lng inputs (small, secondary) */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Latitude</label>
          <input type="number" step="any" value={lat}
            onChange={e => onLatChange(e.target.value)}
            placeholder="13.756331"
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E6B69]/30 font-mono" />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Longitude</label>
          <input type="number" step="any" value={lng}
            onChange={e => onLngChange(e.target.value)}
            placeholder="100.501765"
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E6B69]/30 font-mono" />
        </div>
      </div>
    </div>
  )
}
