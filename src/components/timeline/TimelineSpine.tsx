import type { FlowEngine } from '../../hooks/useFlowEngine'
import { TimelineEntry } from './TimelineEntry'

interface Props { flow: FlowEngine }

export function TimelineSpine({ flow }: Props) {
  const allConfirmed = flow.entries.every(e => e.state === 'confirmed' || e.state === 'calendar-synced')

  return (
    <div className="flex-1 overflow-y-auto bg-surface-0">
      <div className="relative px-4 py-6">
        {/* Vertical spine line */}
        <div className="absolute left-[28px] top-0 bottom-0 w-[2px] bg-border" />

        <div className="space-y-4 pl-8">
          {flow.entries.map((entry, i) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              flow={flow}
              staggerIndex={i}
              isExpanded={flow.expandedEntryId === entry.id}
            />
          ))}
        </div>

        {allConfirmed && (
          <div className="mt-8 pl-8">
            <a
              href="#/itinerary/ws2026/day-of"
              className="block w-full text-center bg-accent text-white font-semibold text-[14px] py-3 rounded-xl hover:bg-accent/90 transition-colors"
            >
              Day-of plan →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
