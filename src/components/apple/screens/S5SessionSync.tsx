import { motion } from 'framer-motion'

interface Props {
  onAddToCalendar: () => void
  onSkip: () => void
}

const SESSIONS = [
  {
    id: 'K01',
    recommended: true,
    title: 'The Age of Ambient AI',
    speaker: 'Reid Hoffman',
    date: 'Nov 10 · 09:30–10:15',
  },
  {
    id: 'K02',
    recommended: false,
    title: 'Future of Work',
    speaker: 'Panel',
    date: 'Nov 10 · 14:00–15:00',
  },
  {
    id: 'W07',
    recommended: true,
    title: 'Product Strategy in the AI Era',
    speaker: 'Lenny Rachitsky',
    date: 'Nov 11 · 10:00–11:30',
  },
  {
    id: 'K08',
    recommended: false,
    title: 'Closing Keynote',
    speaker: 'Padmasree Warrior',
    date: 'Nov 11 · 15:30–17:00',
  },
]

export function S5SessionSync({ onAddToCalendar, onSkip }: Props) {
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
          Sessions worth catching.
        </motion.h1>

        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.05 }}
        >
          {SESSIONS.map((session, i) => (
            <div
              key={session.id}
              className={`px-5 py-4 flex items-start gap-3 ${i < SESSIONS.length - 1 ? 'border-b border-border' : ''}`}
            >
              <span className="text-[14px] mt-0.5 w-4 shrink-0">
                {session.recommended ? '⭐' : ''}
              </span>
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-on-surface leading-tight">{session.title}</p>
                <p className="text-[13px] text-on-dim mt-0.5">{session.date}</p>
              </div>
            </div>
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
          onClick={onAddToCalendar}
          className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
          style={{ background: '#1A1A1A' }}
        >
          Add to calendar
        </button>
        <button
          onClick={onSkip}
          className="w-full py-3 text-center text-[15px] font-medium text-on-dim transition-opacity active:opacity-60"
        >
          Skip sessions
        </button>
      </motion.div>
    </div>
  )
}
