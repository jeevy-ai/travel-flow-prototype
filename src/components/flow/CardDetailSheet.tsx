import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import type { TimelineEntry, FlowEngine, AlternativeOption, EntryType } from '../../hooks/useFlowEngine'
import { TimelineEntryExpanded } from '../timeline/TimelineEntryExpanded'
import { ImageSlot } from '../timeline/ImageSlot'
import { MiniMap } from '../map/MiniMap'
import { ENTRY_COORDS } from '../../data/entryCoords'

// ── Helpers ───────────────────────────────────────────────────────────────────

function entryTitle(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'flight_outbound': return 'SFO → LIS · Outbound'
    case 'flight_return': return 'LIS → SFO · Return'
    case 'hotel': return 'Marriott Lisbon'
    case 'conference_venue': return 'Altice Arena'
    case 'conference_session': return String(entry.data['title'] ?? entry.ghostHeadline)
    case 'reminders': return 'Reminders & packing'
    case 'restaurant': return String(entry.data['name'] ?? entry.ghostHeadline)
    case 'activity': return String(entry.data['name'] ?? entry.ghostHeadline)
    default: return entry.ghostHeadline
  }
}

function entryEmoji(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'hotel': return '🏨'
    case 'restaurant': return '🍽'
    case 'activity': return '🌟'
    case 'conference_session':
    case 'conference_venue': return '🎙'
    default: return '📍'
  }
}

const CATEGORY_LABELS: Partial<Record<EntryType, string>> = {
  flight_outbound: 'Flight',
  flight_return: 'Flight',
  hotel: 'Hotel',
  conference_venue: 'Venue',
  conference_session: 'Session',
  reminders: 'Reminders',
  restaurant: 'Restaurant',
  activity: 'Activity',
  ride: 'Transport',
}

function formatTime(iso: string | null): string {
  if (!iso) return ''
  const match = iso.match(/T(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}

// Entries with a dedicated swap screen
const SCREEN_FOR_ENTRY: Record<string, number> = {
  flt_outbound: 2,
  flt_return: 2,
  hotel_main: 3,
  'WS2026-K01': 4,
  'WS2026-K02': 4,
  'WS2026-K08': 4,
  'WS2026-W07': 4,
  reminders: 6,
}

// Detect desktop viewport (≥768px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

// ── Venue info strip (rating + address + Google Maps link) ────────────────────

function VenueInfoStrip({ entry }: { entry: TimelineEntry }) {
  const d = entry.data
  const rating = d['rating'] as string | undefined
  const address = d['address'] as string | undefined
  const sourceLink = d['sourceLink'] as string | undefined
  const coords = ENTRY_COORDS[entry.id]

  const googleMapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`
    : address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null

  if (!rating && !address && !sourceLink && !googleMapsUrl) return null

  return (
    <div className="px-4 pb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {rating && (
        <span className="text-[13px] font-semibold text-amber-400">{rating}</span>
      )}
      {address && (
        <span className="text-[12px] text-on-dim truncate max-w-xs">{address}</span>
      )}
      <div className="flex gap-2 ml-auto shrink-0">
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
          >
            <span>🗺</span> Open in Maps →
          </a>
        )}
        {sourceLink && (
          <a
            href={sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
          >
            View details →
          </a>
        )}
      </div>
    </div>
  )
}

// ── Mini-map section ──────────────────────────────────────────────────────────

function VenueMiniMap({ entry }: { entry: TimelineEntry }) {
  const coords = ENTRY_COORDS[entry.id]
  if (!coords) return null

  const title = entryTitle(entry)
  const emoji = entryEmoji(entry)
  const address = entry.data['address'] as string | undefined
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`

  return (
    <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-border relative">
      <MiniMap
        lat={coords[0]}
        lng={coords[1]}
        label={title}
        emoji={emoji}
        className="h-40 w-full"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-surface-0/90 backdrop-blur-sm border-t border-border px-3 py-2 flex items-center gap-2">
        <span className="text-lg shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface text-[12px] font-semibold truncate">{title}</p>
          {address && <p className="text-on-dim text-[10px] truncate">{address}</p>}
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[10px] font-semibold text-accent border border-accent/30 rounded-md px-2 py-0.5 hover:bg-accent/10 transition-colors"
        >
          Maps →
        </a>
      </div>
    </div>
  )
}

// ── Alter Plan picker (alternatives + free-text input) ────────────────────────

interface AlterPlanPickerProps {
  entry: TimelineEntry
  flow: FlowEngine
  prefilledText: string
  onClose: () => void
}

function AlterPlanPicker({ entry, flow, prefilledText, onClose }: AlterPlanPickerProps) {
  const [mode, setMode] = useState<'menu' | 'custom'>('menu')
  const [text, setText] = useState(prefilledText)

  const alternatives = entry.alternatives ?? []
  const isDismissed = entry.state === 'self-managed' || entry.state === 'custom-pending'

  const handleEnrich = (alt: AlternativeOption) => {
    flow.enrichEntry(entry.id, alt)
    onClose()
  }

  const handleSelf = () => {
    flow.dismissEntry(entry.id, 'self')
    onClose()
  }

  const handleCustom = () => {
    if (text.trim()) {
      flow.dismissEntry(entry.id, 'custom', text.trim())
      onClose()
    }
  }

  const handleRestore = () => {
    flow.restoreEntry(entry.id)
  }

  if (isDismissed || entry.enrichedWith) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <button
          onClick={handleRestore}
          className="w-full text-center text-[12px] font-medium text-on-dim hover:text-on-surface py-2 rounded-lg border border-border transition-colors"
        >
          ↩ Undo override — restore Jeevy's pick
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {mode === 'menu' && (
        <>
          {/* Context chip showing what's being changed */}
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-xl border border-border">
            <span className="text-[11px] text-on-dim">Changing:</span>
            <span className="text-[12px] font-semibold text-on-surface truncate">{prefilledText}</span>
          </div>

          {alternatives.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-on-dim text-[11px] mb-1">Jeevy's alternatives</p>
              {alternatives.map(alt => (
                <button
                  key={alt.id}
                  onClick={() => handleEnrich(alt)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-left transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden" style={{ background: alt.gradientFallback }}>
                    {alt.imageThumb && <img src={alt.imageThumb} alt={alt.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface text-[12px] font-semibold leading-tight">{alt.name}</p>
                    <p className="text-on-dim text-[10px] mt-0.5 line-clamp-1">{alt.tagline}</p>
                    {(alt.details as Record<string, string> | undefined)?.['rating'] && (
                      <span className="text-amber-400 text-[10px]">{(alt.details as Record<string, string>)['rating']}</span>
                    )}
                  </div>
                  <span className="text-on-dim/40 text-[16px] group-hover:text-accent transition-colors shrink-0">›</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSelf}
              className="flex-1 text-[11px] font-medium text-on-dim bg-surface-2 hover:bg-surface-3 px-3 py-1.5 rounded-lg border border-border transition-colors"
            >
              ✋ Handle myself
            </button>
            <button
              onClick={() => setMode('custom')}
              className="flex-1 text-[11px] font-medium text-on-dim bg-surface-2 hover:bg-surface-3 px-3 py-1.5 rounded-lg border border-border transition-colors"
            >
              ✎ Describe preference
            </button>
          </div>
        </>
      )}

      {mode === 'custom' && (
        <div className="space-y-2">
          <p className="text-on-dim text-[11px] font-mono uppercase tracking-wide">Describe your preference</p>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCustom() }}
            placeholder="e.g. vegetarian option, or different venue…"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-on-surface text-[12px] placeholder:text-on-dim/40 outline-none focus:border-accent transition-colors"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCustom}
              disabled={!text.trim()}
              className="flex-1 bg-accent text-white text-[12px] font-semibold py-1.5 rounded-lg disabled:opacity-40 transition-opacity"
            >
              Apply →
            </button>
            <button
              onClick={() => { setText(prefilledText); setMode('menu') }}
              className="px-3 text-on-dim text-[12px] hover:text-on-surface transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main sheet ────────────────────────────────────────────────────────────────

interface Props {
  entry: TimelineEntry | null
  flow: FlowEngine
  onClose: () => void
  onRemove: (id: string, title: string) => void
}

export function CardDetailSheet({ entry, flow, onClose, onRemove }: Props) {
  const controls = useDragControls()
  const isDesktop = useIsDesktop()
  const [showAlterPlan, setShowAlterPlan] = useState(false)

  // Reset alter plan panel when sheet closes/changes
  useEffect(() => {
    if (!entry) setShowAlterPlan(false)
  }, [entry?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    if (!entry) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [entry, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (entry) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [entry])

  const title = entry ? (entry.enrichedWith?.name ?? entryTitle(entry)) : ''
  const time = entry ? formatTime(entry.scheduledAt) : ''
  const categoryLabel = entry ? (CATEGORY_LABELS[entry.type] ?? '') : ''
  const displayHero = entry
    ? (entry.enrichedWith?.imageHero ?? entry.enrichedWith?.imageThumb ?? entry.imageHero ?? entry.imageThumb)
    : null
  const displayGradient = entry ? (entry.enrichedWith?.gradientFallback ?? entry.gradientFallback) : ''

  const canChangeEntry = entry && !flow.confirmingAll && !flow.allConfirmed
  const swapScreen = entry ? SCREEN_FOR_ENTRY[entry.id] : undefined

  const handleChangeItem = () => {
    if (!entry) return
    if (swapScreen) {
      flow.startEditScreen(swapScreen)
      onClose()
    } else {
      setShowAlterPlan(v => !v)
    }
  }

  const handleRemove = () => {
    if (!entry) return
    onRemove(entry.id, title)
    onClose()
  }

  const mobileVariants = {
    initial: { y: '100%', opacity: 1 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 1 },
  }
  const desktopVariants = {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.96, opacity: 0 },
  }
  const variants = isDesktop ? desktopVariants : mobileVariants

  return (
    <AnimatePresence>
      {entry && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            {...(!isDesktop ? {
              drag: 'y' as const,
              dragControls: controls,
              dragConstraints: { top: 0, bottom: 0 },
              dragElastic: { top: 0, bottom: 0.4 },
              onDragEnd: (_: unknown, info: { offset: { y: number } }) => {
                if (info.offset.y > 80) onClose()
              },
            } : {})}
            className={[
              'fixed z-50 bg-surface-0 border border-border flex flex-col overflow-hidden',
              'bottom-0 left-0 right-0 rounded-t-3xl',
              'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:right-auto',
              'md:w-[680px] md:rounded-3xl md:shadow-2xl',
            ].join(' ')}
            style={{ maxHeight: isDesktop ? '85vh' : '92vh' }}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: isDesktop ? 0.26 : 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 md:hidden pointer-events-none">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header — title, category badge, close */}
            <div className="flex items-start justify-between px-4 pt-3 pb-2 md:pt-4 shrink-0">
              <div className="flex-1 mr-3 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {categoryLabel && (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-accent/70 bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                      {categoryLabel}
                    </span>
                  )}
                  {time && (
                    <span className="text-[11px] font-semibold text-on-dim bg-surface-2 border border-border px-2 py-0.5 rounded-full shrink-0">
                      {time}
                    </span>
                  )}
                </div>
                <h2 className="text-on-surface font-bold text-[17px] leading-tight line-clamp-2">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-3 hover:bg-surface-2 flex items-center justify-center text-on-dim hover:text-on-surface transition-colors shrink-0 mt-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Venue info strip (rating, address, links) */}
            <VenueInfoStrip entry={entry} />

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {/* Hero image — 160px fixed height per spec */}
              {(displayHero || displayGradient) && (
                <div className="relative mx-4 mb-3 rounded-xl overflow-hidden shrink-0 h-40">
                  <ImageSlot
                    src={displayHero}
                    alt={title}
                    gradient={displayGradient}
                    className="w-full h-full"
                  />
                  {/* Image bottom scrim */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)' }}
                  />
                </div>
              )}

              {/* Mini-map (venue location) */}
              <VenueMiniMap entry={entry} />

              {/* Alter Plan section (toggled by "Change this item") */}
              <AnimatePresence>
                {showAlterPlan && (
                  <motion.div
                    className="mx-4 mb-3 p-3 bg-surface-1 rounded-xl border border-border"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlterPlanPicker
                      entry={entry}
                      flow={flow}
                      prefilledText={title}
                      onClose={() => { setShowAlterPlan(false); onClose() }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Entry detail content */}
              <TimelineEntryExpanded
                entry={entry}
                onCollapse={onClose}
                onPartyChange={size => flow.setPartySize(entry.id, size)}
              />
            </div>

            {/* Action buttons — always visible at bottom */}
            {canChangeEntry && (
              <div className="shrink-0 px-4 pt-3 pb-4 border-t border-border bg-surface-0 space-y-2">
                {/* Primary: Change this item */}
                <button
                  onClick={handleChangeItem}
                  className={`w-full flex items-center justify-center gap-2 min-h-[44px] font-semibold text-[14px] rounded-xl transition-colors ${
                    showAlterPlan
                      ? 'bg-accent/10 border border-accent/40 text-accent'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                >
                  <span>✏️</span>
                  <span>Change this item</span>
                </button>
                {/* Secondary: Remove from plan */}
                <button
                  onClick={handleRemove}
                  className="w-full flex items-center justify-center gap-2 min-h-[44px] font-medium text-[13px] text-on-dim hover:text-warning border border-border hover:border-warning/30 rounded-xl transition-colors"
                >
                  <span>🗑</span>
                  <span>Remove from plan</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
