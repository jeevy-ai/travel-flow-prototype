import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Props {
  onAllSet: () => void
}

const PACKING_ITEMS = [
  'Passport + travel docs',
  'Business cards (500)',
  'Laptop + charger + adapters',
  'Conference badge printed',
  'Marriott reservation confirmation',
  'Noise-cancelling headphones',
  'Business casual outfits (3)',
  'Currency/card for Europe',
]

export function S7ReminderSetup({ onAllSet }: Props) {
  const [reminderOn, setReminderOn] = useState(true)
  const [packingOpen, setPackingOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="flex-1 px-6 pt-14 pb-6">
        <motion.h1
          className="font-semibold text-[28px] text-on-surface mb-6"
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          One reminder before you go.
        </motion.h1>

        {/* Departure card */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.05 }}
        >
          <div className="px-5 pt-5 pb-4">
            <p className="text-[17px] font-semibold text-on-surface">Leave for SFO</p>
            <p className="text-[16px] text-on-dim mt-1">Nov 9 · 06:30 AM · 2h 30m buffer</p>
          </div>

          {/* Reminder toggle */}
          <div className="px-5 py-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[16px]">⏰</span>
              <span className="text-[15px] text-on-surface">Remind me at 05:45 AM</span>
            </div>
            <button
              onClick={() => setReminderOn(v => !v)}
              className="relative w-10 h-6 rounded-full transition-colors flex items-center"
              style={{ background: reminderOn ? '#1A1A1A' : '#E5E7EB' }}
              aria-label={reminderOn ? 'Disable reminder' : 'Enable reminder'}
            >
              <motion.span
                className="absolute w-4 h-4 rounded-full bg-white"
                animate={{ left: reminderOn ? '22px' : '3px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </motion.div>

        {/* Packing list collapsed */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.12 }}
        >
          <button
            onClick={() => setPackingOpen(v => !v)}
            className="w-full text-center text-[15px] font-medium text-on-dim py-2 transition-opacity active:opacity-60"
          >
            {packingOpen ? 'Hide packing list' : `See packing list (${PACKING_ITEMS.length} items)`}
          </button>

          <AnimatePresence>
            {packingOpen && (
              <motion.div
                className="mt-3 rounded-2xl overflow-hidden"
                style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
              >
                {PACKING_ITEMS.map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 px-5 py-3.5 ${i < PACKING_ITEMS.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <span className="text-[13px]" style={{ color: '#9CA3AF' }}>›</span>
                    <span className="text-[15px] text-on-surface">{item}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <motion.div
        className="px-5 pb-10 pt-4 bg-surface-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.1 }}
      >
        <button
          onClick={onAllSet}
          className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
          style={{ background: '#1A1A1A' }}
        >
          All set
        </button>
      </motion.div>
    </div>
  )
}
