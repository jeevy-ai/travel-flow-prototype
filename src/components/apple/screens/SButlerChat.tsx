import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ChatMessage, Itinerary } from '../../../lib/conciergeApi'
import type { ChatStatus } from '../../../hooks/useButlerChat'

interface Props {
  messages: ChatMessage[]
  status: ChatStatus
  error: string | null
  itinerary: Itinerary | null
  sendMessage: (text: string) => Promise<void>
  onItineraryReady: () => void
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--text-tertiary)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export function SButlerChat({ messages, status, error, itinerary, sendMessage, onItineraryReady }: Props) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  useEffect(() => {
    if (itinerary) {
      const t = setTimeout(() => onItineraryReady(), 800)
      return () => clearTimeout(t)
    }
  }, [itinerary, onItineraryReady])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || status === 'loading') return
    setDraft('')
    void sendMessage(text)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-4 shrink-0">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Your butler · Jeevy</p>
          <h1
            className="font-semibold text-[28px] leading-tight mt-0.5"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Where would you like to go?
          </h1>
        </motion.div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {messages.length === 0 && status === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
            <div
              className="rounded-2xl px-4 py-3 max-w-[85%] text-[15px] leading-relaxed"
              style={{ background: 'var(--bg)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }}
            >
              Hi Noah! Tell me about your trip — destination and dates — and I'll build a personalised itinerary just for you.
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="rounded-2xl px-4 py-3 max-w-[82%] text-[15px] leading-relaxed"
                style={
                  msg.role === 'user'
                    ? { background: 'var(--text-primary)', color: 'var(--bg)' }
                    : { background: 'var(--bg)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }
                }
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex justify-start"
          >
            <div
              className="rounded-2xl max-w-[82%]"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-card)' }}
            >
              <TypingDots />
            </div>
          </motion.div>
        )}

        {status === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex justify-start"
          >
            <div
              className="rounded-2xl px-4 py-3 max-w-[82%] text-[14px] leading-snug"
              style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
            >
              {error}
              <button
                className="block mt-1 text-[13px] font-medium underline"
                style={{ color: 'var(--danger)' }}
                onClick={() => void sendMessage(messages[messages.length - 2]?.content ?? '')}
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {itinerary && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mt-4 flex justify-start"
          >
            <div
              className="rounded-2xl px-4 py-3 max-w-[82%] text-[14px] leading-snug"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              Your itinerary is ready — opening it now…
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 pb-10 pt-3"
        style={{ background: 'linear-gradient(to top, var(--bg-secondary) 75%, transparent 100%)' }}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            disabled={status === 'loading' || !!itinerary}
            placeholder="Describe your trip…"
            className="flex-1 rounded-full px-5 py-3.5 text-[15px] outline-none disabled:opacity-50"
            style={{
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || status === 'loading' || !!itinerary}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 15V3M9 3L4 8M9 3l5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
