import { useEffect, useRef } from 'react'
import L from 'leaflet'

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
  index: number  // event index in the timeline list
}

// Chronological visit order matching the timeline entries.
// Index = position in the full itinerary list (1-based).
const LISBON_PINS: MapPin[] = [
  { lat: 38.7738, lng: -9.1340, label: 'Lisbon Airport (LIS) · Arrival', color: '#6c7aff', emoji: '✈', index: 1 },
  { lat: 38.7169, lng: -9.1427, label: 'Marriott Lisbon · Hotel', color: '#C4956A', emoji: '🏨', index: 2 },
  { lat: 38.7633, lng: -9.0950, label: 'Altice Arena — Web Summit', color: '#6c7aff', emoji: '🎙', index: 3 },
  { lat: 38.7143, lng: -9.1368, label: 'Solar dos Presuntos · Nov 10 dinner', color: '#F6AD55', emoji: '🍽', index: 4 },
  { lat: 38.7109, lng: -9.1358, label: 'Clube de Fado · Alfama · Nov 10', color: '#B794F4', emoji: '🌟', index: 5 },
  { lat: 38.7235, lng: -9.1342, label: 'Cervejaria Ramiro · Nov 11 dinner', color: '#F6AD55', emoji: '🍽', index: 6 },
  { lat: 38.7074, lng: -9.1419, label: 'PARK Bar · Nov 11', color: '#B794F4', emoji: '🌟', index: 7 },
]

// Full route polyline — repeated locations for return trips
// LIS → Marriott → Altice Arena → Solar → Fado → Marriott → Altice → Ramiro → PARK → Marriott → LIS
const ROUTE_COORDS: [number, number][] = [
  [38.7738, -9.1340], // LIS
  [38.7169, -9.1427], // Marriott
  [38.7633, -9.0950], // Altice Arena
  [38.7143, -9.1368], // Solar dos Presuntos
  [38.7109, -9.1358], // Clube de Fado
  [38.7169, -9.1427], // back to Marriott
  [38.7633, -9.0950], // back to Altice Arena
  [38.7235, -9.1342], // Cervejaria Ramiro
  [38.7074, -9.1419], // PARK Bar
  [38.7169, -9.1427], // back to Marriott
  [38.7738, -9.1340], // LIS departure
]

function makeIcon(pin: MapPin): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      position:relative;
      background:${pin.color};
      border:2px solid rgba(255,255,255,0.3);
      border-radius:50%;
      width:32px;height:32px;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
      box-shadow:0 2px 10px rgba(0,0,0,0.6);
      cursor:pointer;
    ">
      ${pin.emoji}
      <span style="
        position:absolute;
        top:-7px;right:-7px;
        background:#1a1a2e;
        color:#fff;
        border:1.5px solid ${pin.color};
        border-radius:50%;
        width:16px;height:16px;
        font-size:9px;font-weight:700;
        display:flex;align-items:center;justify-content:center;
        line-height:1;
        font-family:monospace;
      ">${pin.index}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.attribution({ prefix: '© OSM · CartoDB' }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Route polyline — dashed accent line
    L.polyline(ROUTE_COORDS, {
      color: '#6c7aff',
      weight: 2,
      opacity: 0.6,
      dashArray: '6 4',
    }).addTo(map)

    // Numbered markers
    LISBON_PINS.forEach(pin => {
      L.marker([pin.lat, pin.lng], { icon: makeIcon(pin) })
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:140px">
            <p style="font-size:11px;font-weight:700;margin:0 0 2px">${pin.emoji} ${pin.label}</p>
            <p style="font-size:10px;color:#888;margin:0">Stop #${pin.index}</p>
          </div>
        `, { maxWidth: 200 })
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
