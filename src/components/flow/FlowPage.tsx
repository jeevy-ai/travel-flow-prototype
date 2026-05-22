import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlowEngine } from '../../hooks/useFlowEngine'
import { AppHeader } from '../layout/AppHeader'
import { ConfirmedEntryCard } from './ConfirmedEntryCard'
import { Screen2FlightSelection } from '../screens/Screen2FlightSelection'
import { Screen3HotelSelection } from '../screens/Screen3HotelSelection'
import { Screen4Sessions } from '../screens/Screen4Sessions'
import { Screen5Restaurants } from '../screens/Screen5Restaurants'
import { Screen6PackingList } from '../screens/Screen6PackingList'

function SwapScreen({ flow, screenNumber }: { flow: ReturnType<typeof useFlowEngine>; screenNumber: number }) {
  switch (screenNumber) {
    case 2: return <Screen2FlightSelection flow={flow} />
    case 3: return <Screen3HotelSelection flow={flow} />
    case 4: return <Screen4Sessions flow={flow} />
    case 5: return <Screen5Restaurants flow={flow} />
    case 6: return <Screen6PackingList flow={flow} />
    default: return null
  }
}

function ConfirmProgressItem({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className={`text-[16px] w-5 shrink-0 ${done ? 'text-success' : active ? 'text-accent' : 'text-on-dim'}`}>
        {done ? '✓' : active ? '⟳' : '○'}
      </span>
      <span className={`text-[13px] ${done ? 'text-success font-medium' : active ? 'text-on-surface' : 'text-on-dim'}`}>
        {label}
      </span>
    </motion.div>
  )
}

const CONFIRM_STEPS = [
  { ids: ['flt_outbound'], label: 'Outbound flight · UA88 SFO → LIS' },
  { ids: ['flt_return'], label: 'Return flight · UA89 LIS → SFO' },
  { ids: ['hotel_main'], label: 'Marriott Lisbon · 2 nights' },
  { ids: ['WS2026-K01', 'WS2026-K02', 'WS2026-W07', 'WS2026-K08'], label: 'Conference sessions · 4 selected' },
  { ids: ['reminders'], label: 'Packing & departure reminders' },
]

export function FlowPage() {
  const flow = useFlowEngine()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const hasConflict = flow.entries.some(
    e => e.id === 'WS2026-K08' && Boolean(e.data['conflictDetected'])
  ) && !flow.conflictResolved

  const allEntryIds = CONFIRM_STEPS.flatMap(s => s.ids)

  const handleConfirmTrip = () => {
    setShowConfirmModal(false)
    flow.confirmAll(allEntryIds)
  }

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <AppHeader confirmedCount={flow.confirmedCount} totalCount={flow.totalCount} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto pb-40">

          {/* Jeevy intro */}
          <motion.div
            className="px-4 pt-6 pb-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-surface-1 rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-accent text-[14px] font-bold">J</span>
                </div>
                <div>
                  <p className="text-on-surface font-semibold text-[14px] mb-0.5">Jeevy arranged your Web Summit trip</p>
                  <p className="text-on-dim text-[12px] leading-relaxed">
                    Here's your full plan — flights, hotel, and sessions picked using your Platinum status and the conference schedule. Swap anything, then hit <strong className="text-on-surface">Confirm trip</strong> to book everything at once.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Conflict banner */}
          <AnimatePresence>
            {hasConflict && (
              <motion.div
                className="px-4 py-2"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="text-warning text-sm">⚠</span>
                  <p className="text-warning text-[12px] leading-relaxed">
                    <span className="font-semibold">1 schedule overlap</span> — K08 Closing Keynote conflicts with your All-Hands call.{' '}
                    <button
                      onClick={() => flow.startEditScreen(5)}
                      className="underline font-semibold hover:no-underline"
                    >
                      Resolve →
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All pre-planned entries */}
          <div className="px-4 pt-2 space-y-3">
            {flow.entries.map((entry, i) => (
              <ConfirmedEntryCard
                key={entry.id}
                entry={entry}
                flow={flow}
                staggerIndex={i}
              />
            ))}
          </div>

          {/* Post-confirm success */}
          <AnimatePresence>
            {flow.allConfirmed && (
              <motion.div
                className="px-4 mt-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <div className="bg-success/10 border border-success/30 rounded-2xl p-4 text-center mb-4">
                  <p className="text-success font-bold text-[17px]">Trip confirmed ✓</p>
                  <p className="text-on-dim text-[12px] mt-0.5">All bookings placed · Calendar invites sent</p>
                </div>
                <a
                  href="#/itinerary/ws2026/day-of"
                  className="block w-full text-center bg-accent text-white font-semibold text-[14px] py-3.5 rounded-xl hover:bg-accent/90 transition-colors"
                >
                  View day-of plan →
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Confirm-in-progress overlay */}
      <AnimatePresence>
        {flow.confirmingAll && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-surface-0 rounded-t-3xl border-t border-border px-5 pt-5 pb-10"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <p className="text-on-surface font-bold text-[17px] mb-1">Confirming your trip…</p>
              <p className="text-on-dim text-[12px] mb-5">Booking each item in sequence.</p>
              <div className="space-y-3">
                {CONFIRM_STEPS.map((step, i) => (
                  <ConfirmProgressItem
                    key={step.label}
                    label={step.label}
                    done={flow.confirmStep > i}
                    active={flow.confirmStep === i}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-confirm summary modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              className="w-full max-w-md bg-surface-0 rounded-3xl border border-border p-5"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-on-surface font-bold text-[17px] mb-1">Confirm everything?</p>
              <p className="text-on-dim text-[12px] mb-4">Jeevy will book all items below in one go.</p>
              <div className="space-y-2 mb-5">
                {CONFIRM_STEPS.map(step => (
                  <div key={step.label} className="flex items-center gap-2">
                    <span className="text-accent text-[12px]">✦</span>
                    <span className="text-on-surface text-[13px]">{step.label}</span>
                  </div>
                ))}
              </div>
              {hasConflict && (
                <div className="bg-warning/10 border border-warning/30 rounded-xl px-3 py-2 mb-4">
                  <p className="text-warning text-[12px]">⚠ 1 schedule conflict unresolved. You can confirm anyway and resolve later.</p>
                </div>
              )}
              <button
                onClick={handleConfirmTrip}
                className="w-full bg-accent text-white font-bold text-[15px] py-3.5 rounded-xl hover:bg-accent/90 transition-colors mb-2"
              >
                Confirm trip
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full text-on-dim text-[14px] py-2 rounded-xl hover:text-on-surface transition-colors"
              >
                Go back and review
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swap panel slide-up */}
      <AnimatePresence>
        {flow.editingScreen !== null && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => flow.stopEditScreen()}
          >
            <motion.div
              className="w-full max-w-2xl bg-surface-0 rounded-t-3xl border-t border-border overflow-hidden"
              style={{ maxHeight: '85vh' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-center px-5 pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="flex items-center justify-between px-5 pb-2">
                <p className="text-on-dim text-[12px] font-medium">Swap option</p>
                <button
                  onClick={() => flow.stopEditScreen()}
                  className="text-on-dim text-[12px] hover:text-on-surface transition-colors"
                >
                  ✕ Close
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 72px)' }}>
                <SwapScreen flow={flow} screenNumber={flow.editingScreen} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky confirm footer */}
      {!flow.allConfirmed && !flow.confirmingAll && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-surface-0/95 backdrop-blur-sm border-t border-border px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full bg-accent text-white font-bold text-[15px] py-4 rounded-xl hover:bg-accent/90 active:scale-[0.98] transition-all shadow-lg"
            >
              Confirm trip →
            </button>
            <p className="text-center text-on-dim text-[11px] mt-1.5">
              Books flights, hotel &amp; syncs your calendar in one go
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
