import { useUser } from '@clerk/react'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    title: 'Welcome to Jeevy.',
    subtitle: 'Your personal AI butler is ready. It learns your preferences, handles logistics, and grows with you over time.',
    cta: 'Next →',
  },
  {
    title: 'What your butler can do.',
    subtitle: 'From booking flights to rescheduling meetings — Jeevy handles the details end-to-end.',
    cta: 'Next →',
    prompts: [
      'Book me a direct flight to Berlin next Thursday',
      'Find a hotel near the conference venue in Amsterdam',
      'Reschedule my 3pm call — I have a flight conflict',
      'What do I need to pack for a 4-day business trip to Tokyo?',
    ],
  },
  {
    title: 'Try your first request.',
    subtitle: 'Type anything — your butler will take it from here.',
    cta: 'Go to my dashboard →',
  },
]

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [completing, setCompleting] = useState(false)

  const handleNext = useCallback(async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }
    // Final step → mark complete
    setCompleting(true)
    try {
      await user?.update({ unsafeMetadata: { onboardingCompleted: true } })
    } catch {
      // Non-fatal — navigate anyway; middleware will re-check
    }
    navigate('/dashboard', { replace: true })
  }, [step, user, navigate])

  const handleSkip = useCallback(async () => {
    // Skip does NOT mark complete — intentional per spec
    navigate('/dashboard', { replace: true })
  }, [navigate])

  const handlePrompt = useCallback((text: string) => {
    sessionStorage.setItem('butler_prefill', text)
    void user?.update({ unsafeMetadata: { onboardingCompleted: true } }).catch(() => {})
    navigate('/dashboard', { replace: true })
  }, [user, navigate])

  if (!isLoaded) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#f5f4f0' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[14px]"
            style={{ background: 'var(--accent)' }}
            aria-hidden="true"
          >
            J
          </div>
          <span className="text-[17px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Jeevy
          </span>
        </div>

        {/* Progress dots */}
        <div
          className="flex gap-2 mb-6"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label="Onboarding progress"
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 24 : 8,
                background: i <= step ? 'var(--accent)' : 'var(--border)',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-4">
          <h1 className="text-[22px] font-bold mb-3" style={{ color: 'var(--text-primary)', lineHeight: 1.25 }}>
            {current.title}
          </h1>
          <p className="text-[15px] mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {current.subtitle}
          </p>

          {/* Example prompts on step 1 */}
          {current.prompts && (
            <ul className="space-y-2 mb-6" aria-label="Example prompts">
              {current.prompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    onClick={() => handlePrompt(prompt)}
                    className="w-full text-left px-4 py-3 rounded-xl text-[14px] transition-colors hover:bg-gray-50 active:bg-gray-100"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}
                    aria-label={`Try this prompt: ${prompt}`}
                  >
                    "{prompt}"
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleNext}
            disabled={completing}
            className="w-full py-3.5 px-6 rounded-xl text-white font-semibold text-[16px] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {completing ? 'Setting up…' : current.cta}
          </button>
        </div>

        {!isLast && (
          <button
            onClick={handleSkip}
            className="w-full text-center text-[13px] py-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
