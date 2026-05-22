import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { FlowEngine } from '../../hooks/useFlowEngine'
import { VerbTag } from '../shared/VerbTag'
import { dur, ease } from '../../tokens/motion'

interface Props { flow: FlowEngine }

export function Screen5Restaurants({ flow }: Props) {
  const [resolved, setResolved] = useState(false)
  const conflict = flow.data.conflictEvent
  const k08 = flow.data.sessions.find(s => s.sessionId === 'WS2026-K08')!
  const outcome = k08.conflictResolutionOutcome

  const handleResolve = () => {
    setResolved(true)
    flow.resolveConflict()
  }

  return (
    <div className="flex flex-col bg-surface-0">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <VerbTag verb="schedule_event" />
          <h1 className="text-on-surface text-[18px] font-bold mt-0.5">Resolve conflict</h1>
        </div>
        <p className="text-on-dim text-[12px]">5 of 7</p>
      </div>

      <div className="px-5 pb-4 flex flex-col gap-4">
        <motion.div
          className="bg-warning/10 border border-warning/30 rounded-2xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.md, ease: ease.out }}
        >
          <p className="text-warning font-semibold text-[13px] mb-1">⚠ Calendar conflict detected</p>
          <p className="text-on-dim text-[12px] leading-relaxed">
            The closing keynote (K08) on Nov 11 at 15:30 WET overlaps with your existing{' '}
            <span className="text-on-surface font-medium">{conflict.title}</span> call.
          </p>
        </motion.div>

        <motion.div
          className="bg-surface-1 rounded-2xl border border-border p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.md, ease: ease.out, delay: 0.08 }}
        >
          <p className="text-on-dim text-[11px] uppercase tracking-wide font-medium mb-2">Conflict</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12px]">
            <span className="text-on-dim">Session</span>
            <span className="text-on-surface font-medium">{k08.title}</span>
            <span className="text-on-dim">Time</span>
            <span className="text-on-surface">Nov 11 · 15:30–17:00 WET</span>
            <span className="text-on-dim">Speaker</span>
            <span className="text-on-surface">{k08.speaker}</span>
            <span className="text-on-dim">Blocking</span>
            <span className="text-on-surface">{conflict.title}</span>
            <span className="text-on-dim">Attendees</span>
            <span className="text-on-surface">{conflict.attendeeCount} people</span>
          </div>
        </motion.div>

        <motion.div
          className="bg-surface-1 rounded-2xl border border-border p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.md, ease: ease.out, delay: 0.16 }}
        >
          <p className="text-on-dim text-[11px] uppercase tracking-wide font-medium mb-2">Jeevy's suggestion</p>
          <p className="text-on-surface text-[13px] leading-relaxed">{outcome}</p>
        </motion.div>

        <AnimatePresence>
          {resolved && (
            <motion.div
              className="bg-success/10 border border-success/30 rounded-2xl p-4 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <p className="text-success font-semibold text-[14px]">Conflict resolved ✓</p>
              <p className="text-on-dim text-[12px] mt-0.5">All-Hands rescheduled · Calendar invite sent</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-border bg-surface-0">
        {!resolved ? (
          <button
            onClick={handleResolve}
            className="w-full bg-accent text-white text-[14px] font-semibold py-3.5 rounded-xl hover:bg-accent/90 transition-colors"
          >
            Reschedule All-Hands
          </button>
        ) : (
          <motion.button
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={() => flow.advanceChat(6, 3)}
            className="w-full bg-success/20 text-success text-[14px] font-semibold py-3.5 rounded-xl border border-success/30"
          >
            Continue to reminders →
          </motion.button>
        )}
      </div>
    </div>
  )
}
