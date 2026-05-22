interface Props {
  confirmedCount: number
  totalCount: number
  activeTab?: 'chat' | 'itinerary'
  onTabChange?: (tab: 'chat' | 'itinerary') => void
}

export function AppHeader({ confirmedCount, totalCount, activeTab, onTabChange }: Props) {
  return (
    <header className="h-[52px] flex items-center justify-between px-5 border-b border-border bg-surface-0 sticky top-0 z-20 shrink-0">
      <span className="text-accent text-lg font-bold tracking-tight">jeevy</span>

      {activeTab && onTabChange && (
        <div className="hidden md:flex lg:hidden gap-1 bg-surface-1 rounded-lg p-0.5">
          {(['chat', 'itinerary'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1 rounded-md text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-surface-0 text-on-surface'
                  : 'text-on-dim hover:text-on-surface'
              }`}
            >
              {tab === 'chat' ? 'Chat' : `Itinerary (${confirmedCount}/${totalCount})`}
            </button>
          ))}
        </div>
      )}

      <span className="text-on-dim text-xs font-mono">{confirmedCount}/{totalCount}</span>
    </header>
  )
}
