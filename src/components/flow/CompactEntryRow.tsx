import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineEntry, FlowEngine } from '../../hooks/useFlowEngine'
import { ImageSlot } from '../timeline/ImageSlot'
import { TimelineEntryExpanded } from '../timeline/TimelineEntryExpanded'

const ENTRY_ICONS: Record<string, string> = {
  flight_outbound: '✈',
  flight_return: '✈',
  hotel: '🏨',
  conference_venue: '🎙',
  conference_session: '📋',
  reminders: '🔔',
}

function entryTitle(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'flight_outbound': return 'SFO → LIS · Outbound'
    case 'flight_return': return 'LIS → SFO · Return'
    case 'hotel': return 'Marriott Lisbon'
    case 'conference_venue': return 'Altice Arena'
    case 'conference_session': return String(entry.data['title'] ?? entry.ghostHeadline)
    case 'reminders': return 'Reminders & packing'
    default: return entry.ghostHeadline
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  // Parse time from ISO string respecting its timezone offset
  const match = iso.match(/T(\d{2}):(\d{2})/)
  if (!match) return '—'
  return `${match[1]}:${match[2]}`
}

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

function StatusChip({ state }: { state: TimelineEntry['state'] }) {
  switch (state) {
    case 'proposed':
      return (
        <span className="text-[10px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          Jeevy's pick ❆
        </span>
      )
    case 'confirmed':
      return (
        <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          ✓ Confirmed
        </span>
      )
    case 'calendar-synced':
      return (
        <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          ✓ Synced
        </span>
      )
    default:
      return null
  }
}

interface Props {
  entry: TimelineEntry
  flow: FlowEngine
  staggerIndex: number
}

export function CompactEntryRow({ entry, flow, staggerIndex }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isProposed = entry.state === 'proposed'
  const isConfirmed = entry.state === 'confirmed' || entry.state === 'calendar-synced'
  const hasConflict = entry.id === 'WS2026-K08' && Boolean(entry.data['conflictDetected']) && !flow.conflictResolved
  const swapScreen = SCREEN_FOR_ENTRY[entry.id]
  const time = formatTime(entry.scheduledAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: staggerIndex * 0.04 }}
    >
      <div
        className={`rounded-xl overflow-hidden border bg-surface-1 transition-colors duration-300 ${
          isConfirmed ? 'border-success/30' : hasConflict ? 'border-warning/50' : 'border-border'
        }`}
      >
        {/* Compact row — ~80px tall */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
          onClick={() => setExpanded(e => !e)}
        >
          {/* Time gutter */}
          <div className="w-11 shrink-0 text-right">
            <span className="text-on-dim text-[11px] font-mono leading-tight block">{time}</span>
            <span className="text-on-dim/50 text-[14px]">{ENTRY_ICONS[entry.type] ?? '📍'}</span>
          </div>

          {/* Thumbnail */}
          <div className="w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden">
            <ImageSlot
              src={entry.imageThumb}
              alt={entryTitle(entry)}
              gradient={entry.gradientFallback}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-on-surface font-semibold text-[13px] leading-tight line-clamp-2">
                {entryTitle(entry)}
              </p>
              {hasConflict && (
                <span className="text-warning text-[10px] font-bold shrink-0">⚠ Conflict</span>
              )}
            </div>
            <p className="text-on-dim text-[11px] mt-0.5 truncate">{entry.tagline}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusChip state={entry.state} />
              {isProposed && swapScreen && !flow.confirmingAll && !flow.allConfirmed && (
                <button
                  onClick={e => { e.stopPropagation(); flow.startEditScreen(swapScreen) }}
                  className="text-[10px] font-medium text-on-dim bg-surface-2 hover:bg-surface-3 px-2 py-0.5 rounded-full border border-border transition-colors"
                >
                  ⇄ Swap
                </button>
              )}
              {isConfirmed && swapScreen && (
                <button
                  onClick={e => { e.stopPropagation(); flow.startEditScreen(swapScreen) }}
                  className="text-[10px] font-medium text-on-dim bg-surface-2 hover:bg-surface-3 px-2 py-0.5 rounded-full border border-border transition-colors"
                >
                  ✏ Edit
                </button>
              )}
            </div>
          </div>

          {/* Expand chevron */}
          <span
            className="text-on-dim text-[18px] shrink-0 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ›
          </span>
        </div>

        {/* Expanded detail — full hero + accordion */}
        <AnimatePresence>
          {expanded && (
            <>
              {/* Full hero image only in expanded state */}
              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative" style={{ aspectRatio: '16/9' }}>
                  <ImageSlot
                    src={entry.imageHero ?? entry.imageThumb}
                    alt={entryTitle(entry)}
                    gradient={entry.gradientFallback}
                    className="w-full h-full"
                  />
                  {hasConflict && !flow.conflictResolved && (
                    <div className="absolute top-2 left-2">
                      <button
                        onClick={() => flow.startEditScreen(5)}
                        className="bg-warning/90 text-black text-[10px] font-bold px-2 py-1 rounded-md"
                      >
                        ⚠ Schedule conflict — Resolve →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
              <TimelineEntryExpanded
                entry={entry}
                onCollapse={() => setExpanded(false)}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
