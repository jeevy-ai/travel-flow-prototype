import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface Props {
  onBook: () => void
  onDifferentHotel: () => void
}

const CHAINS = ['Marriott', 'Hilton', 'Hyatt', 'IHG', 'Boutique', 'Any']
const DISTANCES = ['< 1 km', '< 2 km', '< 5 km', 'Any distance']
const PRICES = ['< €200/night', '< €350/night', '< €500/night', 'Any price']

export function S4HotelSelection({ onBook, onDifferentHotel }: Props) {
  const [altsOpen, setAltsOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [chain, setChain] = useState('Marriott')
  const [distance, setDistance] = useState('Any distance')
  const [price, setPrice] = useState('Any price')

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="flex-1 px-6 pt-14 pb-6 overflow-y-auto">
        <motion.h1
          className="font-semibold text-[28px] text-on-surface mb-5"
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          Here's your hotel.
        </motion.h1>

        {/* Amber conflict banner */}
        <motion.div
          className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2"
          style={{ background: 'var(--warning-light)', border: '1px solid var(--warning-light)' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.04 }}
        >
          <span className="text-[13px] mt-px" style={{ color: 'var(--warning)' }}>⚠</span>
          <p className="text-[13px]" style={{ color: 'var(--warning)' }}>
            No Marriott nearby — closest match shown.
          </p>
        </motion.div>

        {/* Hotel card */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-card)' }}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.07 }}
        >
          {/* Full-bleed hotel photo */}
          <div className="relative h-[160px] overflow-hidden">
            <img
              src="/fixture-images/hotel-marriott-lisbon-exterior.webp"
              alt="Marriott Lisbon exterior"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card body */}
          <div className="px-5 py-4">
            <p className="text-[17px] font-semibold text-on-surface mb-1">Marriott Lisbon</p>
            <p className="text-[16px] text-on-dim">Nov 10–12 · 2 nights · 8 min taxi</p>
          </div>
        </motion.div>

        {/* Different hotel link */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.12 }}
        >
          <button
            onClick={() => setAltsOpen(v => !v)}
            className="text-on-dim text-[15px] font-medium w-full text-center py-3 min-h-[44px] flex items-center justify-center transition-opacity active:opacity-60"
          >
            {altsOpen ? 'Hide alternatives' : 'Different hotel'}
          </button>

          {altsOpen && (
            <motion.div
              className="mt-3 rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-card)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {[
                'Bairro Alto Hotel · 5-star · Chiado · €420/night',
                'Memmo Alfama · Boutique · Castle views · €380/night',
                'Palácio Belmonte · 15th-century palace · €650/night',
              ].map((alt, i) => (
                <button
                  key={alt}
                  onClick={onDifferentHotel}
                  className={`w-full text-left px-5 py-3.5 text-[14px] text-on-dim active:bg-surface-2 transition-colors ${i < 2 ? 'border-b border-border' : ''}`}
                >
                  {alt}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <motion.div
        className="px-5 pb-10 pt-4 bg-surface-0 flex flex-col gap-3"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.1 }}
      >
        <button
          onClick={onBook}
          className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
          style={{ background: 'var(--accent)' }}
        >
          Book this hotel
        </button>

        <button
          onClick={() => setCustomizeOpen(v => !v)}
          className="w-full text-center text-[14px] font-medium py-3 min-h-[44px] flex items-center justify-center transition-opacity active:opacity-60"
          style={{ color: 'var(--accent)' }}
        >
          Customize ›
        </button>

        <AnimatePresence>
          {customizeOpen && (
            <motion.div
              className="rounded-2xl overflow-hidden px-5 py-4"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-card)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <p className="text-[13px] text-on-faint mb-2">Hotel chain</p>
                <div className="flex flex-wrap gap-2">
                  {CHAINS.map(c => (
                    <button
                      key={c}
                      onClick={() => setChain(c)}
                      className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors min-h-[44px] flex items-center"
                      style={chain === c ? { background: 'var(--text-primary)', color: 'var(--bg)' } : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[13px] text-on-faint mb-2">Distance to venue</p>
                <div className="flex flex-wrap gap-2">
                  {DISTANCES.map(d => (
                    <button
                      key={d}
                      onClick={() => setDistance(d)}
                      className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors min-h-[44px] flex items-center"
                      style={distance === d ? { background: 'var(--text-primary)', color: 'var(--bg)' } : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[13px] text-on-faint mb-2">Price per night</p>
                <div className="flex flex-wrap gap-2">
                  {PRICES.map(p => (
                    <button
                      key={p}
                      onClick={() => setPrice(p)}
                      className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors min-h-[44px] flex items-center"
                      style={price === p ? { background: 'var(--text-primary)', color: 'var(--bg)' } : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCustomizeOpen(false)}
                className="text-[13px] text-on-dim transition-opacity active:opacity-60"
              >
                Back to recommended
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
