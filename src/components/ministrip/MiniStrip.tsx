import { motion, AnimatePresence } from 'framer-motion'
import type { FlowState } from '../../hooks/useFlowState'
import { stagger } from '../../tokens/motion'

interface Props { flow: FlowState }

interface StripItem {
  key: string
  icon?: string
  icons?: string[]
  label: string
  accent?: boolean
}

export function MiniStrip({ flow }: Props) {
  const sessionCount = flow.selectedSessions.size
  const hasFlights = flow.hasEnrichment(0)
  const hasHotel = flow.hasEnrichment(1)
  const hasSessions = flow.hasEnrichment(2)
  const hasRestaurants = flow.hasEnrichment(3)
  const hasPacking = flow.hasEnrichment(4)

  const visibleItems: StripItem[] = [
    hasFlights     && { icon: '✈', label: 'Flights booked', key: 'flights' },
    hasHotel       && { icon: '🏨', label: 'Hotel booked', key: 'hotel' },
    hasSessions    && { icon: '📋', label: `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`, key: 'sessions', accent: true },
    hasRestaurants && { icons: ['🍱', '🍽'], label: '2 dinners', key: 'restaurants' },
    hasPacking     && { icon: '📦', label: 'Packing ready', key: 'packing' },
  ].filter(Boolean) as StripItem[]

  if (visibleItems.length === 0) return null

  return (
    <motion.div
      className="px-4 py-3 border-t border-border bg-surface-1"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
    >
      <p className="text-[10px] text-on-dim uppercase tracking-wider font-medium mb-2">Building your itinerary</p>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {visibleItems.map((item, i) => (
            <motion.div
              key={item.key}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                item.accent
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-surface-2 border-border text-on-surface'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: stagger(i, 60) }}
            >
              {item.icons ? (
                <>
                  <motion.span
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0 }}
                  >{item.icons[0]}</motion.span>
                  <motion.span
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.12 }}
                  >{item.icons[1]}</motion.span>
                </>
              ) : (
                <span>{item.icon}</span>
              )}
              <span>{item.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
