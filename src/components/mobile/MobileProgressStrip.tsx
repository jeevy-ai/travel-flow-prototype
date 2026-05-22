interface Props {
  confirmedCount: number
  totalCount: number
  tripTitle: string
  onExpand: () => void
}

export function MobileProgressStrip({ confirmedCount, totalCount, tripTitle, onExpand }: Props) {
  return (
    <div
      className="h-12 bg-surface-1 border-t border-border flex items-center px-4 gap-3 cursor-pointer"
      onClick={onExpand}
    >
      <div className="flex-1 min-w-0">
        <p className="text-on-surface text-[13px] font-medium truncate">{tripTitle}</p>
        <p className="text-on-dim text-[11px]">{confirmedCount} of {totalCount} confirmed</p>
      </div>
      <span className="text-on-dim text-[18px]">›</span>
    </div>
  )
}
