interface Props {
  confirmedCount: number
  totalCount: number
  activeTab?: 'chat' | 'itinerary'
  onTabChange?: (tab: 'chat' | 'itinerary') => void
}

export function AppHeader({ confirmedCount, totalCount }: Props) {
  return (
    <header className="h-[52px] flex items-center justify-between px-5 border-b border-border bg-surface-0 sticky top-0 z-20 shrink-0">
      <span className="text-accent text-lg font-bold tracking-tight">jeevy</span>
      <span className="text-on-dim text-xs font-mono">{confirmedCount}/{totalCount} confirmed</span>
    </header>
  )
}
