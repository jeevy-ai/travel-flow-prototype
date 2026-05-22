import { motion } from 'framer-motion'
import type { FlowEngine } from '../../hooks/useFlowEngine'
import { VerbTag } from '../shared/VerbTag'
import { stagger, dur, ease } from '../../tokens/motion'

interface Props { flow: FlowEngine }

export function Screen6PackingList({ flow }: Props) {
  const reminders = flow.data.reminders

  const handleConfirm = () => {
    flow.confirmEntry('reminders')
    flow.advanceChat(7, 4)
  }

  return (
    <div className="flex flex-col h-full bg-surface-0">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <VerbTag verb="errand" />
          <h1 className="text-on-surface text-[18px] font-bold mt-0.5">Reminders</h1>
        </div>
        <p className="text-on-dim text-[12px]">6 of 7</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        <p className="text-on-dim text-[12px]">Jeevy set these based on your departure time.</p>

        {reminders.map((r, i) => (
          <motion.div
            key={i}
            className="bg-surface-1 rounded-2xl border border-border p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.sm, ease: ease.out, delay: stagger(i, 60) }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🔔</span>
              <div className="flex-1">
                <p className="text-on-surface font-semibold text-[14px] mb-0.5">{r.result.payload.subject}</p>
                <p className="text-on-dim text-[12px]">{r.result.payload.ack}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-on-dim text-[11px] bg-surface-2 px-2 py-0.5 rounded-full">
                    {r.result.payload.deliveryMethod}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          className="bg-surface-1 rounded-2xl border border-border p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.sm, ease: ease.out, delay: stagger(reminders.length, 60) }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">📋</span>
            <div className="flex-1">
              <p className="text-on-surface font-semibold text-[14px] mb-0.5">Packing list</p>
              <p className="text-on-dim text-[12px]">Passport, adapter, business cards, laptop charger, noise-cancelling headphones</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-on-dim text-[11px] bg-surface-2 px-2 py-0.5 rounded-full">push + email</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-border bg-surface-0 shrink-0">
        <button
          onClick={handleConfirm}
          className="w-full bg-accent text-white text-[14px] font-semibold py-3.5 rounded-xl hover:bg-accent/90 transition-colors"
        >
          Set all reminders →
        </button>
      </div>
    </div>
  )
}
