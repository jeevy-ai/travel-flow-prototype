import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { TimelineEntry as TEntry, FlowEngine } from '../../hooks/useFlowEngine'
import { GhostCard } from './GhostCard'
import { TimelineEntryCollapsed } from './TimelineEntryCollapsed'
import { TimelineEntryExpanded } from './TimelineEntryExpanded'
import { ConfirmationPulse } from './ConfirmationPulse'

interface Props {
  entry: TEntry
  flow: FlowEngine
  staggerIndex: number
  isExpanded: boolean
}

export function TimelineEntry({ entry, flow, staggerIndex, isExpanded }: Props) {
  const shouldReduceMotion = useReducedMotion()
  const prevStateRef = useRef(entry.state)
  const [showPulse, setShowPulse] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prevStateRef.current !== 'confirmed' && entry.state === 'confirmed') {
      setShowPulse(true)
      const t = setTimeout(() => setShowPulse(false), 500)
      prevStateRef.current = entry.state
      return () => clearTimeout(t)
    }
    prevStateRef.current = entry.state
  }, [entry.state])

  useEffect(() => {
    if (entry.state === 'confirmed' && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [entry.state])

  const isDayOfActive = flow.dayOfActiveId === entry.id
  const entranceDelay = shouldReduceMotion ? 0 : staggerIndex * 0.06

  return (
    <motion.div
      ref={ref}
      initial={{ y: shouldReduceMotion ? 0 : 20, opacity: 0 }}
      animate={{ y: 0, opacity: entry.state === 'ghost' ? 0.85 : 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1], delay: entranceDelay }}
    >
      {entry.state === 'ghost' ? (
        <GhostCard entry={entry} onLetJeevyArrange={() => flow.proposeEntry(entry.id)} />
      ) : (
        <div
          className={`relative ${isDayOfActive ? 'border-l-2 border-accent rounded-xl overflow-hidden' : ''}`}
        >
          {showPulse && <ConfirmationPulse />}
          <TimelineEntryCollapsed
            entry={entry}
            expanded={isExpanded}
            onToggle={() => flow.setExpandedEntryId(isExpanded ? null : entry.id)}
          />
          <AnimatePresence>
            {isExpanded && (
              <TimelineEntryExpanded
                entry={entry}
                onCollapse={() => flow.setExpandedEntryId(null)}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
