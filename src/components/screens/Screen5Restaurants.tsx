import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { FlowState } from '../../hooks/useFlowState'
import { VerbTag } from '../shared/VerbTag'
import { PrefBadge } from '../shared/PrefBadge'
import { MiniStrip } from '../ministrip/MiniStrip'
import { stagger, dur, ease } from '../../tokens/motion'
import fixture from '../../data/fixture.json'

interface Props { flow: FlowState }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })
}

export function Screen5Restaurants({ flow }: Props) {
  const [booked, setBooked] = useState(false)
  const [flash, setFlash] = useState(false)
  const restaurants = fixture.restaurants

  const handleBookBoth = () => {
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
          <h1 className="text-on-surface text-[18px] font-bold mt-0.5">Dinner reservations</h1>
        </div>
        <p className="text-on-dim text-[12px]">5 of 7</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        {restaurants.map((r, i) => (
          <motion.div
            key={r.id}
            className={`bg-surface-1 rounded-2xl border overflow-hidden transition-colors duration-400 ${
              flash ? 'border-success' : 'border-border'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: dur.md, ease: ease.out, delay: stagger(i, 80) }}
          >
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <motion.div
                  className="text-2xl"
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                    delay: stagger(i, 80) + 0.1
                  }}
                >
                  📍
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h2 className="text-on-surface font-bold text-[15px]">{r.name}</h2>
                    <span className="text-on-dim text-[11px]">${r.pricePerPersonUSD}/pp</span>
                  </div>
                  <p className="text-on-dim text-[12px]">{r.cuisine}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-on-dim text-[11px]">{r.distanceFromHotelMiles} mi</span>
                    <span className="text-border">·</span>
                    <span className="text-accent text-[11px] font-medium">{fmtTime(r.reservationAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: stagger(i, 80) + 0.08 }}
                >
                  <PrefBadge label="No shellfish ✓" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: stagger(i, 80) + 0.12 }}
                >
                  <PrefBadge label={`${r.cuisine} ✓`} />
                </motion.div>
              </div>

              {r.notes && (
                <p className="text-on-dim text-[11px] mt-2 leading-relaxed">{r.notes}</p>
              )}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {booked && (
            <motion.div
              className="bg-success/10 border border-success/30 rounded-2xl p-4 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <p className="text-success font-semibold text-[14px]">Both dinners reserved ✓</p>
              <p className="text-on-dim text-[12px] mt-0.5">Confirmations sent to your email</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-border bg-surface-0">
        {!booked ? (
          <button
            onClick={handleBookBoth}
            className="w-full bg-accent text-white text-[14px] font-semibold py-3.5 rounded-xl hover:bg-accent/90 transition-colors"
          >
            Book both dinners
          </button>
        ) : (
          <motion.button
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={() => flow.advance(6, 3)}
            className="w-full bg-success/20 text-success text-[14px] font-semibold py-3.5 rounded-xl border border-success/30"
          >
            Continue to packing →
          </motion.button>
        )}
      </div>

      <MiniStrip flow={flow} />
    </div>
  )
}
