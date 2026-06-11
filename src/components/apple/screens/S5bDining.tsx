import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface Props {
  onReserve: () => void
  onSkip: () => void
}

const DISHES = [
  { img: '/fixture-images/restaurant-dishes-seafood.webp', name: 'Prawns' },
  { img: '/fixture-images/restaurant-dishes-cod.webp', name: 'Bacalhau' },
  { img: '/fixture-images/restaurant-dishes-solar.webp', name: 'Crab' },
]

const ALT_RESTAURANTS = [
  { name: 'Solar dos Presuntos', detail: 'Traditional · €€ · 18 min walk' },
  { name: 'Taberna da Rua das Flores', detail: 'Tapas · €€ · 12 min walk' },
  { name: 'Belcanto', detail: 'Fine dining · €€€€ · 20 min taxi' },
]

export function S5bDining({ onReserve, onSkip }: Props) {
  const [partySize, setPartySize] = useState(2)
  const [seating, setSeating] = useState<'indoor' | 'terrace'>('indoor')
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const ctaLabel = partySize > 2 ? `Reserve for ${partySize}` : 'Reserve this table'

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="flex-1 px-6 pt-14 pb-6 overflow-y-auto">
        <motion.h1
          className="font-semibold text-[28px] text-on-surface mb-1"
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          Dinner sorted.
        </motion.h1>

        <motion.p
          className="text-[16px] text-on-dim mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.04 }}
        >
          Jeevy found a table for your first night.
        </motion.p>

        {/* Restaurant card */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.07 }}
        >
          {/* Full-bleed hero dish photo */}
          <div className="relative h-[200px] overflow-hidden">
            <img
              src="/fixture-images/restaurant-dinner-lisbon.webp"
              alt="Signature dish at Cervejaria Ramiro"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)' }}
            />
          </div>

          {/* Card body */}
          <div className="px-5 pt-4 pb-3">
            <p className="text-[17px] font-semibold text-on-surface">Cervejaria Ramiro</p>
            <p className="text-[13px] text-on-faint mt-0.5">Lisbon · Seafood · 15 min walk</p>

            {/* Dish thumbnails */}
            <div className="flex gap-3 mt-4">
              {DISHES.map(d => (
                <div key={d.name} className="flex flex-col items-center gap-1">
                  <div
                    className="overflow-hidden"
                    style={{ width: 56, height: 56, borderRadius: 8 }}
                  >
                    <img
                      src={d.img}
                      alt={d.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[12px] text-on-dim">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-5 h-px bg-border" />

          {/* Party size control */}
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-[15px] text-on-surface">Party size</span>
            <div className="flex items-center gap-5">
              <button
                onClick={() => setPartySize(v => Math.max(1, v - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[20px] text-on-surface active:opacity-60 transition-opacity"
                style={{ background: '#F5F4F0' }}
                aria-label="Decrease party size"
              >
                −
              </button>
              <span className="text-[16px] font-semibold text-on-surface w-4 text-center tabular-nums">
                {partySize}
              </span>
              <button
                onClick={() => setPartySize(v => Math.min(12, v + 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[20px] text-on-surface active:opacity-60 transition-opacity"
                style={{ background: '#F5F4F0' }}
                aria-label="Increase party size"
              >
                +
              </button>
            </div>
          </div>

          <div className="mx-5 h-px bg-border" />

          {/* Seating toggle */}
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-[15px] text-on-surface">Seating</span>
            <div className="flex gap-2">
              {(['indoor', 'terrace'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setSeating(opt)}
                  className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors"
                  style={
                    seating === opt
                      ? { background: '#1A1A1A', color: '#FFFFFF' }
                      : { background: '#F5F4F0', color: '#6B7280' }
                  }
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky CTA area */}
      <motion.div
        className="px-5 pb-10 pt-4 bg-surface-0 flex flex-col gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.1 }}
      >
        <button
          onClick={onReserve}
          className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
          style={{ background: '#5B4FE8' }}
        >
          {ctaLabel}
        </button>

        <button
          onClick={() => setCustomizeOpen(v => !v)}
          className="w-full text-center text-[14px] font-medium py-1 transition-opacity active:opacity-60"
          style={{ color: '#5B4FE8' }}
        >
          Customize ›
        </button>

        <AnimatePresence>
          {customizeOpen && (
            <motion.div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="px-5 pt-4 pb-2">
                <p className="text-[13px] font-medium text-on-dim">Other restaurants</p>
              </div>
              {ALT_RESTAURANTS.map((alt, i) => (
                <button
                  key={alt.name}
                  onClick={onReserve}
                  className={`w-full text-left px-5 py-4 active:bg-surface-2 transition-colors ${
                    i < ALT_RESTAURANTS.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <p className="text-[15px] font-medium text-on-surface">{alt.name}</p>
                  <p className="text-[13px] text-on-dim mt-0.5">{alt.detail}</p>
                </button>
              ))}
              <div className="px-5 py-3.5 border-t border-border">
                <button
                  onClick={() => setCustomizeOpen(false)}
                  className="text-[13px] text-on-dim transition-opacity active:opacity-60"
                >
                  Back to recommended
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onSkip}
          className="w-full py-2 text-center text-[15px] font-medium text-on-dim transition-opacity active:opacity-60"
        >
          Skip dining
        </button>
      </motion.div>
    </div>
  )
}
