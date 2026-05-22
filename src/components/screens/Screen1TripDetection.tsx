import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FlowState } from '../../hooks/useFlowState'
import { VerbTag } from '../shared/VerbTag'

interface Props { flow: FlowState }

export function Screen1TripDetection({ flow }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 px-6 text-center">
        <p className="text-on-dim text-sm">Trip card dismissed.</p>
        <button onClick={() => setDismissed(false)} className="text-accent text-sm underline">
          Re-show card
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-6">
        <div className="mb-10">
          <span className="text-accent text-xl font-bold tracking-tight">jeevy</span>
        </div>

        <motion.div
          className="w-full bg-surface-1 rounded-2xl border border-border overflow-hidden relative"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-2xl"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
          />

          <div className="p-5 pl-6">
            <div className="flex items-center justify-between mb-4">
              <VerbTag verb="plan_my_day" />
              <button
                onClick={() => setDismissed(true)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-on-dim hover:text-on-surface transition-colors text-sm"
              >✕</button>
            </div>

            <h1 className="text-on-surface text-[20px] font-bold tracking-tight leading-tight mb-1">
              SaaStr Annual
            </h1>
            <p className="text-accent font-semibold text-sm mb-1">San Francisco</p>

            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="text-on-dim text-[13px]">Jun 3–5</span>
              <span className="text-border">·</span>
              <span className="text-on-dim text-[13px]">12 days out</span>
              <span className="text-border">·</span>
              <span className="text-warning text-[13px] font-medium">Flight not booked</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => flow.advance(2)}
                className="flex-1 bg-accent text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-accent/90 transition-colors"
              >
                Let's plan it
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-3 rounded-xl border border-border text-on-dim text-[14px] hover:text-on-surface hover:border-on-dim transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
