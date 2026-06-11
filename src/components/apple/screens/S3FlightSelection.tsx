import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface Props {
  onBook: () => void
  onSeeAlts: () => void
}

const TIMES = ['Any time', 'Morning (6–12)', 'Afternoon (12–18)', 'Evening (18–24)']
const AIRLINES = ['Any airline', 'Delta', 'United', 'TAP Air Portugal', 'British Airways']

export function S3FlightSelection({ onBook, onSeeAlts }: Props) {
  const [altsOpen, setAltsOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState('Any time')
  const [selectedAirline, setSelectedAirline] = useState('Any airline')

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="flex-1 px-6 pt-14 pb-6 overflow-y-auto">
        <motion.h1
          className="font-semibold text-[28px] text-on-surface mb-6"
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          Here's your flight.
        </motion.h1>

        {/* Flight card */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.05 }}
        >
          {/* Airline photo */}
          <div className="relative h-[140px] overflow-hidden">
            <img
              src="/fixture-images/flight-outbound-business-cabin.webp"
              alt="Business class cabin"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }}
            />
            <div className="absolute bottom-3 left-4">
              <span className="text-white font-semibold text-[13px] tracking-wide">DELTA AIRLINES</span>
            </div>
          </div>

          {/* Card body */}
          <div className="px-5 py-4">
            <p className="text-[17px] font-semibold text-on-surface mb-1">SFO → LIS</p>
            <p className="text-[16px] text-on-dim">Nov 9 · 10h 35m · Non-stop</p>
            <p className="text-[13px] mt-2" style={{ color: '#9CA3AF' }}>Matches your preferences</p>
          </div>
        </motion.div>

        {/* See alternatives */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.12 }}
        >
          <button
            onClick={() => setAltsOpen(v => !v)}
            className="text-on-dim text-[15px] font-medium w-full text-center py-2 transition-opacity active:opacity-60"
          >
            {altsOpen ? 'Hide alternatives' : 'See 4 other options'}
          </button>

          {altsOpen && (
            <motion.div
              className="mt-3 rounded-2xl overflow-hidden"
              style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.22 }}
            >
              {[
                'Delta UA88 · 14:30 · 1 stop via JFK',
                'TAP Air Portugal TP236 · 23:45 · Non-stop',
                'British Airways BA498 · 10:00 · 1 stop via LHR',
                'Iberia IB3152 · 08:15 · 1 stop via MAD',
              ].map((alt, i) => (
                <button
                  key={alt}
                  onClick={onSeeAlts}
                  className={`w-full text-left px-5 py-3.5 text-[14px] text-on-dim active:bg-surface-2 transition-colors ${i < 3 ? 'border-b border-border' : ''}`}
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.1 }}
      >
        <button
          onClick={onBook}
          className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
          style={{ background: '#5B4FE8' }}
        >
          Book this flight
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
              className="rounded-2xl overflow-hidden px-5 py-4"
              style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-4">
                <p className="text-[13px] text-on-faint mb-2">Departure time</p>
                <div className="flex flex-wrap gap-2">
                  {TIMES.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors"
                      style={
                        selectedTime === t
                          ? { background: '#1A1A1A', color: '#FFFFFF' }
                          : { background: '#F5F4F0', color: '#6B7280' }
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-[13px] text-on-faint mb-2">Airline</p>
                <div className="flex flex-wrap gap-2">
                  {AIRLINES.map(a => (
                    <button
                      key={a}
                      onClick={() => setSelectedAirline(a)}
                      className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors"
                      style={
                        selectedAirline === a
                          ? { background: '#1A1A1A', color: '#FFFFFF' }
                          : { background: '#F5F4F0', color: '#6B7280' }
                      }
                    >
                      {a}
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
