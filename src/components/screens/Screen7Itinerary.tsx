import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { FlowEngine } from '../../hooks/useFlowEngine'
import { dur, ease } from '../../tokens/motion'

interface Props { flow: FlowEngine }

export function Screen7Itinerary({ flow }: Props) {
  const confirmed = flow.entries.filter(e => e.state === 'confirmed' || e.state === 'calendar-synced').length
  const total = flow.totalCount

  return (
    <div className="flex flex-col h-full bg-surface-0">
      <div className="px-5 pt-10 pb-5">
        <p className="text-on-dim text-[11px] uppercase tracking-wider font-medium mb-1">Your itinerary</p>
        <motion.h1
          className="text-on-surface text-[22px] font-bold tracking-tight leading-tight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.md, ease: ease.out, delay: 0.1 }}
        >
          Web Summit 2026<br />
          <span className="text-accent">Lisbon</span>
        </motion.h1>
        <motion.p
          className="text-on-dim text-[13px] mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur.md, delay: 0.2 }}
        >Nov 9–12 · 4 days</motion.p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-4">
        <motion.div
          className="bg-success/10 border border-success/30 rounded-2xl px-4 py-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
        >
          <p className="text-success font-bold text-[16px] mb-1">Trip is set ✓</p>
          <p className="text-on-dim text-[13px]">{confirmed} of {total} items confirmed. Full timeline on the right.</p>
        </motion.div>

        <motion.div
          className="bg-surface-1 rounded-2xl border border-border p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.md, ease: ease.out, delay: 0.4 }}
        >
          <p className="text-on-dim text-[11px] uppercase tracking-wide font-medium mb-3">Summary</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[13px]">
            <span className="text-on-dim">Flight out</span>
            <span className="text-on-surface">UA88 · SFO→LIS · Nov 9 · Seat 4A</span>
            <span className="text-on-dim">Hotel</span>
            <span className="text-on-surface">Marriott Lisbon · Nov 10–12</span>
            <span className="text-on-dim">Sessions</span>
            <span className="text-on-surface">4 sessions · Altice Arena</span>
            <span className="text-on-dim">Flight back</span>
            <span className="text-on-surface">UA89 · LIS→SFO · Nov 12 · Seat 4A</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.md, ease: ease.out, delay: 0.5 }}
        >
          <Link
            to="/itinerary/ws2026/day-of"
            className="block w-full text-center bg-accent text-white font-semibold text-[14px] py-3 rounded-xl hover:bg-accent/90 transition-colors"
          >
            View day-of plan →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
