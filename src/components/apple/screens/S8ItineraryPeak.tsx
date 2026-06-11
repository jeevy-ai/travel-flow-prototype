import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const RING_SIZE = 120
const STROKE = 8
const RADIUS = (RING_SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const TIMELINE = [
  {
    dateKey: 'nov9',
    day: 'Sun, Nov 9',
    label: 'Depart',
    items: [
      { headline: 'Delta · SFO → LIS', sub: 'Departs 22:10 · Arrives +1 06:45', tap: false },
    ],
  },
  {
    dateKey: 'nov10',
    day: 'Mon, Nov 10',
    label: 'Arrive + Check-in',
    items: [
      { headline: 'Marriott Lisbon', sub: 'Check-in from 15:00', tap: true },
    ],
  },
  {
    dateKey: 'nov10-12',
    day: 'Nov 10–11',
    label: 'Conference',
    items: [
      { headline: 'Web Summit 2026', sub: '⭐ The Age of Ambient AI · Nov 10 09:30', tap: false },
    ],
  },
  {
    dateKey: 'nov12',
    day: 'Wed, Nov 12',
    label: 'Depart Lisbon',
    items: [
      { headline: 'Delta · LIS → SFO', sub: 'Departs 09:30 · Arrives 12:30 PST', tap: false },
    ],
  },
]

export function S8ItineraryPeak() {
  const [phase, setPhase] = useState<'ring' | 'timeline'>('ring')
  const ringControls = useAnimation()
  const textControls = useAnimation()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function runEntrance() {
      // Ring draws 0 → 100% over 800ms
      await ringControls.start({
        strokeDashoffset: 0,
        transition: { duration: 0.8, ease: 'easeInOut' },
      })
      // "Trip ready" springs in
      await textControls.start({
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      })
      // After a moment, transition to timeline
      await new Promise(r => setTimeout(r, 900))
      setPhase('timeline')
    }
    runEntrance()
  }, [ringControls, textControls])

  return (
    <div className="flex flex-col min-h-screen bg-surface-0 relative overflow-hidden">

      {/* Phase 1: Full-screen photo + completeness ring */}
      <AnimatePresence>
        {phase === 'ring' && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center z-20"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Lisbon photograph */}
            <div className="absolute inset-0">
              <img
                src="/fixture-images/city-lisbon.webp"
                alt="Lisbon"
                className="w-full h-full object-cover"
                style={{ filter: 'saturate(1.1) brightness(0.85)' }}
              />
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
            </div>

            {/* Ring + text */}
            <div className="relative flex flex-col items-center gap-6">
              <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={STROKE}
                />
                {/* Progress */}
                <motion.circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="white"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  initial={{ strokeDashoffset: CIRCUMFERENCE }}
                  animate={ringControls}
                />
              </svg>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={textControls}
              >
                <p className="text-white font-semibold leading-tight" style={{ fontSize: '38px', letterSpacing: '-0.02em' }}>
                  Trip ready.
                </p>
                <p className="text-white/70 text-[16px] mt-2">Web Summit 2026</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Timeline view */}
      <AnimatePresence>
        {phase === 'timeline' && (
          <motion.div
            className="flex flex-col min-h-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
          >
            {/* Hero peek */}
            <div className="relative h-[180px] shrink-0 overflow-hidden">
              <img
                src="/fixture-images/city-lisbon.webp"
                alt="Lisbon"
                className="w-full h-full object-cover"
                style={{ filter: 'saturate(1.05) brightness(0.9)' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, transparent 30%, #F5F4F0 100%)' }}
              />
              <div className="absolute bottom-3 left-5">
                <p className="text-on-surface font-semibold text-[18px]" style={{ letterSpacing: '-0.01em' }}>
                  Web Summit 2026
                </p>
                <p className="text-on-dim text-[13px]">Lisbon · Nov 9–12 · Ready to go</p>
              </div>
            </div>

            {/* Timeline */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 pt-2 pb-28"
            >
              {TIMELINE.map((group, gi) => (
                <div key={group.dateKey} className={gi > 0 ? 'mt-6' : 'mt-2'}>
                  {/* Day header */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[13px] font-semibold" style={{ color: '#9CA3AF' }}>
                      {group.day}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide" style={{ color: '#9CA3AF', opacity: 0.7 }}>
                      {group.label}
                    </span>
                  </div>

                  {/* Spine + items */}
                  <div className="relative pl-4">
                    {/* Vertical spine line */}
                    {gi < TIMELINE.length - 1 && (
                      <div
                        className="absolute left-[5px] top-2 bottom-0 w-px"
                        style={{ background: '#E5E7EB', transform: 'translateY(4px)' }}
                      />
                    )}
                    {/* Dot */}
                    <div
                      className="absolute left-0 top-[7px] w-2.5 h-2.5 rounded-full"
                      style={{ background: '#1A1A1A', border: '2px solid #F5F4F0', zIndex: 1 }}
                    />

                    {group.items.map(item => (
                      <div key={item.headline} className="mb-1">
                        <p className="text-[16px] font-semibold text-on-surface leading-snug">{item.headline}</p>
                        <p className="text-[13px] text-on-dim mt-0.5">{item.sub}</p>
                        {item.tap && (
                          <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF' }}>↳ tap for details</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center gap-2 px-5 pb-10 pt-4"
              style={{ background: 'linear-gradient(to top, #F5F4F0 80%, transparent 100%)' }}
            >
              <div className="w-full max-w-[430px]">
                <button
                  className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
                  style={{ background: '#1A1A1A' }}
                >
                  Add to Calendar
                </button>
                <Link
                  to="/itinerary/ws2026/day-of"
                  className="block w-full text-center text-[15px] font-medium text-on-dim py-3 transition-opacity active:opacity-60"
                >
                  View day-of plan
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
