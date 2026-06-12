import type { TimelineEntry } from '../../hooks/useFlowEngine'
import { ImageSlot } from './ImageSlot'

const ENTRY_ICONS: Record<string, string> = {
  flight_outbound: '✈',
  flight_return: '✈',
  hotel: '🏨',
  conference_venue: '🎙',
  conference_session: '📋',
  reminders: '🔔',
}

interface Props {
  entry: TimelineEntry
  onLetJeevyArrange: () => void
}

export function GhostCard({ entry, onLetJeevyArrange }: Props) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1.5px dashed var(--border)', background: 'var(--bg-secondary)', opacity: 0.85 }}
    >
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        <ImageSlot
          src={entry.imageThumb ?? '/fixture-images/city-lisbon.webp'}
          alt={`${entry.type} placeholder`}
          gradient={entry.gradientFallback}
          className="w-full h-full"
          overlay
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          <span className="text-4xl" style={{ color: 'var(--text-secondary)' }}>
            {ENTRY_ICONS[entry.type] ?? '📍'}
          </span>
          <p className="text-text-primary font-semibold text-[14px] text-center px-4">
            {entry.ghostHeadline}
          </p>
          <p className="text-text-secondary text-[12px] text-center px-6">
            {entry.ghostSubtext}
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-3">
        <button
          onClick={onLetJeevyArrange}
          className="flex-1 bg-accent text-white text-[13px] font-semibold py-2 rounded-lg hover:bg-accent/90 transition-colors"
        >
          Let Jeevy arrange
        </button>
        <button
          className="flex-1 text-[13px] font-medium py-2 rounded-lg border transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Add manually
        </button>
      </div>
    </div>
  )
}
