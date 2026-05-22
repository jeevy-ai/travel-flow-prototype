import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
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
  index: number
}

const LISBON_PINS: MapPin[] = [
  { lat: 38.7738, lng: -9.1340, label: 'Lisbon Airport (LIS) · Arrival', color: '#6c7aff', emoji: '✈', index: 1 },
  { lat: 38.7169, lng: -9.1427, label: 'Marriott Lisbon · Hotel', color: '#C4956A', emoji: '🏨', index: 2 },
  { lat: 38.7633, lng: -9.0950, label: 'Altice Arena — Web Summit', color: '#6c7aff', emoji: '🎙', index: 3 },
  { lat: 38.7143, lng: -9.1368, label: 'Solar dos Presuntos · Nov 10 dinner', color: '#F6AD55', emoji: '🍽', index: 4 },
  { lat: 38.7109, lng: -9.1358, label: 'Clube de Fado · Alfama · Nov 10', color: '#B794F4', emoji: '🌟', index: 5 },
  { lat: 38.7235, lng: -9.1342, label: 'Cervejaria Ramiro · Nov 11 dinner', color: '#F6AD55', emoji: '🍽', index: 6 },
  { lat: 38.7074, lng: -9.1419, label: 'PARK Bar · Nov 11', color: '#B794F4', emoji: '🌟', index: 7 },
]

const ROUTE_COORDS: [number, number][] = [
  [38.7738, -9.1340],
  [38.7169, -9.1427],
  [38.7633, -9.0950],
  [38.7143, -9.1368],
  [38.7109, -9.1358],
  [38.7169, -9.1427],
  [38.7633, -9.0950],
  [38.7235, -9.1342],
  [38.7074, -9.1419],
  [38.7169, -9.1427],
  [38.7738, -9.1340],
]

// entry id → map coords
const ENTRY_COORDS: Record<string, [number, number]> = {
  flt_outbound:      [38.7738, -9.1340],
  flt_return:        [38.7738, -9.1340],
  ride_arrival:      [38.7738, -9.1340],
  ride_departure:    [38.7738, -9.1340],
  hotel_main:        [38.7169, -9.1427],
  ride_day2_venue:   [38.7633, -9.0950],
  'WS2026-K01':      [38.7633, -9.0950],
  'WS2026-K02':      [38.7633, -9.0950],
  'WS2026-W07':      [38.7633, -9.0950],
  'WS2026-K08':      [38.7633, -9.0950],
  restaurant_nov10:  [38.7143, -9.1368],
  activity_nov10:    [38.7109, -9.1358],
  restaurant_nov11:  [38.7235, -9.1342],
  activity_nov11:    [38.7074, -9.1419],
}

// pin index → representative entry id for reverse lookup
const PIN_PRIMARY_ENTRY: Record<number, string> = {
  1: 'ride_arrival',
  2: 'hotel_main',
  3: 'WS2026-K01',
  4: 'restaurant_nov10',
  5: 'activity_nov10',
  6: 'restaurant_nov11',
  7: 'activity_nov11',
}

// entry id → which pin index it belongs to
const ENTRY_PIN_INDEX: Record<string, number> = {}
for (const [pinIdx, entryId] of Object.entries(PIN_PRIMARY_ENTRY)) {
  ENTRY_PIN_INDEX[entryId] = Number(pinIdx)
}
// also map other entries that share a pin
ENTRY_PIN_INDEX['flt_outbound'] = 1
ENTRY_PIN_INDEX['flt_return'] = 1
ENTRY_PIN_INDEX['ride_departure'] = 1
ENTRY_PIN_INDEX['ride_day2_venue'] = 3
ENTRY_PIN_INDEX['WS2026-K02'] = 3
ENTRY_PIN_INDEX['WS2026-W07'] = 3
ENTRY_PIN_INDEX['WS2026-K08'] = 3

function makeIcon(pin: MapPin, highlighted = false): L.DivIcon {
  const size = highlighted ? 40 : 32
  const anchor = size / 2
  return L.divIcon({
    className: '',
    html: `<div style="
      position:relative;
      background:${pin.color};
      border:2px solid ${highlighted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'};
      border-radius:50%;
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      font-size:${highlighted ? 17 : 14}px;
      box-shadow:${highlighted
        ? `0 0 0 3px ${pin.color}55, 0 4px 20px rgba(0,0,0,0.8)`
        : '0 2px 10px rgba(0,0,0,0.6)'
      };
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
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -20],
  })
}

export interface TripMapHandle {
  flyToEntry: (entryId: string) => void
  highlightEntry: (entryId: string | null) => void
}

interface Props {
  className?: string
  onPinClick?: (entryId: string) => void
}

export const TripMap = forwardRef<TripMapHandle, Props>(function TripMap(
  { className = '', onPinClick },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())
  const onPinClickRef = useRef(onPinClick)
  onPinClickRef.current = onPinClick

  useImperativeHandle(ref, () => ({
    flyToEntry(entryId: string) {
      const coords = ENTRY_COORDS[entryId]
      if (coords && mapRef.current) {
        mapRef.current.flyTo(coords, 15, { duration: 0.8 })
      }
    },
    highlightEntry(entryId: string | null) {
      const targetPinIdx = entryId != null ? ENTRY_PIN_INDEX[entryId] : null
      markersRef.current.forEach((marker, idx) => {
        const pin = LISBON_PINS.find(p => p.index === idx)
        if (!pin) return
        marker.setIcon(makeIcon(pin, targetPinIdx === idx))
      })
    },
  }))

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

    L.polyline(ROUTE_COORDS, {
      color: '#6c7aff',
      weight: 2,
      opacity: 0.6,
      dashArray: '6 4',
    }).addTo(map)

    LISBON_PINS.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng], { icon: makeIcon(pin) })
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:140px">
            <p style="font-size:11px;font-weight:700;margin:0 0 2px">${pin.emoji} ${pin.label}</p>
            <p style="font-size:10px;color:#888;margin:0">Stop #${pin.index}</p>
          </div>
        `, { maxWidth: 200 })
        .addTo(map)

      marker.on('click', () => {
        const entryId = PIN_PRIMARY_ENTRY[pin.index]
        if (entryId) onPinClickRef.current?.(entryId)
      })

      markersRef.current.set(pin.index, marker)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  return <div ref={containerRef} className={className} style={{ position: 'relative', zIndex: 0 }} />
})
