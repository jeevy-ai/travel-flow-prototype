import { motion } from 'framer-motion'

interface Props {
  onLooksRight: () => void
  onEdit: () => void
}

const PREFS = [
  { label: 'Airline', value: 'Delta Airlines' },
  { label: 'Cabin', value: 'Business' },
  { label: 'Seat', value: 'Aisle' },
  { label: 'Hotel', value: 'Marriott Bonvoy' },
]

export function S2PrefsConfirm({ onLooksRight, onEdit }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="flex-1 px-6 pt-14 pb-6">
        <motion.h1
          className="font-semibold text-[28px] text-on-surface mb-8"
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          Your preferences.
        </motion.h1>

        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.05 }}
        >
          {PREFS.map((pref, i) => (
            <button
              key={pref.label}
              onClick={onEdit}
              className={`w-full flex items-center justify-between px-5 py-4 active:bg-surface-2 transition-colors ${i < PREFS.length - 1 ? 'border-b border-border' : ''}`}
            >
              <span className="text-[13px] text-on-faint">{pref.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-semibold text-on-surface">{pref.value}</span>
                <span className="text-on-faint text-[15px]">›</span>
              </div>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <motion.div
        className="px-5 pb-10 pt-4 bg-surface-0 flex flex-col gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.1 }}
      >
        <button
          onClick={onLooksRight}
          className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
          style={{ background: '#1A1A1A' }}
        >
          Looks right
        </button>
        <button
          onClick={onEdit}
          className="w-full py-3 text-center text-[15px] font-medium text-on-dim transition-opacity active:opacity-60"
        >
          Edit anything
        </button>
      </motion.div>
    </div>
  )
}
