import { motion } from 'framer-motion'

interface Props {
  chatScreen: number
  confirmedCount: number
  totalCount: number
}

const STEP_LABELS = ['Trip', 'Flights', 'Hotel', 'Sessions', 'Dining', 'Reminders', 'Done']

export function StepProgress({ chatScreen, confirmedCount, totalCount }: Props) {
  const currentStep = Math.min(chatScreen - 1, STEP_LABELS.length - 1)
  const progressPct = totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-on-dim text-[11px] font-medium uppercase tracking-wide">
          {currentStep < STEP_LABELS.length - 1
            ? `Step ${currentStep + 1} of ${STEP_LABELS.length - 1} — ${STEP_LABELS[currentStep]}`
            : 'All set ✓'}
        </span>
        <span className="text-on-dim text-[11px] font-mono">
          {confirmedCount}/{totalCount}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {STEP_LABELS.map((_, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          return (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: isActive ? 20 : 8,
                height: 8,
                background: isDone
                  ? 'var(--color-accent)'
                  : isActive
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
                opacity: isActive ? 1 : isDone ? 0.9 : 0.4,
              }}
              animate={{ width: isActive ? 20 : 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            />
          )
        })}

        {/* Thin progress bar below dots */}
        <div className="flex-1 ml-2 h-[3px] rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  )
}
