import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { EventCategory, Itinerary, ItineraryDay, ItineraryItem, TransportLeg } from '../../../lib/conciergeApi'
import { ItemEditSheet } from '../ItemEditSheet'

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

const CATEGORY_STYLE: Record<EventCategory, { bg: string; icon: string; label: string }> = {
  conference:    { bg: '#EEF2FF', icon: '📅', label: 'Conference' },
  dining:        { bg: '#FFFBEB', icon: '🍽️', label: 'Dining' },
  explore:       { bg: '#ECFDF5', icon: '📍', label: 'Explore' },
  accommodation: { bg: '#F0F9FF', icon: '🏨', label: 'Stay' },
  other:         { bg: '#F9FAFB', icon: '✨', label: 'Other' },
}

// ── Transport mode icons (per YOU-750 spec) ───────────────────────────────

const TRANSPORT_ICON: Record<string, string> = {
  walk: '🚶', taxi: '🚕', metro: '🚇', tram: '🚊',
  ferry: '⛴️', bus: '🚌', car: '🚗', train: '🚆', uber: '🚗',
}

// ── EventCard — tappable, no × button (AC#1, AC#2) ───────────────────────

function EventCard({ item, onClick }: { item: ItineraryItem; onClick: () => void }) {
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
      {/* Full card is a single tap target — no × in read state (AC#1) */}
      <button
        onClick={onClick}
        aria-label={`View details for ${item.title}`}
        style={{
          display: 'block', width: '100%', background: 'none',
          border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
        {/* Image — full-width, 160px */}
        <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
          {item.imageUrl && !imgErr ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: catStyle.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 36 }}>{catStyle.icon}</span>
            </div>
          )}
          {/* Time chip (bottom-left) */}
          {item.time && (
            <div style={{
              position: 'absolute', bottom: 8, left: 10,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
              borderRadius: 6, padding: '2px 8px',
            }}>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{item.time}</span>
            </div>
          )}
          {/* Category badge (top-left) */}
          <div style={{
            position: 'absolute', top: 8, left: 10,
            background: catStyle.bg, borderRadius: 6, padding: '2px 8px',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>
              {catStyle.icon} {catStyle.label}
            </span>
          </div>
          {/* › chevron — tappability signifier (AC#2) */}
          <div style={{
            position: 'absolute', top: 8, right: 10,
            background: 'rgba(0,0,0,0.30)', borderRadius: '50%',
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ color: 'white', fontSize: 14, lineHeight: 1 }}>›</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '8px 12px 12px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.25 }}>
            {item.title}
          </p>
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
          }}>
            {item.detail}
          </p>
        </div>
      </button>
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

// ── ItemDetailSheet — AC#3: bottom sheet, 60vh, slide-up, scrim, swipe-dismiss ──

interface ItemDetailSheetProps {
  item: ItineraryItem | null
  onClose: () => void
  onRemove: (item: ItineraryItem) => void
  onChangeItem: (item: ItineraryItem) => void
}

function ItemDetailSheet({ item, onClose, onRemove, onChangeItem }: ItemDetailSheetProps) {
  const controls = useDragControls()
  const [imgErr, setImgErr] = useState(false)

  const cat = item?.category ?? 'other'
  const catStyle = CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.other

  useEffect(() => { setImgErr(false) }, [item?.title])

  // Close on Escape
  useEffect(() => {
    if (!item) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [item, onClose])

  // Lock body scroll
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [item])

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Scrim */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet — 60vh max, slide-up 300ms ease-out (AC#3) */}
          <motion.div
            drag="y"
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_: unknown, info: { offset: { y: number } }) => {
              if (info.offset.y > 80) onClose()
            }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
            style={{
              maxHeight: '60vh',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Drag handle */}
            <div
              style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, cursor: 'grab', flexShrink: 0 }}
              onPointerDown={e => controls.start(e)}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {/* Hero image — 160px per spec */}
              <div style={{ position: 'relative', height: 160, flexShrink: 0, overflow: 'hidden' }}>
                {item.imageUrl && !imgErr ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={() => setImgErr(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: catStyle.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 48 }}>{catStyle.icon}</span>
                  </div>
                )}
                {/* Time chip */}
                {item.time && (
                  <div style={{
                    position: 'absolute', bottom: 8, left: 12,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    borderRadius: 6, padding: '3px 10px',
                  }}>
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{item.time}</span>
                  </div>
                )}
                {/* Category badge */}
                <div style={{
                  position: 'absolute', top: 8, left: 12,
                  background: catStyle.bg, borderRadius: 6, padding: '3px 10px',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>
                    {catStyle.icon} {catStyle.label}
                  </span>
                </div>
              </div>

              {/* Title + detail */}
              <div style={{ padding: '14px 16px 8px' }}>
                <h2 style={{
                  fontSize: 17, fontWeight: 700, color: 'var(--text-primary)',
                  margin: '0 0 6px', lineHeight: 1.3,
                }}>
                  {item.title}
                </h2>
                {item.detail && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {item.detail}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons — sticky, min-h-44 (WCAG 2.5.5) (AC#3, AC#6) */}
            <div style={{
              padding: '12px 16px 20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              flexShrink: 0,
            }}>
              {/* Primary: Edit item inline — opens structured pre-fill form (YOU-759) */}
              <button
                onClick={() => onChangeItem(item)}
                style={{
                  width: '100%', minHeight: 44, borderRadius: 12,
                  background: 'var(--accent)', color: 'white',
                  fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  marginBottom: 8,
                }}
              >
                <span>✏️</span>
                <span>Edit item</span>
              </button>
              {/* Secondary: Remove from plan — removal moved inside sheet (AC#5) */}
              <button
                onClick={() => onRemove(item)}
                style={{
                  width: '100%', minHeight: 44, borderRadius: 12,
                  background: 'none', color: 'var(--text-secondary)',
                  fontWeight: 500, fontSize: 13,
                  border: '1px solid var(--border)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                <span>🗑</span>
                <span>Remove from plan</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── AlterSheet — AC#4: accepts prefilledText for "Change this item" ───────

function AlterSheet({ onSubmit, onDismiss, isLoading, prefilledText = '' }: {
  onSubmit: (instruction: string) => void
  onDismiss: () => void
  isLoading: boolean
  prefilledText?: string
}) {
  const [draft, setDraft] = useState(prefilledText)
  const SUGGESTIONS = [
    'Make the pace more relaxed',
    'Add a seafood dinner on day 2',
    'Swap morning activity for a museum',
    'Add a rooftop bar in the evening',
  ]

  // Sync when prefilledText changes (re-opened for different item)
  useEffect(() => { setDraft(prefilledText) }, [prefilledText])

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

// ── DaySection ────────────────────────────────────────────────────────────

function DaySection({ day, removedKeys, editedItems, onOpen }: {
  day: ItineraryDay
  removedKeys: Set<string>
  editedItems: Map<string, ItineraryItem>
  onOpen: (item: ItineraryItem, key: string) => void
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
          // Optimistic override: use locally-edited version if available
          const resolvedItem = editedItems.get(itemKey) ?? item
          const hasNextVisible = vi < visibleItems.length - 1
          const showLeg = !!resolvedItem.transportAfter && hasNextVisible
          return (
            <div key={itemKey}>
              <EventCard item={resolvedItem} onClick={() => onOpen(resolvedItem, itemKey)} />
              {showLeg && resolvedItem.transportAfter && <TransportLegPill leg={resolvedItem.transportAfter} />}
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
  const [alterPrefilledText, setAlterPrefilledText] = useState('')
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set())
  // AC#3: item detail sheet state
  const [activeItem, setActiveItem] = useState<ItineraryItem | null>(null)
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null)
  // YOU-759: inline edit sheet state
  const [editItem, setEditItem] = useState<ItineraryItem | null>(null)
  const [editItemKey, setEditItemKey] = useState<string | null>(null)
  const [editedItems, setEditedItems] = useState<Map<string, ItineraryItem>>(new Map())
  // AC#5: undo toast state
  const [undoState, setUndoState] = useState<{ key: string; title: string } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const display = itinerary ?? FIXTURE

  useEffect(() => {
    if (itinerary && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [itinerary])

  // Cleanup undo timer
  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }
  }, [])

  async function handleAlterSubmit(instruction: string) {
    if (!alterPlan) return
    setAlterOpen(false)
    setAlterPrefilledText('')
    setRemovedKeys(new Set())
    await alterPlan(instruction)
  }

  // AC#3: open detail sheet
  const handleOpenItem = useCallback((item: ItineraryItem, key: string) => {
    setActiveItem(item)
    setActiveItemKey(key)
  }, [])

  const handleCloseSheet = useCallback(() => {
    setActiveItem(null)
    setActiveItemKey(null)
  }, [])

  // AC#5: remove via sheet → undo toast (removal moved inside sheet)
  const handleRemoveItem = useCallback((item: ItineraryItem) => {
    if (!activeItemKey) return
    const key = activeItemKey
    setRemovedKeys(prev => new Set([...prev, key]))
    setActiveItem(null)
    setActiveItemKey(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoState({ key, title: item.title })
    undoTimerRef.current = setTimeout(() => setUndoState(null), 5000)
  }, [activeItemKey])

  const handleUndoRemove = useCallback(() => {
    if (!undoState) return
    setRemovedKeys(prev => {
      const next = new Set(prev)
      next.delete(undoState.key)
      return next
    })
    setUndoState(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }, [undoState])

  // YOU-759: "Edit item" → open structured inline edit form (pre-filled, no AI)
  const handleChangeItem = useCallback((item: ItineraryItem) => {
    setEditItem(item)
    setEditItemKey(activeItemKey)
    setActiveItem(null)
    setActiveItemKey(null)
  }, [activeItemKey])

  const handleSaveEdit = useCallback((updated: ItineraryItem) => {
    if (editItemKey) {
      setEditedItems(prev => new Map(prev).set(editItemKey, updated))
    }
    setEditItem(null)
    setEditItemKey(null)
  }, [editItemKey])

  const handleCancelEdit = useCallback(() => {
    setEditItem(null)
    setEditItemKey(null)
  }, [])

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

        {/* ← Back — min 44px tap target (AC#6) */}
        {onStartOver && (
          <button onClick={onStartOver} style={{
            position: 'absolute', top: 52, left: 16,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
            border: 'none', borderRadius: 999,
            minHeight: 44, padding: '0 16px',
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
              editedItems={editedItems}
              onOpen={handleOpenItem}
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
          {/* Add to Calendar — already ≥44px */}
          <button
            style={{
              width: '100%', padding: '16px 0', borderRadius: 16,
              background: 'var(--text-primary)', color: 'white',
              fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer',
            }}
          >
            Add to Calendar
          </button>

          {/* ✏️ Change something? — min 44px tap target (AC#6) */}
          {alterPlan && (
            <button
              onClick={() => !busy && (setAlterPrefilledText(''), setAlterOpen(true))}
              disabled={busy}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'none', border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
                color: 'var(--text-secondary)', fontSize: 14,
                minHeight: 44, padding: '0 8px',
                opacity: busy ? 0.4 : 1, transition: 'opacity 0.15s',
              }}
            >
              <span>✏️</span>
              <span>Change something?</span>
            </button>
          )}

          {/* Share trip — min 44px tap target (AC#6) */}
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: 14,
              minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Share trip
          </button>
        </div>
      </div>

      {/* AC#3: Item Detail Bottom Sheet */}
      <ItemDetailSheet
        item={activeItem}
        onClose={handleCloseSheet}
        onRemove={handleRemoveItem}
        onChangeItem={handleChangeItem}
      />

      {/* YOU-759: Inline edit sheet — structured pre-fill form for transport/restaurant/flight */}
      <ItemEditSheet
        item={editItem}
        onSave={handleSaveEdit}
        onClose={handleCancelEdit}
      />

      {/* AC#5: Undo toast — 5s, appears above sticky bar */}
      <AnimatePresence>
        {undoState && (
          <motion.div
            className="fixed left-0 right-0 z-30 flex justify-center px-4 pointer-events-none"
            style={{ bottom: 120 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              padding: '12px 16px', maxWidth: 360, width: '100%',
              pointerEvents: 'auto',
            }}>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Removed <strong style={{ color: 'var(--text-primary)' }}>{undoState.title}</strong>
              </span>
              <button
                onClick={handleUndoRemove}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent)', fontWeight: 700, fontSize: 13,
                  flexShrink: 0, minHeight: 44, minWidth: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alter sheet */}
      <AnimatePresence>
        {alterOpen && (
          <AlterSheet
            onSubmit={handleAlterSubmit}
            onDismiss={() => { setAlterOpen(false); setAlterPrefilledText('') }}
            isLoading={alterStatus === 'altering'}
            prefilledText={alterPrefilledText}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
