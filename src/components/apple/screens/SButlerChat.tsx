import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useButlerChat } from '../../../hooks/useButlerChat'
import type { Itinerary } from '../../../lib/conciergeApi'

interface Props {
  onItineraryReady: (itinerary: Itinerary) => void
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: '#9CA3AF' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export function SButlerChat({ onItineraryReady }: Props) {
  const { messages, status, error, itinerary, sendMessage } = useButlerChat()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  useEffect(() => {
    if (itinerary) {
      const t = setTimeout(() => onItineraryReady(itinerary), 800)
      return () => clearTimeout(t)
    }
  }, [itinerary, onItineraryReady])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || status === 'loading') return
    setDraft('')
    sendMessage(text)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F7F6F2' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-4 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
        >
          <p className="text-[13px] font-medium" style={{ color: '#9CA3AF' }}>Your butler</p>
          <h1
            className="font-semibold text-[28px] leading-tight mt-0.5"
            style={{ color: '#1A1A1A', letterSpacing: '-0.02em' }}
          >
            Where would you like to go?
          </h1>
        </motion.div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {messages.length === 0 && status === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2"
          >
            <div
              className="rounded-2xl px-4 py-3 max-w-[85%] text-[15px] leading-relaxed"
              style={{ background: '#FFFFFF', color: '#374151', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              Tell me about your trip — destination, dates, who's going — and I'll build your itinerary.
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className={`mt-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="rounded-2xl px-4 py-3 max-w-[82%] text-[15px] leading-relaxed"
                style={
                  msg.role === 'user'
                    ? { background: '#1A1A1A', color: '#FFFFFF' }
                    : { background: '#FFFFFF', color: '#374151', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
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
              style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
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
              style={{ background: '#FEE2E2', color: '#B91C1C' }}
            >
              {error}
              <button
                className="block mt-1 text-[13px] font-medium underline"
                style={{ color: '#DC2626' }}
                onClick={() => sendMessage(messages[messages.length - 2]?.content ?? '')}
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {itinerary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1 }}
            className="mt-4 flex justify-start"
          >
            <div
              className="rounded-2xl px-4 py-3 max-w-[82%] text-[14px] leading-snug"
              style={{ background: '#EEF2FF', color: '#3730A3' }}
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
        style={{ background: 'linear-gradient(to top, #F7F6F2 75%, transparent 100%)' }}
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
              background: '#FFFFFF',
              color: '#1A1A1A',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || status === 'loading' || !!itinerary}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
            style={{ background: '#5B4FE8' }}
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
