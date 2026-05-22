interface Props { label: string }

export function PrefBadge({ label }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2 text-success text-[11px] font-medium border border-border">
      {label}
    </span>
  )
}
