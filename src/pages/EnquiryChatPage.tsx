import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ConfirmationGate } from '../components/outbound/ConfirmationGate'
import { useEnquiryChat } from '../hooks/useEnquiryChat'
import type { PendingEnquiryAction } from '../lib/enquiryApi'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-on-dim"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function ReceiptCard({ receiptMessage, to }: { receiptMessage: string; to: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-success/30 bg-success/5 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="text-success text-xl mt-0.5" aria-hidden="true">✓</span>
        <div className="flex-1 min-w-0">
          <p className="text-success font-semibold text-[14px] leading-snug">Email sent</p>
          <p className="text-on-dim text-[13px] mt-1 leading-relaxed">{receiptMessage}</p>
          {to && (
            <p className="text-on-faint text-[12px] mt-1">
              Sent to: <span className="font-mono">{to}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CancelledCard({ summary }: { summary: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-border bg-surface-2 p-4"
    >
      <div className="flex items-center gap-3">
        <span className="text-on-dim text-lg" aria-hidden="true">✕</span>
        <div>
          <p className="text-on-dim font-semibold text-[14px]">Cancelled</p>
          <p className="text-on-faint text-[12px] mt-0.5">{summary}</p>
        </div>
      </div>
    </motion.div>
  )
}

function DispatchingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mt-3"
    >
      <div className="rounded-2xl bg-surface-1 border border-border px-4 py-3 max-w-[82%]">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-accent"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <p className="text-on-dim text-[14px]">Sending email…</p>
        </div>
      </div>
    </motion.div>
  )
}

const DEMO_PROMPTS = [
  'Send an enquiry to Hotel Costes about a 3-night stay in July',
  'Ask The Dorchester about availability for 2 nights in August',
  'Enquire about a corner suite at Claridge\'s for New Year\'s Eve',
]

export function EnquiryChatPage() {
  const { items, status, error, pendingAction, sendMessage, confirmAction, cancelAction } =
    useEnquiryChat()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items, status])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || status === 'loading' || status === 'dispatching') return
    setDraft('')
    void sendMessage(text)
  }

  function handleDemoPrompt(prompt: string) {
    if (status !== 'idle' || pendingAction) return
    setDraft('')
    void sendMessage(prompt)
  }

  const isInputBlocked =
    status === 'loading' || status === 'dispatching' || pendingAction !== null

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 shrink-0">
        <p className="text-[11px] font-mono text-accent uppercase tracking-widest opacity-70 mb-1">
          outbound · email
        </p>
        <h1 className="text-on-surface font-semibold text-[26px] leading-tight" style={{ letterSpacing: '-0.02em' }}>
          Send an Enquiry
        </h1>
        <p className="text-on-dim text-[14px] mt-1">
          Ask the concierge to compose and send an email on your behalf.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Empty state with demo prompts */}
        {items.length === 0 && status === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-3">
            <div
              className="rounded-2xl px-4 py-3 max-w-[85%] text-[15px] leading-relaxed bg-surface-1 text-on-surface"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              Tell me which hotel or venue you'd like to contact and I'll compose an enquiry email for you to review before sending.
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-mono text-on-dim uppercase tracking-widest mb-2 px-1">
                Try one of these
              </p>
              {DEMO_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => handleDemoPrompt(p)}
                  className="block w-full text-left text-[13px] text-on-dim hover:text-accent transition-colors px-3 py-2 rounded-xl hover:bg-surface-1 mb-1"
                >
                  → {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {items.map(item => {
            if (item.type === 'text') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`mt-3 flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="rounded-2xl px-4 py-3 max-w-[82%] text-[15px] leading-relaxed"
                    style={
                      item.role === 'user'
                        ? { background: 'var(--text-primary)', color: 'var(--bg)' }
                        : { background: 'var(--bg)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }
                    }
                  >
                    {item.content}
                  </div>
                </motion.div>
              )
            }

            if (item.type === 'confirmation_gate') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3"
                >
                  <ConfirmationGate
                    action={item.action}
                    onConfirm={() => void confirmAction(item.action as PendingEnquiryAction)}
                    onCancel={() => cancelAction(item.action as PendingEnquiryAction)}
                  />
                </motion.div>
              )
            }

            if (item.type === 'receipt') {
              return (
                <div key={item.id} className="mt-3">
                  <ReceiptCard
                    receiptMessage={item.receipt.receiptMessage}
                    to={item.receipt.to}
                  />
                </div>
              )
            }

            if (item.type === 'cancelled') {
              return (
                <div key={item.id} className="mt-3">
                  <CancelledCard summary={item.summary} />
                </div>
              )
            }

            return null
          })}
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

        {status === 'dispatching' && <DispatchingOverlay />}

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
        {pendingAction && (
          <p className="text-center text-[12px] text-on-faint mb-2">
            Review the email above before sending
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            disabled={isInputBlocked}
            placeholder={isInputBlocked ? 'Waiting for confirmation…' : 'Ask the concierge…'}
            className="flex-1 rounded-full px-5 py-3.5 text-[15px] outline-none disabled:opacity-40"
            style={{
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isInputBlocked}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
            style={{ background: 'var(--accent)' }}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 15V3M9 3L4 8M9 3l5 5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
