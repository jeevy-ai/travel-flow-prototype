import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { FlowEngine } from '../../hooks/useFlowEngine'
import { PrefBadge } from '../shared/PrefBadge'
import { ExpandChevron } from '../shared/ExpandChevron'
import { VerbTag } from '../shared/VerbTag'
import { stagger, dur, ease } from '../../tokens/motion'

interface Props { flow: FlowEngine }

interface FlightCardProps {
  label: string
  route: string
  flightNum: string
  datetime: string
  seat: string
  aircraft: string
  duration: string
  stops: string
  fare: string
  changeFee: string
  index: number
  expanded: boolean
  onToggle: () => void
}

function FlightCard({ label, route, flightNum, datetime, seat, aircraft, duration, stops, fare, changeFee, index, expanded, onToggle }: FlightCardProps) {
  const dep = new Date(datetime)
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
            <span className="text-on-dim text-[11px] uppercase tracking-wide font-medium">{label}</span>
          </div>
          <button onClick={onToggle}><ExpandChevron open={expanded} /></button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-on-surface font-bold text-[15px]">{route}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-accent text-sm font-medium">{flightNum}</p>
            <p className="text-on-dim text-[12px]">{fmtDay(dep)}</p>
          </div>
          <div className="text-right">
            <p className="text-on-surface font-semibold font-mono text-[14px]">{fmt(dep)}</p>
            <p className="text-on-dim text-[12px]">{duration} · {stops}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['Platinum upgrade ✓', 'Aisle seat ✓', 'No change fee ✓'].map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: index * 0.1 + 0.05 + i * 0.04 }}
            >
              <PrefBadge label={badge} />
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
              <span className="text-on-dim">Seat</span>
              <span className="text-on-surface">{seat}</span>
              <span className="text-on-dim">Aircraft</span>
              <span className="text-on-surface">{aircraft}</span>
              <span className="text-on-dim">Fare</span>
              <span className="text-on-surface font-medium">{fare}</span>
              <span className="text-on-dim">Changes</span>
              <span className="text-on-surface">{changeFee}</span>
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
  const out = flow.data.flightOutbound.result.payload
  const ret = flow.data.flightReturn.result.payload
  const total = 3240 * 2

  const handleConfirm = () => {
    flow.confirmEntry('flt_outbound')
    flow.confirmEntry('flt_return')
    flow.advanceChat(3, 0)
  }

  return (
    <div className="flex flex-col bg-surface-0">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <VerbTag verb="book_reservation" />
          <h1 className="text-on-surface text-[18px] font-bold mt-0.5">Choose flights</h1>
        </div>
        <p className="text-on-dim text-[12px]">2 of 7</p>
      </div>

      <div className="px-5 pb-4 flex flex-col gap-3">
        <FlightCard
          label="Outbound"
          route="SFO → LIS"
          flightNum="UA88"
          datetime={out.datetime}
          seat={out.slot}
          aircraft={out.aircraft}
          duration={out.duration}
          stops={out.stops}
          fare={out.fare}
          changeFee={out.changeFee}
          index={0}
          expanded={expandedIdx === 0}
          onToggle={() => setExpandedIdx(expandedIdx === 0 ? null : 0)}
        />

        <FlightCard
          label="Return"
          route="LIS → SFO"
          flightNum="UA89"
          datetime={ret.datetime}
          seat={ret.slot}
          aircraft={ret.aircraft}
          duration={ret.duration}
          stops={ret.stops}
          fare={ret.fare}
          changeFee={ret.changeFee}
          index={1}
          expanded={expandedIdx === 1}
          onToggle={() => setExpandedIdx(expandedIdx === 1 ? null : 1)}
        />

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
              {out.fallbacks.map((alt, i) => (
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
          <span className="text-on-surface font-mono font-bold text-[16px]">${total.toLocaleString()} · 2 tickets</span>
        </div>
        <button
          onClick={handleConfirm}
          className="w-full bg-accent text-white text-[14px] font-semibold py-3.5 rounded-xl hover:bg-accent/90 transition-colors"
        >
          Confirm flights
        </button>
      </div>
    </div>
  )
}
