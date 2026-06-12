import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { EventCategory, Itinerary, ItineraryDay, ItineraryItem, TransportLeg } from '../../../lib/conciergeApi'

// ── Fixture itinerary (demo fallback) ──────────────────────────────────────

const FIXTURE: Itinerary = {
  destination: 'Lisbon, Portugal',
  dates: 'November 9–12, 2026',
  summary: 'Web Summit 2026 · 4 days · Personalised for Noah',
  days: [
    {
      day: 'Sun, Nov 9 — Depart SFO',
      items: [
        {
          time: '22:10',
          title: 'Delta UA88 · SFO → LIS',
          detail: 'Business class · Seat 4A · Non-stop · 10h 35m',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-outbound-business-cabin.webp',
          transportAfter: { mode: 'taxi', duration: '25 min', notes: '~€18 to hotel' },
        },
      ],
    },
    {
      day: 'Mon, Nov 10 — Arrive + Conference Day 1',
      items: [
        {
          time: '08:00',
          title: 'Bairro Alto Hotel',
          detail: 'Check-in · Superior Room · City view · Free cancellation until Nov 7',
          category: 'accommodation' as EventCategory,
          imageUrl: '/fixture-images/hotel-bairro-alto.webp',
          transportAfter: { mode: 'metro', duration: '12 min', notes: '~€1.50' },
        },
        {
          time: '09:30',
          title: 'The Age of Ambient AI',
          detail: 'Reid Hoffman · Stage 1, Altice Arena',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k01.webp',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '14:00',
          title: 'Future of Work Keynote',
          detail: 'Panel · Centre Stage, Altice Arena',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k02.webp',
          transportAfter: { mode: 'taxi', duration: '15 min' },
        },
        {
          time: '19:30',
          title: 'Cervejaria Ramiro',
          detail: 'Seafood dinner · Table for 1 · Intendente, Lisbon',
          category: 'dining' as EventCategory,
          imageUrl: '/fixture-images/restaurant-dishes-seafood.webp',
        },
      ],
    },
    {
      day: 'Tue, Nov 11 — Conference Day 2',
      items: [
        {
          time: '10:00',
          title: 'Product Strategy in the AI Era',
          detail: 'Lenny Rachitsky · Workshop Hall C · Hands-on session',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-w07.webp',
          transportAfter: { mode: 'walk', duration: '5 min' },
        },
        {
          time: '15:30',
          title: 'Closing Keynote',
          detail: 'Padmasree Warrior · Centre Stage, Altice Arena',
          category: 'conference' as EventCategory,
          imageUrl: '/fixture-images/conference-session-keynote-k08.webp',
          transportAfter: { mode: 'taxi', duration: '20 min' },
        },
        {
          time: '20:30',
          title: 'Park Bar Rooftop',
          detail: 'Cocktails with views over Lisbon · Bairro Alto',
          category: 'explore' as EventCategory,
          imageUrl: '/fixture-images/activity-rooftop-lisbon.webp',
        },
      ],
    },
    {
      day: 'Wed, Nov 12 — Return',
      items: [
        {
          time: '08:00',
          title: 'Alfama Morning Walk',
          detail: 'Fado district · Historic castle views · 1.5 hrs',
          category: 'explore' as EventCategory,
          imageUrl: '/fixture-images/activity-fado-lisbon.webp',
          transportAfter: { mode: 'taxi', duration: '30 min', notes: 'To LIS airport' },
        },
        {
          time: '09:30',
          title: 'Delta UA89 · LIS → SFO',
          detail: 'Business class · Seat 4A · Non-stop · 11h',
          category: 'other' as EventCategory,
          imageUrl: '/fixture-images/flight-return-business-cabin.webp',
        },
      ],
    },
  ],
}

// ── Category styles (per YOU-750 spec) ────────────────────────────────────

const CATEGORY_STYLE: Record<EventCategory, { bg: string; icon: string }> = {
  conference:    { bg: '#EEF2FF', icon: '📅' },
  dining:        { bg: '#FFFBEB', icon: '🍽️' },
  explore:       { bg: '#ECFDF5', icon: '📍' },
  accommodation: { bg: '#F0F9FF', icon: '🏨' },
  other:         { bg: '#F9FAFB', icon: '✨' },
}

// ── Transport mode icons (per YOU-750 spec) ───────────────────────────────

const TRANSPORT_ICON: Record<string, string> = {
  walk: '🚶', taxi: '🚕', metro: '🚇', tram: '🚊',
  ferry: '⛴️', bus: '🚌', car: '🚗', train: '🚆', uber: '🚗',
}

// ── EventCard (per YOU-750 spec) ──────────────────────────────────────────

function EventCard({ item, onRemove }: { item: ItineraryItem; onRemove?: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  const cat = item.category ?? 'other'
  const catStyle = CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.other

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      style={{ borderRadius: 12, background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}
    >
      {/* Image — full-width, 160px */}
      {item.imageUrl && !imgErr ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          onError={() => setImgErr(true)}
          style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          style={{
            width: '100%', height: 160,
            background: catStyle.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 36 }}>{catStyle.icon}</span>
        </div>
      )}

      {/* Content — 8px top, 12px sides + bottom */}
      <div style={{ padding: '8px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3, flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', flexShrink: 0 }}>
                {item.time}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                {item.title}
              </span>
            </div>
            <p style={{
              fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            }}>
              {item.detail}
            </p>
          </div>

          {onRemove && (
            <button
              onClick={onRemove}
              aria-label={`Remove ${item.title}`}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)', fontSize: 16, lineHeight: 1, marginTop: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── TransportLegPill (per YOU-750 spec) ───────────────────────────────────

function TransportLegPill({ leg }: { leg: TransportLeg }) {
  const icon = TRANSPORT_ICON[leg.mode.toLowerCase()] ?? '→'
  const label = `~${leg.duration}${leg.notes ? ` · ${leg.notes}` : ''}`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
      <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'rgba(0,0,0,0.04)', borderRadius: 999,
        padding: '4px 12px', fontSize: 12, color: 'var(--text-tertiary)',
      }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
    </div>
  )
}

// ── PersonalizationTag (per YOU-750 spec) ─────────────────────────────────

function PersonalizationTag({ name = 'Jeevy' }: { name?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 0 16px' }}>
      <span style={{ fontSize: 11, color: '#818CF8' }}>✦</span>
      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Curated for you by {name}</span>
    </div>
  )
}

// ── AlterSheet ────────────────────────────────────────────────────────────

function AlterSheet({ onSubmit, onDismiss, isLoading }: {
  onSubmit: (instruction: string) => void
  onDismiss: () => void
  isLoading: boolean
}) {
  const [draft, setDraft] = useState('')
  const SUGGESTIONS = [
    'Make the pace more relaxed',
    'Add a seafood dinner on day 2',
    'Swap morning activity for a museum',
    'Add a rooftop bar in the evening',
  ]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onDismiss} />
      <motion.div
        className="relative rounded-t-3xl pb-10 pt-6 px-5"
        style={{ background: 'var(--bg-secondary)' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
        <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>
          Jeevy · Alter plan
        </p>
        <h2 className="text-[22px] font-semibold mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          What would you like to change?
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setDraft(s)}
              className="text-[13px] px-3 py-1.5 rounded-full border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg)' }}>
              {s}
            </button>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={'e.g. "Move dinner somewhere in Alfama"'}
          rows={3}
          className="w-full rounded-2xl px-4 py-3 text-[15px] outline-none resize-none mb-4"
          style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        />
        <button
          onClick={() => draft.trim() && onSubmit(draft.trim())}
          disabled={!draft.trim() || isLoading}
          className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-opacity disabled:opacity-40"
          style={{ background: 'var(--text-primary)' }}
        >
          {isLoading ? 'Updating your plan…' : 'Update my plan →'}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Day section ────────────────────────────────────────────────────────────

function DaySection({ day, removedKeys, onRemove }: {
  day: ItineraryDay
  removedKeys: Set<string>
  onRemove: (key: string) => void
}) {
  const visibleItems = day.items.filter((_, i) => !removedKeys.has(`${day.day}:${i}`))
  if (visibleItems.length === 0) return null

  return (
    <div>
      <div style={{
        fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)',
        paddingBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.04em',
      }}>
        {day.day}
      </div>
      <AnimatePresence>
        {visibleItems.map((item, vi) => {
          const originalIndex = day.items.indexOf(item)
          const itemKey = `${day.day}:${originalIndex}`
          const hasNextVisible = vi < visibleItems.length - 1
          const showLeg = !!item.transportAfter && hasNextVisible
          return (
            <div key={itemKey}>
              <EventCard item={item} onRemove={() => onRemove(itemKey)} />
              {showLeg && item.transportAfter && <TransportLegPill leg={item.transportAfter} />}
            </div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
  itinerary?: Itinerary | null
  alterPlan?: (instruction: string) => Promise<void>
  alterStatus?: 'idle' | 'altering'
  loadStatus?: 'idle' | 'loading' | 'error'
  onStartOver?: () => void
}

export function S8ItineraryPeak({ itinerary, alterPlan, alterStatus = 'idle', loadStatus = 'idle', onStartOver }: Props) {
  const [alterOpen, setAlterOpen] = useState(false)
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  const display = itinerary ?? FIXTURE

  useEffect(() => {
    if (itinerary && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [itinerary])

  async function handleAlterSubmit(instruction: string) {
    if (!alterPlan) return
    setAlterOpen(false)
    setRemovedKeys(new Set())
    await alterPlan(instruction)
  }

  const heroImage = display.days[0]?.items[0]?.imageUrl ?? '/fixture-images/city-lisbon.webp'
  const busy = alterStatus === 'altering' || loadStatus === 'loading'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-secondary)', position: 'relative' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={heroImage}
          alt={display.destination}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.05) brightness(0.88)' }}
          onError={e => { (e.target as HTMLImageElement).src = '/fixture-images/city-lisbon.webp' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 30%, var(--bg-secondary) 100%)',
        }} />

        {onStartOver && (
          <button onClick={onStartOver} style={{
            position: 'absolute', top: 52, left: 16,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
            border: 'none', borderRadius: 999, padding: '6px 14px',
            color: 'white', fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            ← Back
          </button>
        )}

        <div style={{ position: 'absolute', bottom: 12, left: 20 }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', margin: 0 }}>
            {display.destination}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '2px 0 0' }}>
            {display.dates} · Ready to go
          </p>
        </div>
      </div>

      {/* Personalization + status banners */}
      <div style={{ padding: '4px 20px 0' }}>
        <PersonalizationTag name="Jeevy" />

        <AnimatePresence>
          {(loadStatus === 'loading' || alterStatus === 'altering') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                borderRadius: 10, background: 'var(--accent-light)',
                padding: '10px 14px', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <motion.div
                style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)', margin: 0 }}>
                {alterStatus === 'altering' ? 'Jeevy is updating your plan…' : 'Building your personalised itinerary…'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card stack */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 16px 200px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {display.days.map(day => (
            <DaySection
              key={day.day}
              day={day}
              removedKeys={removedKeys}
              onRemove={key => setRemovedKeys(prev => new Set([...prev, key]))}
            />
          ))}
        </div>
      </div>

      {/* Sticky CTA bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 34px',
        background: 'linear-gradient(to top, var(--bg-secondary) 80%, transparent 100%)',
      }}>
        <div style={{ maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            style={{
              width: '100%', padding: '16px 0', borderRadius: 16,
              background: 'var(--text-primary)', color: 'white',
              fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer',
            }}
          >
            Add to Calendar
          </button>

          {alterPlan && (
            <button
              onClick={() => !busy && setAlterOpen(true)}
              disabled={busy}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'none', border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
                color: 'var(--text-secondary)', fontSize: 14, padding: '4px 0',
                opacity: busy ? 0.4 : 1, transition: 'opacity 0.15s',
              }}
            >
              <span>✏️</span>
              <span>Change something?</span>
            </button>
          )}

          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center', padding: '2px 0',
            }}
          >
            Share trip
          </button>
        </div>
      </div>

      {/* Alter sheet */}
      <AnimatePresence>
        {alterOpen && (
          <AlterSheet
            onSubmit={handleAlterSubmit}
            onDismiss={() => setAlterOpen(false)}
            isLoading={alterStatus === 'altering'}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
