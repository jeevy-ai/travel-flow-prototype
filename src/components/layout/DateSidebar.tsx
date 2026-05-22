interface DayItem {
  dateKey: string
  shortLabel: string
  dotLabel: string
  entryCount: number
}

interface Props {
  days: DayItem[]
  activeDateKey: string
  onSelect: (key: string) => void
  variant: 'vertical' | 'horizontal'
}

const SHORT_LABELS: Record<string, { top: string; bot: string }> = {
  '2026-11-09': { top: 'SUN', bot: '9' },
  '2026-11-10': { top: 'MON', bot: '10' },
  '2026-11-11': { top: 'TUE', bot: '11' },
  '2026-11-12': { top: 'WED', bot: '12' },
  'before-trip': { top: 'PRE', bot: '—' },
}

export function DateSidebar({ days, activeDateKey, onSelect, variant }: Props) {
  if (variant === 'horizontal') {
    return (
      <div className="flex gap-2 overflow-x-auto py-2 px-4 scrollbar-hide border-b border-border bg-surface-0/95 backdrop-blur-sm">
        {days.map(day => {
          const lbl = SHORT_LABELS[day.dateKey] ?? { top: '?', bot: '?' }
          const active = day.dateKey === activeDateKey
          return (
            <button
              key={day.dateKey}
              onClick={() => onSelect(day.dateKey)}
              className={`shrink-0 flex flex-col items-center px-3 py-1.5 rounded-lg border transition-all ${
                active
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface-1 text-on-dim border-border hover:border-accent/40'
              }`}
            >
              <span className={`text-[9px] font-bold tracking-widest ${active ? 'text-white/70' : 'text-on-dim/60'}`}>
                {lbl.top}
              </span>
              <span className={`text-[16px] font-bold leading-tight ${active ? 'text-white' : 'text-on-surface'}`}>
                {lbl.bot}
              </span>
              <span className={`text-[9px] mt-0.5 ${active ? 'text-white/60' : 'text-on-dim/50'}`}>
                {day.entryCount} items
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  // Vertical sidebar for desktop
  return (
    <div className="flex flex-col items-center py-4 gap-1 w-full">
      <span className="text-on-dim/40 text-[9px] font-bold tracking-widest uppercase mb-2">NOV</span>
      {days.map((day, idx) => {
        const lbl = SHORT_LABELS[day.dateKey] ?? { top: '?', bot: '?' }
        const active = day.dateKey === activeDateKey
        return (
          <div key={day.dateKey} className="flex flex-col items-center w-full">
            {idx > 0 && (
              <div className="w-px h-3 bg-border/40 mx-auto my-0.5" />
            )}
            <button
              onClick={() => onSelect(day.dateKey)}
              className={`flex flex-col items-center w-10 py-1.5 rounded-lg transition-all ${
                active ? 'bg-accent/15 text-accent' : 'text-on-dim hover:text-on-surface'
              }`}
            >
              <span className={`text-[8px] font-bold tracking-widest ${active ? 'text-accent/70' : 'text-on-dim/50'}`}>
                {lbl.top}
              </span>
              <span className={`text-[17px] font-bold leading-tight ${active ? 'text-accent' : 'text-on-surface'}`}>
                {lbl.bot}
              </span>
              <span
                className={`w-1 h-1 rounded-full mt-1 ${active ? 'bg-accent' : 'bg-on-dim/30'}`}
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}
