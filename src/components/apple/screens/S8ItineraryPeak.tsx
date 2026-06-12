import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Itinerary, ItineraryItem, TransportLeg } from '../../../lib/conciergeApi'

const RING_SIZE = 120
const STROKE = 8
const RADIUS = (RING_SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Props {
  itinerary?: Itinerary | null
  alterPlan?: (instruction: string) => Promise<void>
  alterStatus?: 'idle' | 'altering'
}

// ---------------------------------------------------------------------------
// Fixture image resolver — maps item content to available fixture assets
// ---------------------------------------------------------------------------

const CONFERENCE_IMAGES = [
  '/fixture-images/conference-session-keynote-k01.webp',
  '/fixture-images/conference-session-keynote-k02.webp',
  '/fixture-images/conference-session-keynote-k08.webp',
  '/fixture-images/conference-session-keynote-w07.webp',
]

function inferFixtureImage(item: ItineraryItem, index: number): string {
  const text = `${item.title} ${item.detail} ${item.imageQuery ?? ''}`.toLowerCase()

  if (/conference|summit|keynote|session|talk|workshop|networking|expo/.test(text)) {
    return CONFERENCE_IMAGES[index % CONFERENCE_IMAGES.length]
  }
  if (/dinner|restaurant|lunch|cuisine|food|eat|dining|tavern|michelin|tasting/.test(text)) {
    return '/fixture-images/restaurant-dinner-lisbon.webp'
  }
  if (/hotel|check.?in|check.?out|accommodation|room|suite|sleep/.test(text)) {
    return '/fixture-images/hotel-marriott-lisbon-exterior.webp'
  }
  if (/arrive|arrival|airport|portela|lis|flight|transfer/.test(text)) {
    return '/fixture-images/flight-outbound-business-cabin.webp'
  }
  return '/fixture-images/city-lisbon.webp'
}

// ---------------------------------------------------------------------------
// Transport connector between items — pill with vertical connector line
// ---------------------------------------------------------------------------

function TransportConnector({ leg }: { leg: TransportLeg }) {
  const icons: Record<string, string> = {
    walk: '🚶', taxi: '🚕', metro: '🚇', uber: '🚗', tram: '🚊',
    ferry: '⛴️', bus: '🚌', car: '🚗', train: '🚆',
  }
  const icon = icons[leg.mode.toLowerCase()] ?? '➡️'

  return (
    <div className="flex flex-col items-center my-0.5" style={{ paddingLeft: '20px' }}>
      <div className="w-px h-3" style={{ background: 'var(--border)' }} />
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px]"
        style={{
          background: 'var(--bg-secondary)',
          color: 'var(--text-tertiary)',
          border: '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span>{leg.duration}{leg.notes ? ` · ${leg.notes}` : ''}</span>
      </div>
      <div className="w-px h-3" style={{ background: 'var(--border)' }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Single timeline item card with image at top — card-first layout
// ---------------------------------------------------------------------------

function ItemCard({ item, index }: { item: ItineraryItem; index: number }) {
  const [imgError, setImgError] = useState(false)
  const resolvedSrc = (!imgError && item.imageUrl) ? item.imageUrl : inferFixtureImage(item, index)

  return (
    <div
      className="mb-3 rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Image at top — 160px tall, full-bleed */}
      <div style={{ height: 160, overflow: 'hidden' }}>
        <img
          src={resolvedSrc}
          alt={item.title}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.93) saturate(1.08)' }}
          onError={() => setImgError(true)}
        />
      </div>
      {/* Content below */}
      <div className="px-3 py-3">
        <div className="flex items-start gap-2.5">
          <span
            className="text-[12px] font-medium shrink-0"
            style={{ color: 'var(--accent)', minWidth: 52, marginTop: 2 }}
          >
            {item.time}
          </span>
          <div className="min-w-0">
            <p
              className="text-[15px] font-semibold leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              {item.title}
            </p>
            <p
              className="text-[13px] mt-0.5 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Personalization cue — "Curated for you by Jeevy"
// ---------------------------------------------------------------------------

function PersonalizationTag() {
  return (
    <motion.div
      className="flex items-center justify-center gap-1.5 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <span style={{ color: 'var(--accent)', fontSize: 11 }}>✦</span>
      <span
        className="text-[12px] tracking-wide"
        style={{ color: 'var(--text-tertiary)', fontVariant: 'normal' }}
      >
        Curated for you by Jeevy
      </span>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Alter sheet — bottom sheet to request plan changes
// ---------------------------------------------------------------------------

function AlterSheet({
  onSubmit,
  onDismiss,
  isLoading,
}: {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.48)' }}
        onClick={onDismiss}
      />
      <motion.div
        className="relative rounded-t-3xl pb-10 pt-6 px-5"
        style={{ background: 'var(--bg)' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
        <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>
          Jeevy · Update plan
        </p>
        <h2
          className="text-[22px] font-semibold mb-4"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
        >
          What would you like to change?
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setDraft(s)}
              className="text-[13px] px-3 py-1.5 rounded-full border transition-colors"
              style={{
                borderColor: draft === s ? 'var(--accent)' : 'var(--border)',
                color: draft === s ? 'var(--accent)' : 'var(--text-secondary)',
                background: draft === s ? 'var(--accent-light)' : 'var(--bg-secondary)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="e.g. Move the dinner to Alfama, add a wine tasting"
          rows={3}
          className="w-full rounded-2xl px-4 py-3 text-[15px] outline-none resize-none mb-4"
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
          autoFocus
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

// ---------------------------------------------------------------------------
// Fixture timeline (shown when no live itinerary is available)
// ---------------------------------------------------------------------------

type TimelineItem =
  | { kind: 'booking'; headline: string; sub: string; swappable: true; alts: string[] }
  | { kind: 'info'; headline: string; sub: string; swappable: false }

interface TimelineGroup {
  dateKey: string
  day: string
  label: string
  items: TimelineItem[]
  transitLeg?: { icon: string; text: string }
}

const TIMELINE: TimelineGroup[] = [
  {
    dateKey: 'nov9-depart',
    day: 'Sun, Nov 9',
    label: 'Depart',
    items: [{ kind: 'booking', headline: 'United · SFO → LIS', sub: 'Departs 22:10 · Arrives +1 07:45', swappable: true, alts: ['TAP Air Portugal TP236 · Nov 9 23:45 · Non-stop', 'Delta UA88 · 14:30 · 1 stop via JFK', 'British Airways BA498 · 10:00 · 1 stop via LHR'] }],
    transitLeg: { icon: '🚕', text: 'Taxi · 25 min · ~€18' },
  },
  {
    dateKey: 'nov10-checkin',
    day: 'Sun, Nov 10',
    label: 'Arrive + Check-in',
    items: [{ kind: 'booking', headline: 'Bairro Alto Hotel', sub: 'Check-in from 15:00', swappable: true, alts: ['Memmo Alfama · Boutique · Castle views · €380/night', 'Marriott Lisbon · 4.8km · €289/night', 'Palácio Belmonte · 15th-century palace · €650/night'] }],
    transitLeg: { icon: '🚶', text: 'Walk · 8 min' },
  },
  {
    dateKey: 'nov9-12-conf',
    day: 'Nov 9–12',
    label: 'Conference',
    items: [{ kind: 'info', headline: 'Web Summit 2026', sub: '⭐ AI & Product · Nov 9 10:00', swappable: false }],
    transitLeg: { icon: '🚇', text: 'Metro · 12 min · ~€1.50' },
  },
  {
    dateKey: 'nov9-dinner',
    day: 'Nov 9',
    label: 'Dinner',
    items: [{ kind: 'booking', headline: 'Cervejaria Ramiro', sub: '19:30 · Table for 2 · Indoor', swappable: true, alts: ['Solar dos Presuntos · Traditional · €€', 'Taberna da Rua das Flores · Tapas · €€', 'Belcanto · Fine dining · €€€€'] }],
  },
]

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function S8ItineraryPeak({ itinerary, alterPlan, alterStatus = 'idle' }: Props) {
  const [phase, setPhase] = useState<'ring' | 'timeline'>('ring')
  const [swapOpen, setSwapOpen] = useState<string | null>(null)
  const [alterOpen, setAlterOpen] = useState(false)
  const ringControls = useAnimation()
  const textControls = useAnimation()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function runEntrance() {
      await ringControls.start({ strokeDashoffset: 0, transition: { duration: 0.8, ease: 'easeInOut' } })
      await textControls.start({ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } })
      await new Promise(r => setTimeout(r, 900))
      setPhase('timeline')
    }
    runEntrance()
  }, [ringControls, textControls])

  async function handleAlterSubmit(instruction: string) {
    if (!alterPlan) return
    setAlterOpen(false)
    await alterPlan(instruction)
  }

  const heroImage = itinerary?.days[0]?.items[0]?.imageUrl ?? '/fixture-images/city-lisbon.webp'

  return (
    <div className="flex flex-col min-h-screen bg-surface-0 relative overflow-hidden">

      {/* Phase 1: Full-screen photo + completeness ring */}
      <AnimatePresence>
        {phase === 'ring' && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center z-20"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt={itinerary?.destination ?? 'Destination'}
                className="w-full h-full object-cover"
                style={{ filter: 'saturate(1.1) brightness(0.82)' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/fixture-images/city-lisbon.webp' }}
              />
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
            </div>

            <div className="relative flex flex-col items-center gap-6">
              <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={STROKE} />
                <motion.circle
                  cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none"
                  stroke="white" strokeWidth={STROKE} strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE} initial={{ strokeDashoffset: CIRCUMFERENCE }}
                  animate={ringControls}
                />
              </svg>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={textControls}
              >
                <p className="text-white font-semibold leading-tight" style={{ fontSize: '38px', letterSpacing: '-0.02em' }}>
                  Trip ready.
                </p>
                <p className="text-white/70 text-[16px] mt-2">
                  {itinerary ? itinerary.destination : 'Web Summit 2026'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Timeline view */}
      <AnimatePresence>
        {phase === 'timeline' && (
          <motion.div
            className="flex flex-col min-h-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
          >
            {/* Hero peek */}
            <div className="relative h-[180px] shrink-0 overflow-hidden">
              <img
                src={heroImage}
                alt={itinerary?.destination ?? 'Destination'}
                className="w-full h-full object-cover"
                style={{ filter: 'saturate(1.05) brightness(0.88)' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/fixture-images/city-lisbon.webp' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.55) 100%)' }}
              />
              <div className="absolute bottom-4 left-5">
                <p className="text-white font-semibold text-[20px]" style={{ letterSpacing: '-0.02em', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                  {itinerary ? itinerary.destination : 'Web Summit 2026 · Lisbon'}
                </p>
                <p className="text-white/75 text-[13px] mt-0.5">
                  {itinerary ? itinerary.dates : 'Nov 9–12 · Ready to go'}
                </p>
              </div>
            </div>

            {/* Personalization cue */}
            <div
              className="px-5 pb-1 pt-0"
              style={{ borderBottom: '1px solid var(--separator)' }}
            >
              <PersonalizationTag />
            </div>

            {/* Alter status banner */}
            <AnimatePresence>
              {alterStatus === 'altering' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 py-3 flex items-center gap-2"
                  style={{ background: 'var(--accent-light)' }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--accent)' }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <p className="text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
                    Jeevy is updating your plan…
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeline */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-3 pb-40">
              {itinerary
                ? itinerary.days.map((day, gi) => (
                    <div key={day.day} className={gi > 0 ? 'mt-6' : 'mt-1'}>
                      {/* Day header */}
                      <div className="flex items-baseline gap-2 mb-3 pl-1">
                        <span
                          className="text-[12px] font-semibold uppercase tracking-widest"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {day.day}
                        </span>
                      </div>
                      {/* Items with inline transport connectors */}
                      {day.items.map((item, ii) => (
                        <div key={ii}>
                          {/* Skeleton shimmer during alter */}
                          {alterStatus === 'altering' ? (
                            <div
                              className="mb-3 rounded-xl overflow-hidden"
                              style={{ height: 200, background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg) 50%, var(--bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}
                            />
                          ) : (
                            <ItemCard item={item} index={gi * 10 + ii} />
                          )}
                          {item.transportAfter && ii < day.items.length - 1 && (
                            <TransportConnector leg={item.transportAfter} />
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                : TIMELINE.map((group, gi) => (
                    <div key={group.dateKey} className={gi > 0 ? 'mt-5' : 'mt-2'}>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>{group.day}</span>
                        <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>{group.label}</span>
                      </div>
                      <div className="relative pl-5">
                        <div className="absolute left-[5px] top-2 w-px" style={{ background: 'var(--border)', bottom: gi < TIMELINE.length - 1 ? -20 : 0 }} />
                        <div className="absolute left-0 top-[7px] w-2.5 h-2.5 rounded-full" style={{ background: 'var(--text-primary)', border: '2px solid var(--bg-secondary)', zIndex: 1 }} />
                        {group.items.map(item => {
                          const swapKey = `${group.dateKey}-${item.headline}`
                          const isSwapOpen = swapOpen === swapKey
                          return (
                            <div key={item.headline} className="mb-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-[16px] font-semibold text-on-surface leading-snug">{item.headline}</p>
                                  <p className="text-[13px] text-on-dim mt-0.5">{item.sub}</p>
                                </div>
                                {item.swappable && (
                                  <button
                                    onClick={() => setSwapOpen(isSwapOpen ? null : swapKey)}
                                    className="shrink-0 text-[13px] font-medium mt-0.5 transition-opacity active:opacity-60"
                                    style={{ color: 'var(--accent)' }}
                                  >
                                    {isSwapOpen ? 'Done' : '[Swap]'}
                                  </button>
                                )}
                              </div>
                              <AnimatePresence>
                                {item.swappable && isSwapOpen && (
                                  <motion.div
                                    className="mt-2 rounded-xl overflow-hidden"
                                    style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-card)' }}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {item.alts.map((alt, ai) => (
                                      <button key={alt} onClick={() => setSwapOpen(null)} className={`w-full text-left px-4 py-3 text-[14px] text-on-dim active:bg-surface-2 transition-colors ${ai < item.alts.length - 1 ? 'border-b border-border' : ''}`}>
                                        {alt}
                                      </button>
                                    ))}
                                    <div className="px-4 py-2.5 border-t border-border">
                                      <button onClick={() => setSwapOpen(null)} className="text-[12px] text-on-faint transition-opacity active:opacity-60">Keep current</button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                        {group.transitLeg && (
                          <div className="mt-2 mb-1 flex items-center gap-1.5">
                            <span className="text-[14px]">{group.transitLeg.icon}</span>
                            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{group.transitLeg.text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              }
            </div>

            {/* Sticky CTAs */}
            <div
              className="fixed bottom-0 left-0 right-0 flex flex-col items-center gap-2 px-5 pb-10 pt-5"
              style={{ background: 'linear-gradient(to top, var(--bg-secondary) 75%, transparent 100%)' }}
            >
              <div className="w-full max-w-[430px] flex flex-col gap-2.5">
                {/* Primary: Add to Calendar */}
                <button
                  className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
                  style={{ background: 'var(--text-primary)' }}
                >
                  Add to Calendar
                </button>

                {/* Secondary: Change something */}
                {alterPlan && (
                  <button
                    onClick={() => setAlterOpen(true)}
                    disabled={alterStatus === 'altering'}
                    className="w-full py-3.5 rounded-2xl font-medium text-[15px] transition-opacity disabled:opacity-40 active:opacity-70"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {alterStatus === 'altering' ? '✦ Updating your plan…' : '✏️  Change something?'}
                  </button>
                )}

                {/* Tertiary: Share */}
                <Link
                  to="/itinerary/ws2026/day-of"
                  className="block w-full text-center text-[14px] font-medium py-1 transition-opacity active:opacity-60"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Share trip
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
