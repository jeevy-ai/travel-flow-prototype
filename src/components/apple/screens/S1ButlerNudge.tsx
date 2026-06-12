import { motion } from 'framer-motion'
import { useRef, useState } from 'react'

interface Props {
  onSetItUp: (intent: string) => void
  onNotNow: () => void
}

const SUGGESTIONS = [
  'Lisbon for Web Summit, 4 nights in November',
  'Paris weekend trip, early October',
  'Tokyo in cherry blossom season, 7 nights',
]

export function S1ButlerNudge({ onSetItUp, onNotNow }: Props) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSetItUp(text)
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Full-viewport hero */}
      <div className="absolute inset-0">
        <img
          src="/fixture-images/city-lisbon.webp"
          alt="Lisbon cityscape"
          className="w-full h-full object-cover"
          style={{ filter: 'saturate(0.9) brightness(0.8)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 50%, transparent 75%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col flex-1 justify-end">
        <motion.div
          className="px-6 pb-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.1 }}
        >
          <p className="text-white/60 text-[12px] mb-1.5 tracking-widest uppercase font-mono">
            Jeevy · Your concierge
          </p>
          <h1
            className="text-white font-semibold leading-tight"
            style={{ fontSize: 30, letterSpacing: '-0.025em' }}
          >
            Where would you<br />like to go?
          </h1>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          className="px-6 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setDraft(s); inputRef.current?.focus() }}
                className="shrink-0 text-[12px] px-3 py-1.5 rounded-full transition-opacity active:opacity-60"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Input + CTA */}
        <motion.div
          className="px-5 pt-2 pb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Describe your trip…"
              autoFocus
              className="flex-1 rounded-2xl px-4 py-4 text-[15px] outline-none"
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: 'var(--text-primary)',
                border: 'none',
                boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
              }}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 active:scale-95"
              style={{ background: 'var(--accent)', boxShadow: '0 2px 12px rgba(28,110,242,0.4)' }}
              aria-label="Plan my trip"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 17V3M10 3L5 8M10 3l5 5"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          <button
            onClick={onNotNow}
            className="w-full text-center text-[14px] py-2 transition-opacity active:opacity-60"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Not now
          </button>
        </motion.div>
      </div>
    </div>
  )
}
