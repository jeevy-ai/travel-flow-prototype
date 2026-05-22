export function TimelineEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
      <div className="w-24 h-24 rounded-full bg-surface-1 border border-border flex items-center justify-center text-4xl opacity-40">
        🗺
      </div>
      <div>
        <p className="text-on-surface font-semibold text-[15px] mb-1">Your trip takes shape here.</p>
        <p className="text-on-dim text-[13px] leading-relaxed">
          Jeevy fills it in as you confirm each piece.
        </p>
      </div>
    </div>
  )
}
