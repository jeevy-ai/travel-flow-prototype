import { useEffect, useRef } from 'react'
import L from 'leaflet'

interface Props {
  lat: number
  lng: number
  label: string
  emoji?: string
  className?: string
}

export function MiniMap({ lat, lng, label, emoji = '📍', className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:36px;height:36px;border-radius:50%;
        background:var(--accent);
        border:2px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.4);
        cursor:default;
      ">${emoji}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    L.marker([lat, lng], { icon }).addTo(map).bindTooltip(label, {
      permanent: false,
      direction: 'top',
      offset: [0, -20],
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, label, emoji])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', zIndex: 0 }}
    />
  )
}
