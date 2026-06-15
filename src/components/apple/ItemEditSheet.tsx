import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ItineraryAlternative, ItineraryItem } from '../../lib/conciergeApi'

// ── Item kind detection ───────────────────────────────────────────────────────

type ItemKind = 'flight' | 'restaurant' | 'transport' | 'generic'

function detectKind(item: ItineraryItem): ItemKind {
  if (item.category === 'dining') return 'restaurant'
  // Flight: category 'other' with a flight number pattern or → route
  if (item.category === 'other' && /[A-Z]{2}\d+/.test(item.title)) return 'flight'
  // Transport connector leg (ride)
  if (item.category === 'other' && /→|taxi|metro|tram|ferry|bus|train|uber/i.test(item.title)) {
    return 'transport'
  }
  return 'generic'
}

// ── Draft types ───────────────────────────────────────────────────────────────

interface FlightDraft {
  carrierAndFlight: string
  route: string
  departureTime: string
  seatClass: string
  seatNumber: string
  duration: string
}

interface RestaurantDraft {
  venueName: string
  reservationTime: string
  partySize: number
  dietaryNotes: string
}

interface GenericDraft {
  title: string
  time: string
  detail: string
}

// ── Parse item → draft ────────────────────────────────────────────────────────

function parseFlightDraft(item: ItineraryItem): FlightDraft {
  // title: 'Delta UA88 · SFO → LIS'
  // detail: 'Business class · Seat 4A · Non-stop · 10h 35m'
  const titleParts = item.title.split(' · ')
  const carrierAndFlight = titleParts[0] ?? ''
  const route = titleParts.slice(1).join(' · ')

  const detailParts = item.detail.split(' · ')
  const seatClass = detailParts[0] ?? ''
  const seatPart = detailParts[1] ?? ''
  const seatMatch = seatPart.match(/Seat\s+(\S+)/i)
  const seatNumber = seatMatch?.[1] ?? ''
  const duration = detailParts[detailParts.length - 1] ?? ''

  return { carrierAndFlight, route, departureTime: item.time, seatClass, seatNumber, duration }
}

function parseRestaurantDraft(item: ItineraryItem): RestaurantDraft {
  // detail: 'Seafood dinner · Table for 1 · Intendente, Lisbon'
  const detailParts = item.detail.split(' · ')
  const tablePart = detailParts.find(p => /table for/i.test(p)) ?? ''
  const match = tablePart.match(/table for (\d+)/i)
  const partySize = match ? parseInt(match[1], 10) : 1
  const dietaryNotes = detailParts.filter(p => !/table for/i.test(p)).join(' · ')
  return { venueName: item.title, reservationTime: item.time, partySize, dietaryNotes }
}

function parseGenericDraft(item: ItineraryItem): GenericDraft {
  return { title: item.title, time: item.time, detail: item.detail }
}

// ── Assemble updated item from draft ─────────────────────────────────────────

function assembleFlightItem(base: ItineraryItem, d: FlightDraft): ItineraryItem {
  const title = [d.carrierAndFlight, d.route].filter(Boolean).join(' · ')
  const detailParts = base.detail.split(' · ')
  detailParts[0] = d.seatClass
  if (d.seatNumber) detailParts[1] = `Seat ${d.seatNumber}`
  return { ...base, title, time: d.departureTime, detail: detailParts.join(' · ') }
}

function assembleRestaurantItem(base: ItineraryItem, d: RestaurantDraft): ItineraryItem {
  const parts = base.detail.split(' · ').filter(p => !/table for/i.test(p))
  const tableStr = `Table for ${d.partySize}`
  const detail = [parts[0], tableStr, ...parts.slice(1)].filter(Boolean).join(' · ')
  return { ...base, title: d.venueName, time: d.reservationTime, detail }
}

function assembleGenericItem(base: ItineraryItem, d: GenericDraft): ItineraryItem {
  return { ...base, title: d.title, time: d.time, detail: d.detail }
}

// ── Design-token style helpers ────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-tertiary)',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 12px',
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
    minHeight: 44,
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  fieldGroup: { marginBottom: 16 },
  row: { display: 'flex', gap: 12 },
  halfField: { flex: 1, minWidth: 0 },
}

// ── Shared form primitives ─────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={S.fieldGroup}>
      <span style={S.label}>{label}</span>
      {children}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={S.input}
      onFocus={e => ((e.target as HTMLInputElement).style.borderColor = 'var(--accent)')}
      onBlur={e => ((e.target as HTMLInputElement).style.borderColor = 'var(--border)')}
    />
  )
}

const SEAT_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First'] as const

function SeatClassPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {SEAT_CLASSES.map(cls => {
        const isActive = value.toLowerCase().startsWith(cls.toLowerCase())
        return (
          <button
            key={cls}
            type="button"
            onClick={() => onChange(cls)}
            style={{
              padding: '10px 14px',
              minHeight: 44,
              borderRadius: 'var(--radius-md)',
              border: '1px solid ' + (isActive ? 'var(--accent)' : 'var(--border)'),
              background: isActive ? 'var(--accent-light)' : 'var(--bg-secondary)',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {cls}
          </button>
        )
      })}
    </div>
  )
}

function PartySizeStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease party size"
        style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', background: 'var(--bg-secondary)',
          color: 'var(--text-primary)', fontSize: 20, cursor: value <= 1 ? 'not-allowed' : 'pointer',
          opacity: value <= 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.15s', fontFamily: 'inherit',
        }}
      >
        −
      </button>
      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', minWidth: 28, textAlign: 'center' }}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(12, value + 1))}
        disabled={value >= 12}
        aria-label="Increase party size"
        style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', background: 'var(--bg-secondary)',
          color: 'var(--text-primary)', fontSize: 20, cursor: value >= 12 ? 'not-allowed' : 'pointer',
          opacity: value >= 12 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.15s', fontFamily: 'inherit',
        }}
      >
        +
      </button>
      <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
        {value === 1 ? 'solo' : `${value} guests`}
      </span>
    </div>
  )
}

// ── Type-specific form panels ─────────────────────────────────────────────────

function FlightForm({ draft, onChange }: { draft: FlightDraft; onChange: (d: FlightDraft) => void }) {
  return (
    <>
      <Field label="Carrier & flight number">
        <TextInput
          value={draft.carrierAndFlight}
          onChange={v => onChange({ ...draft, carrierAndFlight: v })}
          placeholder="e.g. Delta UA88"
        />
      </Field>
      <Field label="Route">
        <TextInput
          value={draft.route}
          onChange={v => onChange({ ...draft, route: v })}
          placeholder="e.g. SFO → LIS"
        />
      </Field>
      <div style={S.row}>
        <div style={S.halfField}>
          <Field label="Departure time">
            <TextInput
              type="time"
              value={draft.departureTime}
              onChange={v => onChange({ ...draft, departureTime: v })}
            />
          </Field>
        </div>
        <div style={S.halfField}>
          <Field label="Seat number">
            <TextInput
              value={draft.seatNumber}
              onChange={v => onChange({ ...draft, seatNumber: v })}
              placeholder="e.g. 4A"
            />
          </Field>
        </div>
      </div>
      <Field label="Seat class">
        <SeatClassPicker value={draft.seatClass} onChange={v => onChange({ ...draft, seatClass: v })} />
      </Field>
    </>
  )
}

function RestaurantForm({ draft, onChange }: { draft: RestaurantDraft; onChange: (d: RestaurantDraft) => void }) {
  return (
    <>
      <Field label="Venue">
        <TextInput
          value={draft.venueName}
          onChange={v => onChange({ ...draft, venueName: v })}
          placeholder="Restaurant name"
        />
      </Field>
      <Field label="Reservation time">
        <TextInput
          type="time"
          value={draft.reservationTime}
          onChange={v => onChange({ ...draft, reservationTime: v })}
        />
      </Field>
      <Field label="Party size">
        <PartySizeStepper value={draft.partySize} onChange={v => onChange({ ...draft, partySize: v })} />
      </Field>
      <Field label="Dietary notes">
        <TextInput
          value={draft.dietaryNotes}
          onChange={v => onChange({ ...draft, dietaryNotes: v })}
          placeholder="e.g. vegetarian, gluten-free, no nuts"
        />
      </Field>
    </>
  )
}

function GenericForm({ draft, onChange }: { draft: GenericDraft; onChange: (d: GenericDraft) => void }) {
  return (
    <>
      <Field label="Title">
        <TextInput
          value={draft.title}
          onChange={v => onChange({ ...draft, title: v })}
        />
      </Field>
      <Field label="Time">
        <TextInput
          type="time"
          value={draft.time}
          onChange={v => onChange({ ...draft, time: v })}
        />
      </Field>
      <Field label="Details">
        <TextInput
          value={draft.detail}
          onChange={v => onChange({ ...draft, detail: v })}
          placeholder="Description or notes"
        />
      </Field>
    </>
  )
}

// ── Inner sheet (mounted while item is non-null) ──────────────────────────────

function SheetInner({ item, onSave, onClose, onBack }: {
  item: ItineraryItem
  onSave: (updated: ItineraryItem) => void
  onClose: () => void
  onBack?: () => void
}) {
  const kind = detectKind(item)

  const [flightDraft, setFlightDraft] = useState<FlightDraft>(() => parseFlightDraft(item))
  const [restaurantDraft, setRestaurantDraft] = useState<RestaurantDraft>(() => parseRestaurantDraft(item))
  const [genericDraft, setGenericDraft] = useState<GenericDraft>(() => parseGenericDraft(item))

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSave = () => {
    let updated: ItineraryItem
    if (kind === 'flight') updated = assembleFlightItem(item, flightDraft)
    else if (kind === 'restaurant') updated = assembleRestaurantItem(item, restaurantDraft)
    else updated = assembleGenericItem(item, genericDraft)
    onSave(updated)
  }

  const sheetTitle =
    kind === 'flight' ? 'Edit Flight' :
    kind === 'restaurant' ? 'Edit Restaurant' :
    kind === 'transport' ? 'Edit Transport' :
    'Edit Item'

  return (
    <>
      {/* Backdrop */}
      <motion.div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)', zIndex: 50,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <motion.div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
          background: 'var(--bg)', borderRadius: '20px 20px 0 0',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        // Prevent backdrop click from firing through sheet
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px 16px', flexShrink: 0,
          borderBottom: '1px solid var(--border)',
        }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to detail"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent)', fontSize: 14, fontWeight: 500,
                minHeight: 44, minWidth: 44, padding: '0 4px',
                display: 'flex', alignItems: 'center', gap: 3,
                fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              ← Back
            </button>
          )}
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', flex: 1 }}>
            {sheetTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s', fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable form area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
          {/* Swap chip shortcuts — shown when alternatives available */}
          {item.alternatives && item.alternatives.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <span style={{
                fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Or swap with:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {item.alternatives.map((alt: ItineraryAlternative) => (
                  <button
                    key={alt.name}
                    type="button"
                    onClick={() => onSave({ ...item, title: alt.name, detail: alt.tagline ?? item.detail })}
                    style={{
                      height: 32, borderRadius: 999,
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
                      padding: '0 10px', fontFamily: 'inherit',
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
                    }}
                  >
                    {alt.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {kind === 'flight' && <FlightForm draft={flightDraft} onChange={setFlightDraft} />}
          {kind === 'restaurant' && <RestaurantForm draft={restaurantDraft} onChange={setRestaurantDraft} />}
          {(kind === 'transport' || kind === 'generic') && <GenericForm draft={genericDraft} onChange={setGenericDraft} />}
        </div>

        {/* Action buttons */}
        <div style={{
          flexShrink: 0, padding: '12px 20px 32px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              width: '100%', minHeight: 50, borderRadius: 'var(--radius-lg)',
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseDown={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)')}
            onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = '')}
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%', minHeight: 44, borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
              border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500,
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface ItemEditSheetProps {
  item: ItineraryItem | null
  onSave: (updated: ItineraryItem) => void
  onClose: () => void
  onBack?: () => void
}

export function ItemEditSheet({ item, onSave, onClose, onBack }: ItemEditSheetProps) {
  return (
    <AnimatePresence>
      {item && (
        <SheetInner
          key={item.title + item.time}
          item={item}
          onSave={updated => { onSave(updated); onClose() }}
          onClose={onClose}
          onBack={onBack}
        />
      )}
    </AnimatePresence>
  )
}
