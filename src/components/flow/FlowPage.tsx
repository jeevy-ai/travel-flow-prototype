import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlowEngine } from '../../hooks/useFlowEngine'
import type { TimelineEntry } from '../../hooks/useFlowEngine'
import { AppHeader } from '../layout/AppHeader'
import { DateSidebar } from '../layout/DateSidebar'
import { TripMap } from '../map/TripMap'
import type { TripMapHandle } from '../map/TripMap'
import { CompactEntryRow } from './CompactEntryRow'
import { Screen2FlightSelection } from '../screens/Screen2FlightSelection'
import { Screen3HotelSelection } from '../screens/Screen3HotelSelection'
import { Screen4Sessions } from '../screens/Screen4Sessions'
import { Screen5Restaurants } from '../screens/Screen5Restaurants'
import { Screen6PackingList } from '../screens/Screen6PackingList'

// ---- date-grouping helpers ----

function localDateKey(iso: string): string {
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}:\d{2}|Z)/)
  if (match) return match[1]
  return iso.slice(0, 10)
}

const DAY_LABELS: Record<string, { day: string; summary: string }> = {
  '2026-11-09': { day: 'Sun, Nov 9', summary: 'Day 0 — Departure from SFO' },
  '2026-11-10': { day: 'Mon, Nov 10', summary: 'Day 1 — Web Summit opens · Dinner · Fado' },
  '2026-11-11': { day: 'Tue, Nov 11', summary: 'Day 2 — Web Summit · Dinner · Rooftop' },
  '2026-11-12': { day: 'Wed, Nov 12', summary: 'Return to SFO' },
  'before-trip': { day: 'Before your trip', summary: 'Reminders' },
}

interface DayGroup {
  dateKey: string
  label: { day: string; summary: string }
  entries: TimelineEntry[]
}

function groupByDate(entries: TimelineEntry[]): DayGroup[] {
  const map = new Map<string, TimelineEntry[]>()
  for (const entry of entries) {
    const key = entry.scheduledAt ? localDateKey(entry.scheduledAt) : 'before-trip'
    const group = map.get(key) ?? []
    group.push(entry)
    map.set(key, group)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, groupEntries]) => ({
      dateKey,
      label: DAY_LABELS[dateKey] ?? { day: dateKey, summary: '' },
      entries: [...groupEntries].sort((a, b) => {
        if (!a.scheduledAt) return 1
        if (!b.scheduledAt) return -1
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      }),
    }))
}

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
  { ids: ['ride_arrival', 'ride_day2_venue', 'ride_departure'], label: 'Rides · 3 transfers' },
  { ids: ['restaurant_nov10', 'restaurant_nov11'], label: 'Restaurants · 2 dinners' },
  { ids: ['activity_nov10', 'activity_nov11'], label: 'Evening activities · 2 nights' },
  { ids: ['reminders'], label: 'Packing & departure reminders' },
]

export function FlowPage() {
  const flow = useFlowEngine()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [activeDateKey, setActiveDateKey] = useState<string>('2026-11-09')
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const tripMapRef = useRef<TripMapHandle>(null)

  const groups = groupByDate(flow.entries)
  const dayItems = groups.map(g => ({
    dateKey: g.dateKey,
    shortLabel: g.label.day,
    dotLabel: g.dateKey,
    entryCount: g.entries.length,
  }))

  const hasConflict = flow.entries.some(
    e => e.id === 'WS2026-K08' && Boolean(e.data['conflictDetected'])
  ) && !flow.conflictResolved

  const allEntryIds = CONFIRM_STEPS.flatMap(s => s.ids)

  const handleConfirmTrip = () => {
    setShowConfirmModal(false)
    flow.confirmAll(allEntryIds)
  }

  // Scroll to a day section
  const scrollToDay = useCallback((dateKey: string) => {
    const el = sectionRefs.current.get(dateKey)
    if (el && scrollRef.current) {
      const parent = scrollRef.current
      const top = el.offsetTop - 110 // account for headers
      parent.scrollTo({ top, behavior: 'smooth' })
    }
    setActiveDateKey(dateKey)
  }, [])

  const activateEntry = useCallback((id: string) => {
    setActiveEntryId(id)
    tripMapRef.current?.flyToEntry(id)
    tripMapRef.current?.highlightEntry(id)
    setTimeout(() => {
      const el = scrollRef.current?.querySelector(`[data-entry-id="${id}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }, [])

  const deactivateEntry = useCallback(() => {
    setActiveEntryId(null)
    tripMapRef.current?.highlightEntry(null)
  }, [])

  // IntersectionObserver to track active day as user scrolls
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-date-key')
            if (key) setActiveDateKey(key)
          }
        }
      },
      { root: scrollEl, rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )

    sectionRefs.current.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [groups.length])

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <AppHeader confirmedCount={flow.confirmedCount} totalCount={flow.totalCount} />

      {/* Mobile horizontal date strip */}
      <div className="md:hidden">
        <DateSidebar
          days={dayItems}
          activeDateKey={activeDateKey}
          onSelect={scrollToDay}
          variant="horizontal"
        />
      </div>

      {/* Body: sidebar + content + map */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left date sidebar — desktop only */}
        <div className="hidden md:flex w-14 lg:w-16 shrink-0 flex-col border-r border-border bg-surface-0 overflow-y-auto">
          <DateSidebar
            days={dayItems}
            activeDateKey={activeDateKey}
            onSelect={scrollToDay}
            variant="vertical"
          />
        </div>

        {/* Main scrollable content */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-2xl mx-auto pb-40">

            {/* Trip hero header */}
            <motion.div
              className="px-4 pt-5 pb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-accent text-[11px] font-bold tracking-widest uppercase">Jeevy arranged</span>
                </div>
                <h1 className="text-on-surface font-bold text-[22px] leading-tight tracking-tight">
                  Web Summit 2026
                </h1>
                <p className="text-on-dim text-[13px] mt-0.5">Lisbon, Portugal · Nov 9–12</p>
              </div>

              {/* Trip summary strip */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                {[
                  { icon: '✈', label: 'SFO → LIS', sub: 'Non-stop · Business' },
                  { icon: '🏨', label: '2 nights', sub: 'Marriott Bonvoy' },
                  { icon: '🎙', label: '4 sessions', sub: 'Web Summit' },
                  { icon: '💰', label: '$7,058', sub: 'est. total' },
                  { icon: '⭐', label: 'Platinum', sub: 'Status applied' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="shrink-0 bg-surface-1 border border-border rounded-xl px-3 py-2 min-w-[96px]"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[13px]">{stat.icon}</span>
                      <span className="text-on-surface text-[12px] font-semibold">{stat.label}</span>
                    </div>
                    <p className="text-on-dim text-[10px]">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Jeevy note */}
              <div className="flex items-start gap-2 mt-3 bg-accent/8 border border-accent/20 rounded-xl px-3 py-2.5">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-px">
                  <span className="text-accent text-[10px] font-bold">J</span>
                </div>
                <p className="text-on-dim text-[11px] leading-relaxed">
                  Picked using your Delta Platinum + Marriott Bonvoy status. Swap anything, then hit <strong className="text-on-surface">Confirm trip</strong> to book in one go.
                </p>
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

            {/* Date-grouped timeline entries */}
            <div className="px-4 pt-2">
              {groups.map((group, groupIdx) => {
                const baseIndex = flow.entries.findIndex(e => e.id === group.entries[0].id)
                return (
                  <div
                    key={group.dateKey}
                    className={groupIdx > 0 ? 'mt-6' : ''}
                    ref={el => {
                      if (el) sectionRefs.current.set(group.dateKey, el)
                      else sectionRefs.current.delete(group.dateKey)
                    }}
                    data-date-key={group.dateKey}
                  >
                    {/* Sticky day header */}
                    <div className="sticky top-0 z-10 bg-surface-0/95 backdrop-blur-sm pb-2 pt-1.5 -mx-4 px-4">
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-on-surface font-bold text-[15px] tracking-tight">{group.label.day}</span>
                        <span className="text-on-dim/70 text-[11px] font-medium tracking-wide uppercase">{group.label.summary}</span>
                      </div>
                      <div className="mt-1.5 h-px bg-gradient-to-r from-accent/40 via-border to-transparent" />
                    </div>
                    {/* Compact rows for this day */}
                    <div className="space-y-2 mt-2">
                      {group.entries.map((entry, i) => (
                        <CompactEntryRow
                          key={entry.id}
                          entry={entry}
                          flow={flow}
                          staggerIndex={baseIndex + i}
                          isActive={activeEntryId === entry.id}
                          onActivate={activateEntry}
                          onDeactivate={deactivateEntry}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
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

        {/* Right map panel — large desktop only (lg+) */}
        <div className="hidden lg:block w-[360px] xl:w-[420px] shrink-0 border-l border-border relative" style={{ isolation: 'isolate', zIndex: 0 }}>
          <TripMap ref={tripMapRef} className="w-full h-full" onPinClick={activateEntry} />
          {/* Map label */}
          <div className="absolute top-3 left-3 bg-surface-0/80 backdrop-blur-sm border border-border rounded-lg px-2 py-1 pointer-events-none">
            <p className="text-on-surface text-[11px] font-semibold">Lisbon · Nov 2026</p>
            <p className="text-on-dim text-[10px]">7 locations pinned</p>
          </div>
        </div>
      </div>

      {/* Mobile map toggle button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-25">
        <button
          onClick={() => setShowMap(v => !v)}
          className="bg-surface-1 border border-border text-on-surface text-[12px] font-semibold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5"
        >
          🗺 {showMap ? 'Hide map' : 'Map'}
        </button>
      </div>

      {/* Mobile map overlay */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMap(false)}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[60vh] rounded-t-3xl overflow-hidden border-t border-border"
              style={{ isolation: 'isolate' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-3 left-0 right-0 flex justify-center z-10 pointer-events-none">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              <TripMap
                className="w-full h-full"
                onPinClick={(entryId) => {
                  setActiveEntryId(entryId)
                  setShowMap(false)
                  setTimeout(() => {
                    const el = scrollRef.current?.querySelector(`[data-entry-id="${entryId}"]`)
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }, 350)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
