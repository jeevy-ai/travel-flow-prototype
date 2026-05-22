interface Props {
  confirmedCount: number
  totalCount: number
  tripTitle?: string
  tripPrice?: string
  activeTab?: 'chat' | 'itinerary'
  onTabChange?: (tab: 'chat' | 'itinerary') => void
}

export function AppHeader({ confirmedCount, totalCount, tripTitle = 'Web Summit 2026', tripPrice = '$7,058 est.' }: Props) {
  return (
    <header className="h-[52px] flex items-center justify-between px-4 border-b border-border bg-surface-0 sticky top-0 z-20 shrink-0 gap-3">
      {/* Left: logo + trip title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-accent text-[16px] font-bold tracking-tight shrink-0">jeevy</span>
        <span className="text-border text-[14px] shrink-0">·</span>
        <span className="text-on-surface text-[13px] font-semibold truncate">{tripTitle}</span>
      </div>

      {/* Right: price + confirmed count */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-on-dim text-[12px] font-mono hidden sm:block">{tripPrice}</span>
        <span className="text-on-dim text-[11px] font-mono">{confirmedCount}/{totalCount}</span>
      </div>
    </header>
  )
}
