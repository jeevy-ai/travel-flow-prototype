import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { OutboundAction, OutboundRiskClass } from './types'

interface RiskConfig {
  label: string
  className: string
  icon: string
}

const RISK_CONFIGS: Record<OutboundRiskClass, RiskConfig> = {
  safe:         { label: 'Safe',         icon: '✓',  className: 'bg-success/10 text-success' },
  reversible:   { label: 'Reversible',   icon: '↩',  className: 'bg-accent/10 text-accent' },
  irreversible: { label: 'Irreversible', icon: '⚠',  className: 'bg-warning/10 text-warning' },
  paid:         { label: 'Paid action',  icon: '💳', className: 'bg-danger/10 text-danger' },
  identity:     { label: 'Uses identity','icon': '🔑', className: 'bg-state-custom/10 text-state-custom' },
}

const CHANNEL_LABELS: Record<OutboundAction['channel'], string> = {
  email:       '✉ Email',
  form_submit: '📋 Form',
  api_call:    '⚡ API',
}

interface Props {
  action: OutboundAction
  onConfirm: (actionId: string) => void
  onCancel: (actionId: string) => void
}

export function ConfirmationGate({ action, onConfirm, onCancel }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isPaid = action.riskClass === 'paid'
  const risk = RISK_CONFIGS[action.riskClass]

  return (
    <motion.div
      className="w-full rounded-2xl border border-border bg-surface-1 overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="region"
      aria-label="Action confirmation"
    >
      {/* Risk stripe — color-coded left border */}
      <div
        className={`h-1 w-full ${
          isPaid             ? 'bg-danger'       :
          action.riskClass === 'irreversible' ? 'bg-warning' :
          action.riskClass === 'identity'     ? 'bg-state-custom' :
          action.riskClass === 'reversible'   ? 'bg-accent' :
          'bg-success'
        }`}
      />

      <div className="p-4">
        {/* Header row: channel + risk badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-medium text-on-dim bg-surface-2 px-2 py-0.5 rounded-md">
            {CHANNEL_LABELS[action.channel]}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${risk.className}`}>
            <span aria-hidden="true">{risk.icon}</span>
            {risk.label}
          </span>
        </div>

        {/* Human summary */}
        <p className="text-on-surface font-semibold text-[15px] leading-snug mb-2">
          {action.humanSummary}
        </p>

        {/* Recipient + subject */}
        <div className="flex flex-col gap-0.5 mb-3">
          <p className="text-on-dim text-[13px]">
            <span className="text-on-faint">To: </span>
            {action.recipient}
          </p>
          {action.subject && (
            <p className="text-on-dim text-[13px]">
              <span className="text-on-faint">Subject: </span>
              {action.subject}
            </p>
          )}
        </div>

        {/* Expandable preview */}
        <div className="mb-3">
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent/80 transition-colors"
            aria-expanded={expanded}
            aria-controls="body-preview"
          >
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              aria-hidden="true"
            >
              ›
            </motion.span>
            {expanded ? 'Hide preview' : 'Show preview'}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                id="body-preview"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded-xl bg-surface-2 border border-border p-3">
                  <p className="text-on-dim text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                    {action.bodyPreview}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cost row (paid actions only) */}
        {action.isPaid && action.estimatedCost !== undefined && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-danger/5 border border-danger/20">
            <span className="text-danger text-[13px]" aria-hidden="true">💳</span>
            <p className="text-danger text-[13px] font-medium">
              Estimated cost:{' '}
              <span className="font-semibold">
                {action.currency ?? 'USD'} {action.estimatedCost.toFixed(2)}
              </span>
            </p>
          </div>
        )}

        {/* CTA area */}
        {isPaid ? (
          /* Locked state for paid actions */
          <div className="flex flex-col gap-3">
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-danger/5 border border-danger/20"
              role="status"
              aria-label="Board approval required"
            >
              <span className="text-danger text-lg" aria-hidden="true">🔒</span>
              <div>
                <p className="text-danger text-[13px] font-semibold leading-snug">Board approval required</p>
                <p className="text-danger/70 text-[12px] leading-tight mt-0.5">
                  Paid actions cannot be sent without board sign-off.
                </p>
              </div>
            </div>
            <button
              onClick={() => onCancel(action.id)}
              className="w-full py-3 rounded-xl border border-border text-on-dim text-[14px] font-medium hover:text-on-surface hover:border-on-dim transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Normal confirm/cancel pair */
          <div className="flex gap-2.5">
            <button
              onClick={() => onConfirm(action.id)}
              className="flex-1 bg-accent text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-accent/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              aria-label={`Confirm: ${action.humanSummary}`}
            >
              Send
            </button>
            <button
              onClick={() => onCancel(action.id)}
              className="px-5 py-3 rounded-xl border border-border text-on-dim text-[14px] font-medium hover:text-on-surface hover:border-on-dim transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              aria-label="Cancel this action"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
