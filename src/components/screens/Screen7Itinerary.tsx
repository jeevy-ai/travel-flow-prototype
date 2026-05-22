import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { FlowState } from '../../hooks/useFlowState'
import { ProgressRing } from '../shared/ProgressRing'
import { Popover } from '../shared/Popover'
import { MiniStrip } from '../ministrip/MiniStrip'
import { stagger, dur, ease } from '../../tokens/motion'

interface Props { flow: FlowState }

interface DayGroup {
  date: string
  label: string
  items: DayItem[]
}

interface DayItem {
  id: string
  time: string
  icon: string
  title: string
  subtitle: string
  type: string
  detail?: string
}

const days: DayGroup[] = [
  {
    date: '2025-06-02',
    label: 'Mon Jun 2 · Travel Day',
    items: [
      { id: 'd1-1', time: '08:15', icon: '✈', title: 'LH 064 · CPH → FRA', subtitle: 'Terminal 2 · Seat 14C aisle', type: 'flight', detail: 'Departs 08:15, arrives 10:20. Carry-on only. Star Alliance Gold lane.' },
      { id: 'd1-2', time: '11:35', icon: '✈', title: 'LH 454 · FRA → SFO', subtitle: 'Terminal 1 · Seat 22A window', type: 'flight', detail: 'Departs 11:35, arrives 14:00 local. Meal service included.' },
      { id: 'd1-3', time: '16:00', icon: '🏨', title: 'Check in · Hyatt Centric', subtitle: 'Fisherman\'s Wharf · King room', type: 'hotel' },
      { id: 'd1-4', time: '19:30', icon: '🍽', title: 'Dinner · Zuni Café', subtitle: 'Market St · Italian-Californian', type: 'dinner' },
    ]
  },
  {
    date: '2025-06-03',
    label: 'Tue Jun 3 · SaaStr Day 1',
    items: [
      { id: 'd2-1', time: '09:00', icon: '📋', title: 'Opening Keynote', subtitle: 'Main Stage', type: 'session', detail: 'Keynote address. Room capacity 3000.' },
      { id: 'd2-2', time: '11:00', icon: '📋', title: 'From Zero to IPO', subtitle: 'Jason Lemkin · Stage A', type: 'session', detail: 'Recommended based on your growth-stage profile. ⭐' },
      { id: 'd2-3', time: '13:00', icon: '🍱', title: 'Lunch break', subtitle: 'Expo Hall · Level 2', type: 'break' },
      { id: 'd2-4', time: '19:30', icon: '🍽', title: 'Dinner · Nopalito', subtitle: 'Inner Sunset · Mexican', type: 'dinner' },
    ]
  },
  {
    date: '2025-06-04',
    label: 'Wed Jun 4 · SaaStr Day 2',
    items: [
      { id: 'd3-1', time: '10:00', icon: '📋', title: 'AI in B2B SaaS', subtitle: 'Track 3 · Room 204', type: 'session' },
      { id: 'd3-2', time: '14:30', icon: '📋', title: 'Customer Success at Scale', subtitle: 'Track 1 · Main Stage', type: 'session' },
      { id: 'd3-3', time: '18:00', icon: '🍸', title: 'Networking happy hour', subtitle: 'Rooftop · Level 4', type: 'break' },
    ]
  },
  {
    date: '2025-06-05',
    label: 'Thu Jun 5 · Travel Home',
    items: [
      { id: 'd4-1', time: '10:00', icon: '🏨', title: 'Check out', subtitle: 'Hyatt Centric', type: 'hotel' },
      { id: 'd4-2', time: '14:50', icon: '✈', title: 'LH 455 · SFO → FRA', subtitle: 'Seat 14A window', type: 'flight', detail: 'Arrives Frankfurt Thu 23:00 local.' },
    ]
  }
]

export function Screen7Itinerary({ flow }: Props) {
  const [shimmerDone, setShimmerDone] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DayItem | null>(null)
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set())
  const shimmerControls = useAnimation()
  const enrichmentCount = [0,1,2,3,4].filter(b => flow.hasEnrichment(b)).length
  const readyPercent = Math.round((enrichmentCount / 5) * 100)

  useEffect(() => {
    shimmerControls.start({
      x: ['calc(-100%)', 'calc(200%)'],
      transition: { duration: 0.8, ease: 'easeOut' }
    }).then(() => setShimmerDone(true))
  }, [shimmerControls])

  const toggleDay = (date: string) => {
    setCollapsedDays(prev => {
      const next = new Set(prev)
      next.has(date) ? next.delete(date) : next.add(date)
      return next
    })
  }

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      <div className="relative px-5 pt-10 pb-5 overflow-hidden">
        {!shimmerDone && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
            animate={shimmerControls}
          />
        )}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-on-dim text-[11px] uppercase tracking-wider font-medium mb-1">Your itinerary</p>
            <motion.h1
              className="text-on-surface text-[22px] font-bold tracking-tight leading-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.md, ease: ease.out, delay: 0.3 }}
            >
              SaaStr Annual<br />
              <span className="text-accent">San Francisco</span>
            </motion.h1>
            <motion.p
              className="text-on-dim text-[13px] mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: dur.md, delay: 0.45 }}
            >Jun 2–5 · 4 days</motion.p>
          </div>

          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.35 }}
          >
            <ProgressRing percent={readyPercent} size={52} stroke={3} />
            <p className="text-on-dim text-[10px]">{readyPercent}% ready</p>
          </motion.div>
        </div>

        <AnimatePresence>
          {readyPercent === 100 && (
            <motion.div
              className="mt-3 bg-success/10 border border-success/30 rounded-xl px-3 py-2.5 flex items-center gap-2"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className="text-success text-base">✓</span>
              <p className="text-success text-[13px] font-semibold">Trip ready — everything's booked!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-4">
        {days.map((day, di) => {
          const isCollapsed = collapsedDays.has(day.date)
          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.md, ease: ease.out, delay: stagger(di, 80) + 0.2 }}
            >
              <button
                onClick={() => toggleDay(day.date)}
                className="w-full flex items-center justify-between mb-2"
              >
                <p className="text-on-dim text-[11px] uppercase tracking-wider font-semibold">{day.label}</p>
                <motion.span
                  className="text-on-dim text-[12px]"
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                >▾</motion.span>
              </button>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    className="flex flex-col gap-1.5 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {day.items.map((item, ii) => (
                      <motion.button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="w-full text-left flex items-center gap-3 bg-surface-1 rounded-xl border border-border p-3 hover:border-accent/30 transition-colors"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: dur.sm, ease: ease.out, delay: stagger(ii, 30) }}
                      >
                        <span className="text-base w-6 text-center flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface text-[13px] font-medium truncate">{item.title}</p>
                          <p className="text-on-dim text-[11px] truncate">{item.subtitle}</p>
                        </div>
                        <span className="text-on-dim text-[11px] font-mono flex-shrink-0">{item.time}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <MiniStrip flow={flow} />

      <Popover
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title}
      >
        {selectedItem && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedItem.icon}</span>
              <div>
                <p className="text-on-dim text-[12px]">{selectedItem.time}</p>
                <p className="text-on-surface text-[13px]">{selectedItem.subtitle}</p>
              </div>
            </div>
            {selectedItem.detail && (
              <p className="text-on-dim text-[13px] leading-relaxed">{selectedItem.detail}</p>
            )}
          </div>
        )}
      </Popover>
    </div>
  )
}
