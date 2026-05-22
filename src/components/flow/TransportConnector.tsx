import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineEntry, FlowEngine } from '../../hooks/useFlowEngine'

type TransportMode = 'taxi' | 'transit' | 'walk'

const MODE_OPTIONS: {
  id: TransportMode
  icon: string
  label: string
  providerLabel?: string
  providerBg?: string
}[] = [
  { id: 'taxi', icon: '🚗', label: 'Taxi', providerLabel: 'BOLT', providerBg: '#1CC760' },
  { id: 'transit', icon: '🚌', label: 'Metro' },
  { id: 'walk', icon: '🚶', label: 'Walk' },
]

function parseMins(str: string): number {
  const m = str.match(/(\d+)\s*min/)
  return m ? parseInt(m[1]) : 20
}

interface Props {
  entry: TimelineEntry
  flow: FlowEngine
}

export function TransportConnector({ entry, flow }: Props) {
  const [modePickerOpen, setModePickerOpen] = useState(false)
  const mode = (entry.transportMode ?? 'taxi') as TransportMode

  const from = String(entry.data['from'] ?? '').split('(')[0].split(',')[0].trim()
  const to = String(entry.data['to'] ?? '').split('(')[0].split(',')[0].trim()
  const baseDurationStr = String(entry.data['duration'] ?? '~20 min')
  const baseMins = parseMins(baseDurationStr)
  const baseCost = String(entry.data['cost'] ?? '')

  const modeData: Record<TransportMode, { duration: string; cost: string }> = {
    taxi: { duration: baseDurationStr, cost: baseCost },
    transit: { duration: `~${baseMins + 10} min`, cost: '€1.80' },
    walk: { duration: `~${baseMins + 20} min`, cost: 'Free' },
  }

  const current = modeData[mode]
  const currentOpt = MODE_OPTIONS.find(o => o.id === mode)!

  const time = entry.scheduledAt
    ? (entry.scheduledAt.match(/T(\d{2}:\d{2})/)?.[1] ?? '')
    : ''

  return (
    <div data-entry-id={entry.id} className="flex flex-col items-center -my-0.5">
      {/* Top connecting line */}
      <div className="w-0.5 h-3 bg-border/50 rounded-full" />

      {/* Transport pill */}
      <div className="flex items-center gap-1.5 bg-surface-0 border border-border/50 rounded-full px-2.5 py-1.5 max-w-full shadow-sm">
        {/* Provider badge / mode icon */}
        {mode === 'taxi' && currentOpt.providerLabel ? (
          <div
            className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: currentOpt.providerBg }}
          >
            <span className="text-[6px] font-black text-white leading-none tracking-tight">
              {currentOpt.providerLabel}
            </span>
          </div>
        ) : (
          <span className="text-[13px] shrink-0 leading-none">{currentOpt.icon}</span>
        )}

        {/* Route */}
        <p className="text-on-dim text-[11px] truncate max-w-[180px]">
          {from} → {to}
        </p>

        {time && (
          <>
            <span className="text-on-dim/30 text-[10px]">·</span>
            <span className="text-on-dim/60 text-[10px] shrink-0">{time}</span>
          </>
        )}

        <span className="text-on-dim/30 text-[10px]">·</span>
        <span className="text-on-dim/70 text-[10px] shrink-0">{current.duration}</span>
        <span className="text-on-dim/30 text-[10px]">·</span>
        <span className="text-on-surface text-[10px] font-semibold shrink-0">{current.cost}</span>

        {/* Change button */}
        <button
          onClick={() => setModePickerOpen(v => !v)}
          className={`text-[11px] shrink-0 ml-0.5 transition-colors px-1.5 py-0.5 rounded-full ${
            modePickerOpen
              ? 'text-accent bg-accent/10'
              : 'text-on-dim/50 hover:text-accent hover:bg-accent/8'
          }`}
          title="Change transport mode"
        >
          ⇄
        </button>
      </div>

      {/* Mode picker */}
      <AnimatePresence>
        {modePickerOpen && (
          <motion.div
            className="w-full overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-surface-1 border border-border rounded-2xl p-3 mt-1.5 mx-auto max-w-xs">
              <p className="text-on-dim text-[10px] font-mono uppercase tracking-wide mb-2">
                Transport preference
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MODE_OPTIONS.map(opt => {
                  const data = modeData[opt.id]
                  const isSelected = mode === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        flow.setRideMode(entry.id, opt.id)
                        setModePickerOpen(false)
                      }}
                      className={`flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-surface-2 hover:bg-surface-3'
                      }`}
                    >
                      {opt.id === 'taxi' && opt.providerLabel ? (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center mb-0.5"
                          style={{ background: opt.providerBg }}
                        >
                          <span className="text-[7px] font-black text-white leading-none">
                            {opt.providerLabel}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[20px] mb-0.5 leading-none">{opt.icon}</span>
                      )}
                      <p className={`text-[10px] font-semibold ${isSelected ? 'text-accent' : 'text-on-surface'}`}>
                        {opt.label}
                      </p>
                      <p className="text-on-dim text-[9px]">{data.duration}</p>
                      <p className={`text-[9px] font-medium ${isSelected ? 'text-accent/80' : 'text-on-dim'}`}>
                        {data.cost}
                      </p>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setModePickerOpen(false)}
                className="w-full text-center text-on-dim/50 text-[10px] mt-2 hover:text-on-dim transition-colors"
              >
                ✕ Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom connecting line */}
      {!modePickerOpen && <div className="w-0.5 h-3 bg-border/50 rounded-full" />}
    </div>
  )
}
