import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useState } from 'react'
import { S1ButlerNudge } from './screens/S1ButlerNudge'
import { S2PrefsConfirm } from './screens/S2PrefsConfirm'
import { S3FlightSelection } from './screens/S3FlightSelection'
import { S4HotelSelection } from './screens/S4HotelSelection'
import { S5SessionSync } from './screens/S5SessionSync'
import { S6ConflictResolution } from './screens/S6ConflictResolution'
import { S7ReminderSetup } from './screens/S7ReminderSetup'
import { S8ItineraryPeak } from './screens/S8ItineraryPeak'

type Screen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

const SCREEN_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
}

export function AppleFlowPage() {
  const [screen, setScreen] = useState<Screen>(1)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 gap-4">
        <p className="text-on-dim text-[16px]">Come back when you're ready.</p>
        <button
          onClick={() => { setDismissed(false); setScreen(1) }}
          className="text-[15px] font-medium text-on-surface underline"
        >
          Start over
        </button>
      </div>
    )
  }

  const next = (to: Screen) => setScreen(to)

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Mobile-centered content frame */}
      <div className="mx-auto" style={{ maxWidth: 430 }}>
        <AnimatePresence mode="wait">
          {screen === 1 && (
            <motion.div key="s1" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S1ButlerNudge
                onSetItUp={() => next(2)}
                onNotNow={() => setDismissed(true)}
              />
            </motion.div>
          )}

          {screen === 2 && (
            <motion.div key="s2" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S2PrefsConfirm
                onLooksRight={() => next(3)}
                onEdit={() => next(3)}
              />
            </motion.div>
          )}

          {screen === 3 && (
            <motion.div key="s3" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S3FlightSelection
                onBook={() => next(4)}
                onSeeAlts={() => {}}
              />
            </motion.div>
          )}

          {screen === 4 && (
            <motion.div key="s4" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S4HotelSelection
                onBook={() => next(5)}
                onDifferentHotel={() => {}}
              />
            </motion.div>
          )}

          {screen === 5 && (
            <motion.div key="s5" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S5SessionSync
                onAddToCalendar={() => next(6)}
                onSkip={() => next(7)}
              />
            </motion.div>
          )}

          {screen === 6 && (
            <motion.div key="s6" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S6ConflictResolution
                onKeepSession={() => next(7)}
                onKeepMeeting={() => next(7)}
              />
            </motion.div>
          )}

          {screen === 7 && (
            <motion.div key="s7" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S7ReminderSetup
                onAllSet={() => next(8)}
              />
            </motion.div>
          )}

          {screen === 8 && (
            <motion.div key="s8" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S8ItineraryPeak />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
