import { useUser, UserButton } from '@clerk/react'
import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'

const QUICK_ACTIONS = [
  { emoji: '✈️', label: 'Plan a trip', prompt: 'Help me plan a trip' },
  { emoji: '📅', label: 'Check my schedule', prompt: 'What does my schedule look like this week?' },
  { emoji: '🏨', label: 'Book a hotel', prompt: 'Find me a hotel' },
  { emoji: '💌', label: 'Draft an email', prompt: 'Help me draft a professional email' },
]

type SendState = 'idle' | 'sending' | 'done'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [input, setInput] = useState('')
  const [sendState, setSendState] = useState<SendState>('idle')
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Restore prefill from onboarding prompt selection
  useEffect(() => {
    const prefill = sessionStorage.getItem('butler_prefill')
    if (prefill) {
      setInput(prefill)
      sessionStorage.removeItem('butler_prefill')
      inputRef.current?.focus()
    }
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim()) return
    setSendState('sending')
    await new Promise((r) => setTimeout(r, 300))
    setSendState('done')
    setToast("Your butler is being set up. Check back shortly.")
    setInput('')
    setTimeout(() => setToast(null), 4000)
    setSendState('idle')
  }, [input])

  const handleQuickAction = useCallback((prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void handleSend()
      }
    },
    [handleSend],
  )

  const greeting = () => {
    const hour = new Date().getHours()
    const name = user?.firstName ?? 'there'
    if (hour < 12) return `Good morning, ${name}.`
    if (hour < 17) return `Good afternoon, ${name}.`
    return `Good evening, ${name}.`
  }

  if (!isLoaded) return null

  return (
    <div className="min-h-screen" style={{ background: '#f5f4f0' }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{ background: '#f5f4f0', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[13px]"
            style={{ background: 'var(--accent)' }}
            aria-hidden="true"
          >
            J
          </div>
          <span className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Jeevy
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/account-settings"
            className="text-[13px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Settings
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto">
        {/* Greeting */}
        <h1 className="text-[26px] font-bold mb-6" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {greeting()}
        </h1>

        {/* Butler input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What can I help you with?"
            rows={3}
            className="w-full resize-none text-[15px] outline-none placeholder:text-gray-400"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font)' }}
            aria-label="Message your butler"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || sendState === 'sending'}
              className="px-4 py-2 rounded-lg text-white text-[14px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
              aria-label="Send message to butler"
            >
              {sendState === 'sending' ? '…' : 'Send'}
            </button>
          </div>
        </div>

        {/* Quick actions 2×2 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {QUICK_ACTIONS.map(({ emoji, label, prompt }) => (
            <button
              key={label}
              onClick={() => handleQuickAction(prompt)}
              className="bg-white rounded-2xl p-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 shadow-sm"
              aria-label={label}
            >
              <span className="block text-[22px] mb-1.5" aria-hidden="true">{emoji}</span>
              <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent activity
          </h2>
          <ul aria-label="Recent butler activity">
            <li className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
                Send your first message
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Your butler will log what it handles here.
              </p>
            </li>
          </ul>
        </div>

        {/* Beta note card */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--accent-light)', border: '1px solid rgba(28,110,242,0.15)' }}
        >
          <p className="text-[13px]" style={{ color: 'var(--accent)', lineHeight: 1.5 }}>
            <strong>Beta access.</strong> You're among the first to use Jeevy. Expect rapid improvements — and feel free to share feedback directly via the butler.
          </p>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-white text-[14px] font-medium shadow-lg z-50"
          style={{ background: 'var(--text-primary)' }}
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
