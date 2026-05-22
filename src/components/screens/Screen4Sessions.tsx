import { motion, AnimatePresence } from 'framer-motion'
import type { FlowState } from '../../hooks/useFlowState'
import { VerbTag } from '../shared/VerbTag'
import { MiniStrip } from '../ministrip/MiniStrip'
import { stagger, dur, ease } from '../../tokens/motion'
import fixture from '../../data/fixture.json'

interface Props { flow: FlowState }

function Checkmark() {
  return (
    <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <motion.path
        d="M3 8.5L6.5 12L13 5"
        stroke="#34c97d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1] }}
      />
    </motion.svg>
  )
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })
}

export function Screen4Sessions({ flow }: Props) {
  const sessions = fixture.sessions
  const selected = flow.selectedSessions

  const conflictedIds = new Set<string>()
  sessions.forEach(s => {
    if (!selected.has(s.id) || !s.conflictDetected) return
    sessions.forEach(other => {
      if (other.id === s.id || !selected.has(other.id)) return
      const sStart = new Date(s.startAt).getTime()
      const sEnd = new Date(s.endAt).getTime()
      const oStart = new Date(other.startAt).getTime()
      const oEnd = new Date(other.endAt).getTime()
      if (sStart < oEnd && oStart < sEnd) {
        conflictedIds.add(s.id)
        conflictedIds.add(other.id)
      }
    })
  })

  const hasConflict = conflictedIds.size > 0

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <VerbTag verb="schedule_event" />
          <h1 className="text-on-surface text-[18px] font-bold mt-0.5">Pick sessions</h1>
        </div>
        <p className="text-on-dim text-[12px]">4 of 7</p>
      </div>

      <AnimatePresence>
        {hasConflict && (
          <motion.div
            className="mx-5 mb-2 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 flex items-start gap-2"
            initial={{ y: -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <span className="text-warning text-sm">⚠</span>
            <p className="text-warning text-[12px] leading-relaxed">
              <span className="font-semibold">Conflict:</span> Two selected sessions overlap. Pick one.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2">
        {sessions.map((session, i) => {
          const isSelected = selected.has(session.id)
          const isConflicted = hasConflict && conflictedIds.has(session.id)

          return (
            <motion.button
              key={session.id}
              onClick={() => flow.toggleSession(session.id)}
              className={`w-full text-left bg-surface-1 rounded-2xl border p-4 transition-colors ${
                isConflicted
                  ? 'border-warning/50'
                  : isSelected
                  ? 'border-accent/50'
                  : 'border-border'
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.sm, ease: ease.out, delay: stagger(i, 40) }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-on-surface font-semibold text-[14px]">{session.title}</p>
                    {session.jeevyRecommended && (
                      <motion.span
                        className="text-[11px]"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.6, repeat: 2, repeatDelay: 1 }}
                      >⭐</motion.span>
                    )}
                  </div>
                  <p className="text-on-dim text-[12px]">{session.speaker}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-on-dim text-[11px]">{fmtTime(session.startAt)}</span>
                    <span className="text-border">·</span>
                    <span className="text-on-dim text-[11px]">{session.room}</span>
                    {isConflicted && (
                      <>
                        <span className="text-border">·</span>
                        <span className="text-warning text-[11px]">overlap</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? 'bg-accent border-accent' : 'border-on-dim/40'
                }`}>
                  <AnimatePresence>
                    {isSelected && <Checkmark />}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-border bg-surface-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-on-dim text-[13px]">{selected.size} selected</span>
          {selected.size > 0 && !hasConflict && (
            <span className="text-success text-[12px]">No conflicts ✓</span>
          )}
        </div>
        <button
          onClick={() => flow.advance(5, 2)}
          disabled={selected.size === 0 || hasConflict}
          className="w-full bg-accent text-white text-[14px] font-semibold py-3.5 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm sessions
        </button>
      </div>

      <MiniStrip flow={flow} />
    </div>
  )
}
