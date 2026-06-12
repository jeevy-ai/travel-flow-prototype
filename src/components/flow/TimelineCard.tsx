import { motion } from 'framer-motion'
import type { TimelineEntry, FlowEngine, EntryType } from '../../hooks/useFlowEngine'
import { ImageSlot } from '../timeline/ImageSlot'

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    case 'ride': {
      const from = String(entry.data['from'] ?? '').split('(')[0].split(',')[0].trim()
      const to = String(entry.data['to'] ?? '').split('(')[0].split(',')[0].trim()
      return `${from} → ${to}`
    }
    default: return entry.ghostHeadline
  }
}

function entrySubtitle(entry: TimelineEntry): string {
  const d = entry.data
  switch (entry.type) {
    case 'hotel': return `${String(d['chain'] ?? 'Marriott Bonvoy')} · ${String(d['slot'] ?? '')}`
    case 'restaurant': return [String(d['cuisine'] ?? ''), String(d['distanceFromHotel'] ?? '').split(' · ')[0]].filter(Boolean).join(' · ')
    case 'activity': return [String(d['type'] ?? ''), String(d['duration'] ?? '')].filter(Boolean).join(' · ')
    case 'conference_session': return `${String(d['room'] ?? '')} · Web Summit`
    case 'conference_venue': return 'Parque das Nações, Lisbon'
    case 'flight_outbound':
    case 'flight_return': return `${String(d['duration'] ?? '')} · ${String(d['fare'] ?? '')}`
    case 'reminders': return 'Pack & check-in reminders'
    default: return entry.tagline
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return ''
  const match = iso.match(/T(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}

// Atmospheric types get the 160px full-bleed image card.
// Logistical (flights, reminders) get a compact card without image.
const ATMOSPHERIC: Set<EntryType> = new Set(['hotel', 'restaurant', 'activity', 'conference_session', 'conference_venue'])

const CATEGORY_ICONS: Partial<Record<EntryType, string>> = {
  flight_outbound: '✈',
  flight_return: '✈',
  hotel: '🏨',
  conference_venue: '🎙',
  conference_session: '📋',
  reminders: '🔔',
  restaurant: '🍽',
  activity: '🌟',
  ride: '🚗',
}

// ── Status chip ───────────────────────────────────────────────────────────────

function StatusChip({ entry }: { entry: TimelineEntry }) {
  switch (entry.state) {
    case 'proposed':
      return <span className="text-[10px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">Jeevy's pick ❆</span>
    case 'confirmed':
      return entry.enrichedWith
        ? <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">✦ Enriched by Jeevy</span>
        : <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full whitespace-nowrap">✓ Confirmed</span>
    case 'calendar-synced':
      return <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full whitespace-nowrap">✓ Synced</span>
    case 'self-managed':
      return <span className="text-[10px] font-semibold text-on-dim bg-surface-3 px-2 py-0.5 rounded-full whitespace-nowrap">✋ Self-managed</span>
    case 'custom-pending':
      return (
        <span className="text-[10px] font-semibold text-[#c084fc] bg-[#c084fc]/10 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[160px] truncate"
          title={entry.customOverrideText}>
          ✎ {entry.customOverrideText || 'Custom option'}
        </span>
      )
    default:
      return null
  }
}

// ── Ghost card variant ────────────────────────────────────────────────────────

function GhostVariant({ entry }: { entry: TimelineEntry }) {
  return (
    <motion.div
      animate={{ opacity: [0.45, 0.7, 0.45] }}
      transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
      className="rounded-2xl overflow-hidden border-2 border-dashed border-emerald-500/40 bg-surface-1"
    >
      <div className="h-40 bg-muted/30 flex flex-col items-center justify-center gap-2">
        <span className="text-3xl opacity-50">{CATEGORY_ICONS[entry.type] ?? '📍'}</span>
        <p className="text-on-dim text-[13px] font-medium text-center px-4">{entry.ghostHeadline}</p>
        <p className="text-on-dim/60 text-[11px] text-center px-6">{entry.ghostSubtext}</p>
      </div>
    </motion.div>
  )
}

// ── Atmospheric card — full-bleed 160px image ─────────────────────────────────

interface TimelineCardProps {
  entry: TimelineEntry
  flow: FlowEngine
  staggerIndex: number
  onOpen: (id: string) => void
}

function AtmosphericCard({ entry, flow, staggerIndex, onOpen }: TimelineCardProps) {
  const isDismissed = entry.state === 'self-managed' || entry.state === 'custom-pending'
  const isConfirmed = entry.state === 'confirmed' || entry.state === 'calendar-synced'
  const hasConflict = entry.id === 'WS2026-K08' && Boolean(entry.data['conflictDetected']) && !flow.conflictResolved

  const displayThumb = entry.enrichedWith?.imageThumb ?? entry.imageThumb
  const displayGradient = entry.enrichedWith?.gradientFallback ?? entry.gradientFallback
  const title = entry.enrichedWith?.name ?? entryTitle(entry)
  const subtitle = entrySubtitle(entry)
  const time = formatTime(entry.scheduledAt)

  const borderClass = isDismissed ? 'border-border opacity-60'
    : isConfirmed ? 'border-success/30'
    : hasConflict ? 'border-warning/50'
    : 'border-border'

  return (
    <motion.div
      data-entry-id={entry.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1], delay: staggerIndex * 0.05 }}
    >
      {/* Full card is tappable — image + text area = single tap target */}
      <button
        className={`w-full text-left rounded-2xl overflow-hidden border bg-surface-1 flex flex-col transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${borderClass}`}
        onClick={() => !isDismissed && onOpen(entry.id)}
        aria-label={`View details for ${title}`}
      >
        {/* Full-bleed 160px image with time chip overlay */}
        <div className="relative h-40 overflow-hidden w-full">
          <div className={`w-full h-full ${isDismissed ? 'grayscale opacity-60' : ''}`}>
            <ImageSlot src={displayThumb} alt={title} gradient={displayGradient} className="w-full h-full" />
          </div>
          {/* Bottom scrim */}
          <div
            className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
          />
          {/* Time chip */}
          {time && (
            <div className="absolute bottom-2.5 right-2.5 bg-black/40 backdrop-blur-sm rounded-md px-2 py-0.5">
              <span className="text-white text-[12px] font-semibold">{time}</span>
            </div>
          )}
          {/* Conflict badge */}
          {hasConflict && (
            <div className="absolute top-2 left-2" onClick={e => { e.stopPropagation(); flow.startEditScreen(5) }}>
              <span className="bg-warning/90 text-black text-[10px] font-bold px-2 py-1 rounded-md">
                ⚠ Conflict — Resolve →
              </span>
            </div>
          )}
          {/* Chevron — tappability signifier */}
          {!isDismissed && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center pointer-events-none">
              <span className="text-white text-[12px] leading-none">›</span>
            </div>
          )}
        </div>

        {/* Meta below image */}
        <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1">
          <p className={`font-semibold text-[14px] leading-tight ${isDismissed ? 'text-on-dim line-through' : 'text-on-surface'}`}>
            {title}
          </p>
          {subtitle && (
            <p className="text-on-dim text-[11px] leading-snug">{subtitle}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            <StatusChip entry={entry} />
          </div>
        </div>
      </button>
    </motion.div>
  )
}

// ── Compact card — flights + reminders (no image area) ────────────────────────

const PROVIDER_CONFIG: Partial<Record<EntryType, { bg: string; label?: string; emoji?: string }>> = {
  reminders:          { bg: '#38A169', emoji: '🔔' },
  flight_outbound:    { bg: 'var(--accent)', emoji: '✈' },
  flight_return:      { bg: 'var(--accent)', emoji: '✈' },
}

function CompactCard({ entry, flow: _flow, staggerIndex, onOpen }: TimelineCardProps) {
  const isDismissed = entry.state === 'self-managed' || entry.state === 'custom-pending'
  const isConfirmed = entry.state === 'confirmed' || entry.state === 'calendar-synced'

  const title = entry.enrichedWith?.name ?? entryTitle(entry)
  const subtitle = entrySubtitle(entry)
  const time = formatTime(entry.scheduledAt)
  const cfg = PROVIDER_CONFIG[entry.type]

  const borderClass = isDismissed ? 'border-border opacity-60'
    : isConfirmed ? 'border-success/30'
    : 'border-border'

  return (
    <motion.div
      data-entry-id={entry.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1], delay: staggerIndex * 0.05 }}
    >
      <div className={`rounded-xl overflow-hidden border bg-surface-1 flex flex-col transition-colors duration-300 ${borderClass}`}>
        {/* Full row is the tap target — min 44px height satisfied by py-3 on 14px font ≥44px */}
        <button
          className="flex items-center gap-3 px-3 py-3 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
          onClick={() => !isDismissed && onOpen(entry.id)}
          aria-label={`View details for ${title}`}
        >
          {/* Provider badge */}
          {cfg && (
            <div
              className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
              style={{ background: cfg.bg }}
            >
              {cfg.label
                ? <span className="text-[9px] font-black text-white tracking-tight">{cfg.label}</span>
                : <span className="text-[16px]">{cfg.emoji}</span>
              }
            </div>
          )}

          {/* Title + subtitle */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-[13px] leading-tight line-clamp-1 ${isDismissed ? 'text-on-dim line-through' : 'text-on-surface'}`}>
              {title}
            </p>
            {subtitle && (
              <p className="text-on-dim text-[11px] mt-0.5 line-clamp-1">{subtitle}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              <StatusChip entry={entry} />
            </div>
          </div>

          {/* Time + chevron */}
          <div className="flex flex-col items-end shrink-0 gap-1">
            {time && <span className="text-on-surface text-[12px] font-semibold">{time}</span>}
            {!isDismissed && <span className="text-on-dim text-[16px] leading-none">›</span>}
          </div>
        </button>
      </div>
    </motion.div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

export interface TimelineCardProps_ {
  entry: TimelineEntry
  flow: FlowEngine
  staggerIndex: number
  onOpen: (id: string) => void
}

export function TimelineCard({ entry, flow, staggerIndex, onOpen }: TimelineCardProps_) {
  if (entry.state === 'ghost') {
    return <GhostVariant entry={entry} />
  }

  if (ATMOSPHERIC.has(entry.type)) {
    return <AtmosphericCard entry={entry} flow={flow} staggerIndex={staggerIndex} onOpen={onOpen} />
  }

  return <CompactCard entry={entry} flow={flow} staggerIndex={staggerIndex} onOpen={onOpen} />
}
