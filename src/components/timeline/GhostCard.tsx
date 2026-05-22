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
      style={{ border: '1.5px dashed #D4C9BC', background: '#FAF9F7', opacity: 0.85 }}
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
          <span className="text-4xl" style={{ color: '#4A5568' }}>
            {ENTRY_ICONS[entry.type] ?? '📍'}
          </span>
          <p className="text-[#2D3748] font-semibold text-[14px] text-center px-4">
            {entry.ghostHeadline}
          </p>
          <p className="text-[#718096] text-[12px] text-center px-6">
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
          style={{ borderColor: '#D4C9BC', color: '#4A5568' }}
        >
          Add manually
        </button>
      </div>
    </div>
  )
}
