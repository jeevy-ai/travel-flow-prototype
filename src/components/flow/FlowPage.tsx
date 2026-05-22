import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlowEngine } from '../../hooks/useFlowEngine'
import { AppHeader } from '../layout/AppHeader'
import { StepProgress } from './StepProgress'
import { ConfirmedEntryCard } from './ConfirmedEntryCard'
import { GhostCard } from '../timeline/GhostCard'
import { Screen1TripDetection } from '../screens/Screen1TripDetection'
import { Screen2FlightSelection } from '../screens/Screen2FlightSelection'
import { Screen3HotelSelection } from '../screens/Screen3HotelSelection'
import { Screen4Sessions } from '../screens/Screen4Sessions'
import { Screen5Restaurants } from '../screens/Screen5Restaurants'
import { Screen6PackingList } from '../screens/Screen6PackingList'
import { Screen7Itinerary } from '../screens/Screen7Itinerary'

// Maps entry ID → which chatScreen owns it
const SCREEN_FOR_ENTRY: Record<string, number> = {
  flt_outbound: 2,
  flt_return: 2,
  hotel_main: 3,
  'WS2026-K01': 4,
  'WS2026-K02': 4,
  'WS2026-K08': 4,
  'WS2026-W07': 4,
  reminders: 6,
}

function ActiveScreen({ flow, screenNumber }: { flow: ReturnType<typeof useFlowEngine>; screenNumber: number }) {
  switch (screenNumber) {
    case 1: return <Screen1TripDetection flow={flow} />
    case 2: return <Screen2FlightSelection flow={flow} />
    case 3: return <Screen3HotelSelection flow={flow} />
    case 4: return <Screen4Sessions flow={flow} />
    case 5: return <Screen5Restaurants flow={flow} />
    case 6: return <Screen6PackingList flow={flow} />
    case 7: return <Screen7Itinerary flow={flow} />
    default: return null
  }
}

export function FlowPage() {
  const flow = useFlowEngine()
  const activeScreenRef = useRef<HTMLDivElement>(null)

  const confirmedEntries = flow.entries.filter(
    e => e.state === 'confirmed' || e.state === 'calendar-synced'
  )
  const ghostEntries = flow.entries.filter(
    e => e.state === 'ghost' && (SCREEN_FOR_ENTRY[e.id] ?? 99) > flow.chatScreen
  )

  const displayScreen = flow.editingScreen ?? flow.chatScreen
  const isEditing = flow.editingScreen !== null
  const allDone = flow.chatScreen === 7 && confirmedEntries.length === flow.entries.length

  // Scroll active booking panel into view when screen advances
  useEffect(() => {
    if (flow.chatScreen > 1 && activeScreenRef.current) {
      setTimeout(() => {
        activeScreenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    }
  }, [flow.chatScreen])

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <AppHeader confirmedCount={flow.confirmedCount} totalCount={flow.totalCount} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto pb-20">

          {/* Step progress */}
          {flow.chatScreen > 1 && (
            <StepProgress
              chatScreen={flow.chatScreen}
              confirmedCount={flow.confirmedCount}
              totalCount={flow.totalCount}
            />
          )}

          {/* Screen 1 — trip detection (full width, no confirmed entries yet) */}
          {flow.chatScreen === 1 && (
            <div className="px-4 pt-6">
              <Screen1TripDetection flow={flow} />
            </div>
          )}

          {/* Confirmed entry cards */}
          {flow.chatScreen > 1 && (
            <div className="px-4 space-y-3 mt-3">
              {confirmedEntries.map((entry, i) => (
                <ConfirmedEntryCard
                  key={entry.id}
                  entry={entry}
                  flow={flow}
                  staggerIndex={i}
                />
              ))}
            </div>
          )}

          {/* Active booking step — current screen or edit screen */}
          {flow.chatScreen > 1 && flow.chatScreen < 8 && (
            <div ref={activeScreenRef} className="px-4 mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`screen-${displayScreen}-${isEditing ? 'edit' : 'main'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                >
                  {isEditing && (
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-on-dim text-[12px] font-medium">Editing…</span>
                      <button
                        onClick={() => flow.stopEditScreen()}
                        className="text-on-dim text-[12px] hover:text-on-surface transition-colors flex items-center gap-1"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}

                  <div className="bg-surface-1 rounded-2xl border border-border overflow-hidden">
                    {!allDone && <ActiveScreen flow={flow} screenNumber={displayScreen} />}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Day-of plan link when all done */}
          {allDone && (
            <div className="px-4 mt-6">
              <a
                href="#/itinerary/ws2026/day-of"
                className="block w-full text-center bg-accent text-white font-semibold text-[14px] py-3.5 rounded-xl hover:bg-accent/90 transition-colors"
              >
                View day-of plan →
              </a>
            </div>
          )}

          {/* Ghost entries for future steps */}
          {ghostEntries.length > 0 && (
            <div className="px-4 mt-4 space-y-3">
              {ghostEntries.map(entry => (
                <GhostCard
                  key={entry.id}
                  entry={entry}
                  onLetJeevyArrange={() => flow.proposeEntry(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
