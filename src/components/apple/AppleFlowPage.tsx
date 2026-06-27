import { useAuth } from '@clerk/react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useCallback, useState } from 'react'
import { useButlerChat } from '../../hooks/useButlerChat'
import { useButlerProfile } from '../../hooks/useButlerProfile'
import { S1ButlerNudge } from './screens/S1ButlerNudge'
import { SButlerChat } from './screens/SButlerChat'
import { S8ItineraryPeak } from './screens/S8ItineraryPeak'

type Screen = 's1' | 'chat' | 's8'

const SCREEN_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
}

export function AppleFlowPage() {
  const [screen, setScreen] = useState<Screen>('s1')
  const [dismissed, setDismissed] = useState(false)
  const { getToken, isSignedIn } = useAuth()
  const { state: profileState } = useButlerProfile()

  const profile = profileState.status === 'loaded' ? profileState.profile : undefined

  // Stable token getter — only passed when signed in so chat uses auth path
  const getAuthToken = useCallback(() => getToken(), [getToken])
  const butler = useButlerChat({ getToken: isSignedIn ? getAuthToken : undefined })

  const handleIntentSubmit = useCallback((intent: string) => {
    butler.reset()
    void butler.sendMessage(intent)
    setScreen('chat')
  }, [butler])

  const handleStartOver = useCallback(() => {
    butler.reset()
    setScreen('s1')
  }, [butler])

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
                profile={profile ?? null}
              />
            </motion.div>
          )}

          {screen === 'chat' && (
            <motion.div
              key="chat"
              variants={SCREEN_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <SButlerChat
                messages={butler.messages}
                status={butler.status}
                error={butler.error}
                itinerary={butler.itinerary}
                sendMessage={butler.sendMessage}
                onItineraryReady={() => setScreen('s8')}
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
                onStartOver={handleStartOver}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
