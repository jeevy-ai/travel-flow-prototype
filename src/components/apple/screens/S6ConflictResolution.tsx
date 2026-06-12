import { motion } from 'framer-motion'

interface Props {
  onKeepSession: () => void
  onKeepMeeting: () => void
}

export function S6ConflictResolution({ onKeepSession, onKeepMeeting }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="flex-1 px-6 pt-14 pb-6">
        <motion.h1
          className="font-semibold text-[28px] text-on-surface mb-6"
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          One overlap.
        </motion.h1>

        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-card)' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.05 }}
        >
          <div className="px-5 pt-5 pb-4">
            <p className="text-[16px] text-on-surface leading-relaxed">
              Closing Keynote overlaps <span className="font-semibold">"Q3 Product Sync"</span> on your calendar.
            </p>
            <p className="text-[13px] text-on-dim mt-2">
              Nov 11 · 15:30–17:00 · Altice Arena
            </p>
          </div>

          {/* Two equal-weight binary choice buttons */}
          <div className="flex border-t border-border">
            <button
              onClick={onKeepSession}
              className="flex-1 py-4 text-[15px] font-semibold text-on-surface text-center border-r border-border active:bg-surface-2 transition-colors"
            >
              Keep session
            </button>
            <button
              onClick={onKeepMeeting}
              className="flex-1 py-4 text-[15px] font-semibold text-on-dim text-center active:bg-surface-2 transition-colors"
            >
              Keep meeting
            </button>
          </div>
        </motion.div>

        <motion.p
          className="text-[13px] text-on-dim text-center mt-4 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          Jeevy will reschedule whichever you don't keep.
        </motion.p>
      </div>
    </div>
  )
}
