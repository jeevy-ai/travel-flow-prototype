import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Fix leaflet default icon asset paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapPin {
  lat: number
  lng: number
  label: string
  color: string
  emoji: string
}

const LISBON_PINS: MapPin[] = [
  { lat: 38.7738, lng: -9.1340, label: 'Lisbon Airport (LIS)', color: '#6c7aff', emoji: '✈' },
  { lat: 38.7169, lng: -9.1427, label: 'Marriott Lisbon', color: '#C4956A', emoji: '🏨' },
  { lat: 38.7633, lng: -9.0950, label: 'Altice Arena — Web Summit', color: '#6c7aff', emoji: '🎙' },
  { lat: 38.7143, lng: -9.1368, label: 'Solar dos Presuntos', color: '#F6AD55', emoji: '🍽' },
  { lat: 38.7235, lng: -9.1342, label: 'Cervejaria Ramiro', color: '#F6AD55', emoji: '🍽' },
  { lat: 38.7109, lng: -9.1358, label: 'Clube de Fado · Alfama', color: '#B794F4', emoji: '🌟' },
  { lat: 38.7074, lng: -9.1419, label: 'PARK Bar', color: '#B794F4', emoji: '🌟' },
]

function makeIcon(pin: MapPin): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${pin.color};
      border:2px solid rgba(255,255,255,0.25);
      border-radius:50%;
      width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;
      font-size:13px;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    ">${pin.emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

interface Props {
  className?: string
}

export function TripMap({ className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [38.730, -9.120],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })

    // CartoDB dark matter — matches our dark UI theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.attribution({ prefix: '© OSM · CartoDB' }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    LISBON_PINS.forEach(pin => {
      L.marker([pin.lat, pin.lng], { icon: makeIcon(pin) })
        .bindPopup(`<strong style="font-size:12px">${pin.emoji} ${pin.label}</strong>`)
        .addTo(map)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={containerRef} className={className} />
}
