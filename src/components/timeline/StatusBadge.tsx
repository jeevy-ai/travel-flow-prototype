import type { EntryState } from '../../hooks/useFlowEngine'

interface Props { state: EntryState }

export function StatusBadge({ state }: Props) {
  if (state === 'ghost') return null

  const configs: Record<Exclude<EntryState, 'ghost'>, { label: string; className: string }> = {
    proposed: { label: "Jeevy's pick ✦", className: 'bg-accent/15 text-accent font-semibold' },
    confirmed: { label: '✓ Confirmed', className: 'bg-success/20 text-success' },
    'calendar-synced': { label: '✓ Synced 📅', className: 'bg-success/20 text-success' },
    'day-of-active': { label: '▶ Active', className: 'bg-accent/20 text-accent' },
  }

  const cfg = configs[state]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
