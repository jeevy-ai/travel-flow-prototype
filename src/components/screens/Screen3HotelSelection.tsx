import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { FlowState } from '../../hooks/useFlowState'
import { VerbTag } from '../shared/VerbTag'
import { PrefBadge } from '../shared/PrefBadge'
import { MiniStrip } from '../ministrip/MiniStrip'
import { dur, ease } from '../../tokens/motion'
import fixture from '../../data/fixture.json'

interface Props { flow: FlowState }

const alts = [
  { name: 'Hyatt Centric Fisherman\'s Wharf', dist: '1.2 mi from venue', price: 349, note: 'No loyalty match' },
  { name: 'W San Francisco', dist: '0.4 mi from venue', price: 489, note: 'Preferred brand ✓' },
]

export function Screen3HotelSelection({ flow }: Props) {
  const [booked, setBooked] = useState(false)
  const [flash, setFlash] = useState(false)
  const [showAlts, setShowAlts] = useState(false)
  const hotel = fixture.hotel

  const nights = Math.round(
    (new Date(hotel.checkoutDate).getTime() - new Date(hotel.checkinDate).getTime()) / 86400000
  )

  const handleBook = () => {
    setFlash(true)
    setTimeout(() => {
      setFlash(false)
      setBooked(true)
    }, 400)
  }

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <VerbTag verb="book_reservation" />
          <h1 className="text-on-surface text-[18px] font-bold mt-0.5">Choose hotel</h1>
        </div>
        <p className="text-on-dim text-[12px]">3 of 7</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        <motion.div
          className={`bg-surface-1 rounded-2xl border overflow-hidden transition-colors duration-400 ${
            flash ? 'border-success' : 'border-border'
          }`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: dur.md, ease: ease.out }}
        >
          <motion.div
            className="h-32 bg-surface-2 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: dur.sm, ease: ease.out, delay: 0.12 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl opacity-30">🏨</div>
            </div>
            <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
              <span className="text-on-surface text-[11px] font-medium bg-surface-0/80 px-2 py-0.5 rounded-full">
                {hotel.distanceToVenueMiles} mi from venue
              </span>
              <span className="text-on-surface text-[11px] bg-surface-0/80 px-2 py-0.5 rounded-full">
                {hotel.loyaltyProgram} ✓
              </span>
            </div>
          </motion.div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-on-surface font-bold text-[16px]">{hotel.name}</h2>
                <p className="text-on-dim text-[12px]">{hotel.address}</p>
              </div>
              <div className="text-right">
                <p className="text-on-surface font-mono font-bold text-[15px]">${hotel.pricePerNight}</p>
                <p className="text-on-dim text-[11px]">/ night</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {['Marriott Bonvoy ✓', 'King bed ✓', 'Free Wi-Fi ✓'].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 + i * 0.04 }}
                >
                  <PrefBadge label={label} />
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-y-1.5 text-[12px] mb-4">
              <span className="text-on-dim">Check-in</span>
              <span className="text-on-surface">{hotel.checkinDate}</span>
              <span className="text-on-dim">Check-out</span>
              <span className="text-on-surface">{hotel.checkoutDate}</span>
              <span className="text-on-dim">Nights</span>
              <span className="text-on-surface">{nights} nights</span>
              <span className="text-on-dim">Total</span>
              <span className="text-on-surface font-mono font-medium">${hotel.totalPrice}</span>
            </div>

            {!booked ? (
              <button
                onClick={handleBook}
                className="w-full bg-accent text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-accent/90 transition-colors"
              >
                Book this
              </button>
            ) : (
              <motion.button
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-full bg-success/20 text-success text-[14px] font-semibold py-3 rounded-xl border border-success/30"
                onClick={() => flow.advance(4, 1)}
              >
                Booked ✓ — Continue
              </motion.button>
            )}
          </div>
        </motion.div>

        <button
          onClick={() => setShowAlts(!showAlts)}
          className="text-accent text-[13px] text-center py-1"
        >
          {showAlts ? 'Hide alternatives' : 'See alternatives'}
        </button>

        <AnimatePresence>
          {showAlts && (
            <motion.div
              className="flex flex-col gap-2 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {alts.map((alt, i) => (
                <motion.div
                  key={alt.name}
                  className="bg-surface-1 rounded-2xl border border-border p-4"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: dur.md, ease: ease.out, delay: i * 0.06 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-on-surface text-[13px] font-semibold">{alt.name}</p>
                      <p className="text-on-dim text-[11px]">{alt.dist}</p>
                      <p className="text-accent text-[11px] mt-0.5">{alt.note}</p>
                    </div>
                    <p className="text-on-surface font-mono font-bold text-[14px]">${alt.price}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MiniStrip flow={flow} />
    </div>
  )
}
