import type { OutboundAction } from '../components/outbound/types'

export interface EnquiryInput {
  recipientName: string
  recipientEmail: string
  subject: string
  bodyMarkdown: string
  replyToEmail?: string
}

export interface PendingEnquiryAction extends OutboundAction {
  rawInput: EnquiryInput
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface EnquiryResponse {
  reply: string
  pendingAction: PendingEnquiryAction | null
}

export interface ConfirmEmailResponse {
  receiptMessage: string
  messageId: string
  to: string
}

const BASE = '/concierge'

export async function sendEnquiryMessage(messages: ChatMessage[]): Promise<EnquiryResponse> {
  const res = await fetch(`${BASE}/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Enquiry request failed: ${res.status}`)
  }

  return res.json() as Promise<EnquiryResponse>
}

export async function confirmEnquiryEmail(
  actionId: string,
  rawInput: EnquiryInput
): Promise<ConfirmEmailResponse> {
  const res = await fetch(`${BASE}/confirm-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actionId, rawInput }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Confirm email failed: ${res.status}`)
  }

  return res.json() as Promise<ConfirmEmailResponse>
}
