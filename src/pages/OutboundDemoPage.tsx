import { useState } from 'react'
import { ConfirmationGate } from '../components/outbound/ConfirmationGate'
import type { OutboundAction } from '../components/outbound/types'

const DEMO_ACTIONS: OutboundAction[] = [
  {
    id: 'action-reversible-1',
    riskClass: 'reversible',
    channel: 'email',
    recipient: 'reservations@restaurantnoma.dk',
    subject: 'Reservation request – party of 2, Nov 10 2026',
    bodyPreview: `Hi,\n\nI'd like to make a reservation for 2 people on November 10, 2026 at 7:30 PM.\n\nName: Alex Chen\nPhone: +1 (415) 555-0182\nSpecial requests: Window seat if available; one guest has a nut allergy.\n\nLooking forward to hearing from you.\n\nBest regards,\nAlex`,
    humanSummary: 'Send reservation request to Noma',
    isReversible: true,
    isPaid: false,
  },
  {
    id: 'action-irreversible-1',
    riskClass: 'irreversible',
    channel: 'api_call',
    recipient: 'ticketmaster.com/api/v1/orders',
    subject: undefined,
    bodyPreview: `POST /api/v1/orders\n{\n  "eventId": "WS2026-KEYNOTE",\n  "quantity": 1,\n  "tier": "general_admission",\n  "attendee": {\n    "name": "Alex Chen",\n    "email": "alex@example.com"\n  }\n}`,
    humanSummary: 'Purchase Web Summit keynote ticket',
    isReversible: false,
    isPaid: false,
  },
  {
    id: 'action-paid-1',
    riskClass: 'paid',
    channel: 'form_submit',
    recipient: 'booking.com/hotels/lisbon-marriott',
    subject: 'Hotel booking: Marriott Lisbon, Nov 9–12',
    bodyPreview: `Submitting hotel reservation:\n\nGuest: Alex Chen\nDates: Nov 9–12, 2026 (3 nights)\nRoom: Superior King, city view\nRate: €249/night\nTotal: €747 + taxes\n\nPayment: Visa ending 4242\nLoyalty: Bonvoy #8847221`,
    humanSummary: 'Book Marriott Lisbon for 3 nights',
    isReversible: false,
    isPaid: true,
    estimatedCost: 747,
    currency: 'EUR',
  },
]

type ActionState = 'pending' | 'confirmed' | 'cancelled'

export function OutboundDemoPage() {
  const [states, setStates] = useState<Record<string, ActionState>>(
    Object.fromEntries(DEMO_ACTIONS.map(a => [a.id, 'pending']))
  )

  function handleConfirm(id: string) {
    setStates(s => ({ ...s, [id]: 'confirmed' }))
  }

  function handleCancel(id: string) {
    setStates(s => ({ ...s, [id]: 'cancelled' }))
  }

  function reset() {
    setStates(Object.fromEntries(DEMO_ACTIONS.map(a => [a.id, 'pending'])))
  }

  return (
    <div className="min-h-screen bg-surface-0 px-4 py-12">
      <div className="mx-auto max-w-sm">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-[11px] font-mono text-accent uppercase tracking-widest opacity-70 mb-1">
            component demo
          </p>
          <h1 className="text-on-surface font-bold text-[22px] leading-tight">
            ConfirmationGate
          </h1>
          <p className="text-on-dim text-[14px] mt-1">
            Three states: reversible · irreversible · paid (locked)
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {DEMO_ACTIONS.map(action => {
            const actionState = states[action.id]

            if (actionState !== 'pending') {
              return (
                <div
                  key={action.id}
                  className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
                    actionState === 'confirmed'
                      ? 'border-success/30 bg-success/5'
                      : 'border-border bg-surface-2'
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">
                    {actionState === 'confirmed' ? '✓' : '✕'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-semibold leading-snug ${
                      actionState === 'confirmed' ? 'text-success' : 'text-on-dim'
                    }`}>
                      {actionState === 'confirmed' ? 'Sent' : 'Cancelled'}
                    </p>
                    <p className="text-on-dim text-[12px] truncate">{action.humanSummary}</p>
                  </div>
                </div>
              )
            }

            return (
              <div key={action.id}>
                <p className="text-[11px] font-mono text-on-dim uppercase tracking-widest mb-2 px-1">
                  {action.riskClass}
                </p>
                <ConfirmationGate
                  action={action}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                />
              </div>
            )
          })}
        </div>

        <button
          onClick={reset}
          className="mt-8 w-full py-3 rounded-xl border border-border text-on-dim text-[14px] font-medium hover:text-on-surface hover:border-on-dim transition-colors"
        >
          Reset demo
        </button>
      </div>
    </div>
  )
}
