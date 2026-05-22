import type { TimelineEntry } from '../../hooks/useFlowEngine'
import { ImageSlot } from './ImageSlot'
import { StatusBadge } from './StatusBadge'

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
    case 'reminders': return 'Reminders'
    default: return entry.ghostHeadline
  }
}

interface Props {
  entry: TimelineEntry
  expanded: boolean
  onToggle: () => void
}

export function TimelineEntryCollapsed({ entry, expanded, onToggle }: Props) {
  const hasConflict = entry.id === 'WS2026-K08' && Boolean(entry.data['conflictDetected'])

  return (
    <div
      className="rounded-xl overflow-hidden border border-border bg-surface-1 cursor-pointer"
      onClick={onToggle}
    >
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        <ImageSlot
          src={entry.imageThumb}
          alt={`${entry.type} ${entry.id}`}
          gradient={entry.gradientFallback}
          className="w-full h-full"
        />
        {entry.state !== 'ghost' && (
          <div className="absolute bottom-2 left-2">
            <StatusBadge state={entry.state} />
          </div>
        )}
        {hasConflict && (
          <div className="absolute top-2 right-2">
            <span className="bg-warning/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-md">
              ⚠ Conflict
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="text-lg shrink-0">{ENTRY_ICONS[entry.type]}</span>
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
    </div>
  )
}
