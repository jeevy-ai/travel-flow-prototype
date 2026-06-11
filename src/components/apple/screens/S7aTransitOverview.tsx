import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface Props {
  onLooksGood: () => void
}

type TransitMode = 'taxi' | 'walk' | 'metro' | 'rideshare'

interface TransitLeg {
  fromLabel: string
  toLabel: string
  mode: TransitMode
  duration: string
  cost?: string
  arrivalNote?: string
}

const MODE_META: Record<TransitMode, { icon: string; label: string }> = {
  taxi:      { icon: '🚕', label: 'Taxi' },
  walk:      { icon: '🚶', label: 'Walk' },
  metro:     { icon: '🚇', label: 'Metro' },
  rideshare: { icon: '🚗', label: 'Rideshare' },
}

const INITIAL_LEGS: TransitLeg[] = [
  {
    fromLabel: '✈ SFO → LIS · Arrive 07:45',
    toLabel: 'Bairro Alto Hotel',
    mode: 'taxi',
    duration: '25 min',
    cost: '~€18',
    arrivalNote: 'Arrive ~08:10',
  },
  {
    fromLabel: 'Hotel',
    toLabel: 'Web Summit venue',
    mode: 'walk',
    duration: '8 min',
    arrivalNote: 'Via Rua do Alecrim',
  },
  {
    fromLabel: 'Venue',
    toLabel: 'Cervejaria Ramiro',
    mode: 'metro',
    duration: '12 min',
    cost: '~€1.50',
    arrivalNote: '2 stops',
  },
]

type ModeEst = { duration: string; cost?: string }

const ALT_MODES: Record<TransitMode, Partial<Record<TransitMode, ModeEst>>> = {
  taxi:      { walk: { duration: '35 min' }, metro: { duration: '18 min', cost: '~€1.50' }, rideshare: { duration: '22 min', cost: '~€14' } },
  walk:      { taxi: { duration: '8 min', cost: '~€10' }, metro: { duration: '12 min', cost: '~€1.50' }, rideshare: { duration: '6 min', cost: '~€8' } },
  metro:     { taxi: { duration: '15 min', cost: '~€12' }, walk: { duration: '22 min' }, rideshare: { duration: '12 min', cost: '~€10' } },
  rideshare: { taxi: { duration: '18 min', cost: '~€12' }, walk: { duration: '18 min' }, metro: { duration: '12 min', cost: '~€1.50' } },
}

const MODES: TransitMode[] = ['taxi', 'walk', 'metro', 'rideshare']

export function S7aTransitOverview({ onLooksGood }: Props) {
  const [legs, setLegs] = useState(INITIAL_LEGS)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [expandedLeg, setExpandedLeg] = useState<number | null>(null)

  function swapMode(legIdx: number, mode: TransitMode) {
    setLegs(prev => prev.map((l, i) => {
      if (i !== legIdx) return l
      const est = ALT_MODES[l.mode][mode]
      return {
        ...l,
        mode,
        duration: est?.duration ?? l.duration,
        cost: est?.cost,
        arrivalNote: l.arrivalNote,
      }
    }))
    setExpandedLeg(null)
  }

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
          Your route.
        </motion.h1>

        <motion.p
          className="text-[16px] text-on-dim mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.04 }}
        >
          How you move between the dots.
        </motion.p>

        {/* Transit legs */}
        <div className="relative">
          {legs.map((leg, i) => {
            const meta = MODE_META[leg.mode]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.05 + i * 0.06 }}
              >
                {/* Origin label */}
                <p className="text-[13px] mb-2" style={{ color: '#9CA3AF' }}>{leg.fromLabel}</p>

                {/* Connector line + leg card */}
                <div className="flex gap-3 mb-2">
                  {/* Dotted connector */}
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className="w-0 flex-1"
                      style={{ borderLeft: '1.5px dashed #E5E7EB', minHeight: 60 }}
                    />
                  </div>

                  {/* Leg card */}
                  <div
                    className="flex-1 rounded-xl mb-2 overflow-hidden"
                    style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    <div className="px-4 py-4">
                      <p className="text-[16px] font-semibold text-on-surface">
                        {meta.icon} {meta.label}
                      </p>
                      <p className="text-[13px] text-on-dim mt-0.5">
                        {leg.duration}
                        {leg.cost ? ` · ${leg.cost}` : ''}
                        {leg.arrivalNote ? ` · ${leg.arrivalNote}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Final destination */}
          <p className="text-[13px]" style={{ color: '#9CA3AF' }}>Cervejaria Ramiro · 19:30</p>
        </div>
      </div>

      {/* Sticky CTA + Customize */}
      <motion.div
        className="px-5 pb-10 pt-4 bg-surface-0 flex flex-col gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.1 }}
      >
        <button
          onClick={onLooksGood}
          className="w-full py-[18px] rounded-2xl font-semibold text-[16px] text-white transition-opacity active:opacity-80"
          style={{ background: '#1A1A1A' }}
        >
          Looks good
        </button>

        <button
          onClick={() => { setCustomizeOpen(v => !v); setExpandedLeg(customizeOpen ? null : 0) }}
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
              {legs.map((leg, i) => {
                const isExpanded = expandedLeg === i
                const meta = MODE_META[leg.mode]

                return (
                  <div key={i} className={i < legs.length - 1 ? 'border-b border-border' : ''}>
                    {/* Leg header */}
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 active:bg-surface-2 transition-colors"
                      onClick={() => setExpandedLeg(isExpanded ? null : i)}
                    >
                      <div className="text-left">
                        <p className="text-[13px] text-on-faint">{leg.fromLabel}</p>
                        <p className="text-[15px] font-medium text-on-surface mt-0.5">
                          {meta.icon} {meta.label} · {leg.duration}
                        </p>
                      </div>
                      <span
                        className="text-[13px] font-medium"
                        style={{ color: '#5B4FE8' }}
                      >
                        {isExpanded ? 'Done' : 'Change'}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pb-3"
                        >
                          <div className="px-4 grid grid-cols-2 gap-2">
                            {MODES.map(m => {
                              const mm = MODE_META[m]
                              const isSelected = leg.mode === m
                              const est = isSelected
                                ? { duration: leg.duration, cost: leg.cost }
                                : ALT_MODES[leg.mode][m]

                              return (
                                <button
                                  key={m}
                                  onClick={() => swapMode(i, m)}
                                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[12px] transition-colors active:opacity-70"
                                  style={isSelected
                                    ? { background: '#1A1A1A', color: '#FFFFFF' }
                                    : { background: '#F5F4F0', color: '#6B7280' }
                                  }
                                >
                                  <span className="text-[22px]">{mm.icon}</span>
                                  <span className="font-medium text-[13px]">{mm.label}</span>
                                  {est && (
                                    <span className="text-[11px] opacity-70">
                                      {est.duration}{est.cost ? ` · ${est.cost}` : ''}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border">
                <button
                  onClick={() => { setCustomizeOpen(false); setLegs(INITIAL_LEGS) }}
                  className="text-[13px] text-on-dim transition-opacity active:opacity-60"
                >
                  Back to recommended
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
