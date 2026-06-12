import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useButlerChat } from '../../hooks/useButlerChat'
import { S1ButlerNudge } from './screens/S1ButlerNudge'
import { S8ItineraryPeak } from './screens/S8ItineraryPeak'

type Screen = 's1' | 's8'

const SCREEN_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
}

export function AppleFlowPage() {
  const [screen, setScreen] = useState<Screen>('s1')
  const [dismissed, setDismissed] = useState(false)
  const butler = useButlerChat()

  // Navigate to itinerary canvas as soon as API itinerary arrives
  useEffect(() => {
    if (butler.itinerary && screen === 's1') {
      setScreen('s8')
    }
  }, [butler.itinerary, screen])

  if (dismissed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-0 gap-4">
        <p className="text-on-dim text-[16px]">Come back when you're ready.</p>
        <button
          onClick={() => {
            setDismissed(false)
            setScreen('s1')
            butler.reset()
          }}
          className="text-[15px] font-medium text-on-surface underline"
        >
          Start over
        </button>
      </div>
    )
  }

  function handleIntentSubmit(intent: string) {
    // Fire the API call immediately — navigate to s8 at once so the
    // user lands on the itinerary canvas without waiting
    void butler.sendMessage(intent)
    setScreen('s8')
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="mx-auto" style={{ maxWidth: 430 }}>
        <AnimatePresence mode="wait">
          {screen === 's1' && (
            <motion.div
              key="s1"
              variants={SCREEN_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <S1ButlerNudge
                onSetItUp={handleIntentSubmit}
                onNotNow={() => setDismissed(true)}
              />
            </motion.div>
          )}

          {screen === 's8' && (
            <motion.div
              key="s8"
              variants={SCREEN_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <S8ItineraryPeak
                itinerary={butler.itinerary}
                alterPlan={butler.alterPlan}
                alterStatus={butler.status === 'altering' ? 'altering' : 'idle'}
                loadStatus={butler.status === 'loading' ? 'loading' : butler.status === 'error' ? 'error' : 'idle'}
                onStartOver={() => {
                  butler.reset()
                  setScreen('s1')
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
