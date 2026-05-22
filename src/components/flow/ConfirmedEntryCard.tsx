import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineEntry, FlowEngine } from '../../hooks/useFlowEngine'
import { ImageSlot } from '../timeline/ImageSlot'
import { StatusBadge } from '../timeline/StatusBadge'
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
    case 'flight_outbound': return 'Outbound · SFO → LIS'
    case 'flight_return': return 'Return · LIS → SFO'
    case 'hotel': return 'Marriott Lisbon'
    case 'conference_venue': return 'Altice Arena'
    case 'conference_session': return String(entry.data['title'] ?? entry.ghostHeadline)
    case 'reminders': return 'Reminders & packing'
    default: return entry.ghostHeadline
  }
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

interface Props {
  entry: TimelineEntry
  flow: FlowEngine
  staggerIndex: number
}

export function ConfirmedEntryCard({ entry, flow, staggerIndex }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasConflict = entry.id === 'WS2026-K08' && Boolean(entry.data['conflictDetected'])
  const editScreen = SCREEN_FOR_ENTRY[entry.id]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1], delay: staggerIndex * 0.04 }}
    >
      <div className="rounded-2xl overflow-hidden border border-border bg-surface-1">
        {/* Image with status + conflict overlays */}
        <div className="relative" style={{ aspectRatio: '16/9' }}>
          <ImageSlot
            src={entry.imageThumb}
            alt={entryTitle(entry)}
            gradient={entry.gradientFallback}
            className="w-full h-full"
          />
          <div className="absolute bottom-2 left-2">
            <StatusBadge state={entry.state} />
          </div>
          {hasConflict && (
            <div className="absolute top-2 left-2">
              <span className="bg-success/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-md">
                ✓ Conflict resolved
              </span>
            </div>
          )}
          {/* Edit button */}
          {editScreen && (
            <button
              onClick={() => flow.startEditScreen(editScreen)}
              className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 hover:bg-black/70 text-white text-[11px] font-medium px-2 py-1 rounded-lg transition-colors backdrop-blur-sm"
              aria-label={`Edit ${entryTitle(entry)}`}
            >
              <span>✏</span>
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Title row */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
          onClick={() => setExpanded(e => !e)}
        >
          <span className="text-lg shrink-0">{ENTRY_ICONS[entry.type] ?? '📍'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-on-surface font-bold text-[14px] leading-tight truncate">
              {entryTitle(entry)}
            </p>
            <p className="text-on-dim text-[12px] truncate">{entry.tagline}</p>
          </div>
          <span
            className="text-on-dim text-lg shrink-0 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ›
          </span>
        </div>

        {/* Expandable detail panel */}
        <AnimatePresence>
          {expanded && (
            <TimelineEntryExpanded
              entry={entry}
              onCollapse={() => setExpanded(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
