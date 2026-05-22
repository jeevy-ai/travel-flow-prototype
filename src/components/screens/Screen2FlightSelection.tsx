import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { FlowState } from '../../hooks/useFlowState'
import { PrefBadge } from '../shared/PrefBadge'
import { ExpandChevron } from '../shared/ExpandChevron'
import { VerbTag } from '../shared/VerbTag'
import { MiniStrip } from '../ministrip/MiniStrip'
import type { Flight } from '../../data/types'
import { stagger, dur, ease } from '../../tokens/motion'
import fixture from '../../data/fixture.json'

interface Props { flow: FlowState }

function FlightCard({ flight, index, expanded, onToggle }: {
  flight: Flight; index: number; expanded: boolean; onToggle: () => void
}) {
  const dep = new Date(flight.departureAt)
  const arr = new Date(flight.arrivalAt)
  const fmt = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const fmtDay = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <motion.div
      className="bg-surface-1 rounded-2xl border border-border overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.sm, ease: ease.out, delay: index * 0.1 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-on-surface font-bold text-[15px]">{flight.origin}</span>
            <span className="text-on-dim text-sm">→</span>
            <span className="text-on-surface font-bold text-[15px]">{flight.destination}</span>
          </div>
          <button onClick={onToggle}><ExpandChevron open={expanded} /></button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-accent text-sm font-medium">{flight.flightNumber}</p>
            <p className="text-on-dim text-[12px]">{fmtDay(dep)}</p>
          </div>
          <div className="text-right">
            <p className="text-on-surface font-semibold font-mono text-[14px]">
              {fmt(dep)} → {fmt(arr)}
            </p>
            <p className="text-on-dim text-[12px]">{flight.airline}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['Aisle ✓', 'Carry-on ✓', 'Star Alliance ✓'].map((label, i) => (
            <motion.div
              key={label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: index * 0.1 + 0.05 + i * 0.04 }}
            >
              <PrefBadge label={label} />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="border-t border-border px-4 py-3 bg-surface-2 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="grid grid-cols-2 gap-y-2 text-[12px]">
              <span className="text-on-dim">Price</span>
              <span className="text-on-surface font-mono font-medium">${flight.price} {flight.currency}</span>
              <span className="text-on-dim">Seat</span>
              <span className="text-on-surface">{flight.seat} (aisle)</span>
              <span className="text-on-dim">Baggage</span>
              <span className="text-on-surface">{flight.baggage}</span>
              <span className="text-on-dim">Terminal</span>
              <span className="text-on-surface">{flight.terminal}</span>
              <span className="text-on-dim">PNR</span>
              <span className="text-on-dim font-mono opacity-60">{flight.pnr}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function Screen2FlightSelection({ flow }: Props) {
  const [showAlt, setShowAlt] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const total = fixture.flights.reduce((s, f) => s + f.price, 0)

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <VerbTag verb="book_reservation" />
          <h1 className="text-on-surface text-[18px] font-bold mt-0.5">Choose flights</h1>
        </div>
        <p className="text-on-dim text-[12px]">2 of 7</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        {fixture.flights.map((flight, i) => (
          <FlightCard
            key={flight.id}
            flight={flight as Flight}
            index={i}
            expanded={expandedIdx === i}
            onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
          />
        ))}

        <button onClick={() => setShowAlt(!showAlt)} className="text-accent text-[13px] text-center py-1">
          {showAlt ? 'Hide alternatives' : 'See alternatives'}
        </button>

        <AnimatePresence>
          {showAlt && (
            <motion.div
              className="bg-surface-1 rounded-2xl border border-border p-4 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {['LH 477 · CPH→SFO · $792 · No Star Alliance', 'SK 929 · CPH→SFO · $819 · SAS EuroBonus'].map((alt, i) => (
                <motion.p
                  key={alt}
                  className="text-on-dim text-[13px] py-2 border-b border-border last:border-0"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stagger(i, 60), duration: dur.sm, ease: ease.out }}
                >{alt}</motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-border bg-surface-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-on-dim text-[13px]">Total</span>
          <span className="text-on-surface font-mono font-bold text-[16px]">${total} · 2 tickets</span>
        </div>
        <button
          onClick={() => flow.advance(3, 0)}
          className="w-full bg-accent text-white text-[14px] font-semibold py-3.5 rounded-xl hover:bg-accent/90 transition-colors"
        >
          Confirm flights
        </button>
      </div>

      <MiniStrip flow={flow} />
    </div>
  )
}
