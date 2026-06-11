import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useState } from 'react'
import { S1ButlerNudge } from './screens/S1ButlerNudge'
import { S2PrefsConfirm } from './screens/S2PrefsConfirm'
import { S3FlightSelection } from './screens/S3FlightSelection'
import { S4HotelSelection } from './screens/S4HotelSelection'
import { S5SessionSync } from './screens/S5SessionSync'
import { S5bDining } from './screens/S5bDining'
import { S6ConflictResolution } from './screens/S6ConflictResolution'
import { S7ReminderSetup } from './screens/S7ReminderSetup'
import { S7aTransitOverview } from './screens/S7aTransitOverview'
import { S8ItineraryPeak } from './screens/S8ItineraryPeak'

type Screen = 's1' | 's2' | 's3' | 's4' | 's5' | 's5b' | 's6' | 's7' | 's7a' | 's8'

const SCREEN_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
}

export function AppleFlowPage() {
  const [screen, setScreen] = useState<Screen>('s1')
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 gap-4">
        <p className="text-on-dim text-[16px]">Come back when you're ready.</p>
        <button
          onClick={() => { setDismissed(false); setScreen('s1') }}
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
      <div className="mx-auto" style={{ maxWidth: 430 }}>
        <AnimatePresence mode="wait">
          {screen === 's1' && (
            <motion.div key="s1" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S1ButlerNudge
                onSetItUp={() => next('s2')}
                onNotNow={() => setDismissed(true)}
              />
            </motion.div>
          )}

          {screen === 's2' && (
            <motion.div key="s2" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S2PrefsConfirm
                onLooksRight={() => next('s3')}
                onEdit={() => next('s3')}
              />
            </motion.div>
          )}

          {screen === 's3' && (
            <motion.div key="s3" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S3FlightSelection
                onBook={() => next('s4')}
                onSeeAlts={() => {}}
              />
            </motion.div>
          )}

          {screen === 's4' && (
            <motion.div key="s4" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S4HotelSelection
                onBook={() => next('s5')}
                onDifferentHotel={() => {}}
              />
            </motion.div>
          )}

          {screen === 's5' && (
            <motion.div key="s5" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S5SessionSync
                onAddToCalendar={() => next('s5b')}
                onSkip={() => next('s6')}
              />
            </motion.div>
          )}

          {screen === 's5b' && (
            <motion.div key="s5b" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S5bDining
                onReserve={() => next('s6')}
                onSkip={() => next('s6')}
              />
            </motion.div>
          )}

          {screen === 's6' && (
            <motion.div key="s6" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S6ConflictResolution
                onKeepSession={() => next('s7')}
                onKeepMeeting={() => next('s7')}
              />
            </motion.div>
          )}

          {screen === 's7' && (
            <motion.div key="s7" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S7ReminderSetup
                onAllSet={() => next('s7a')}
              />
            </motion.div>
          )}

          {screen === 's7a' && (
            <motion.div key="s7a" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S7aTransitOverview
                onLooksGood={() => next('s8')}
              />
            </motion.div>
          )}

          {screen === 's8' && (
            <motion.div key="s8" variants={SCREEN_VARIANTS} initial="initial" animate="animate" exit="exit">
              <S8ItineraryPeak />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
