import { useState, useCallback } from 'react'
import {
  sendEnquiryMessage,
  confirmEnquiryEmail,
  type ChatMessage,
  type PendingEnquiryAction,
  type ConfirmEmailResponse,
} from '../lib/enquiryApi'

export type EnquiryChatStatus = 'idle' | 'loading' | 'dispatching' | 'error'

export type EnquiryChatMessageItem =
  | { type: 'text'; role: 'user' | 'assistant'; content: string; id: string }
  | { type: 'confirmation_gate'; action: PendingEnquiryAction; id: string }
  | { type: 'receipt'; receipt: ConfirmEmailResponse; id: string }
  | { type: 'cancelled'; summary: string; id: string }

function uid() {
  return Math.random().toString(36).slice(2)
}

export interface EnquiryChatState {
  items: EnquiryChatMessageItem[]
  status: EnquiryChatStatus
  error: string | null
  pendingAction: PendingEnquiryAction | null
  sendMessage: (text: string) => Promise<void>
  confirmAction: (action: PendingEnquiryAction) => Promise<void>
  cancelAction: (action: PendingEnquiryAction) => void
  reset: () => void
}

export function useEnquiryChat(): EnquiryChatState {
  const [items, setItems] = useState<EnquiryChatMessageItem[]>([])
  const [status, setStatus] = useState<EnquiryChatStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingEnquiryAction | null>(null)

  // Build the messages array for the API from text items only
  function buildMessages(current: EnquiryChatMessageItem[]): ChatMessage[] {
    return current
      .filter((i): i is Extract<EnquiryChatMessageItem, { type: 'text' }> => i.type === 'text')
      .map(i => ({ role: i.role, content: i.content }))
  }

  const sendMessage = useCallback(
    async (text: string) => {
      if (status === 'loading' || pendingAction) return

      const userItem: EnquiryChatMessageItem = {
        type: 'text',
        role: 'user',
        content: text,
        id: uid(),
      }

      setItems(prev => [...prev, userItem])
      setStatus('loading')
      setError(null)

      try {
        const messages = buildMessages([...items, userItem])
        const result = await sendEnquiryMessage(messages)

        const assistantItem: EnquiryChatMessageItem = {
          type: 'text',
          role: 'assistant',
          content: result.reply,
          id: uid(),
        }

        if (result.pendingAction) {
          const gateItem: EnquiryChatMessageItem = {
            type: 'confirmation_gate',
            action: result.pendingAction,
            id: uid(),
          }
          setItems(prev => [...prev, assistantItem, gateItem])
          setPendingAction(result.pendingAction)
        } else {
          setItems(prev => [...prev, assistantItem])
        }

        setStatus('idle')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setStatus('error')
      }
    },
    [items, status, pendingAction]
  )

  const confirmAction = useCallback(
    async (action: PendingEnquiryAction) => {
      setStatus('dispatching')
      setError(null)

      // Remove the gate card, replace with a "sending…" placeholder
      setItems(prev => prev.filter(i => !(i.type === 'confirmation_gate' && i.id === action.id)))
      setPendingAction(null)

      try {
        const receipt = await confirmEnquiryEmail(action.id, action.rawInput)

        const receiptItem: EnquiryChatMessageItem = {
          type: 'receipt',
          receipt,
          id: uid(),
        }

        setItems(prev => [...prev, receiptItem])
        setStatus('idle')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Send failed')
        setStatus('error')
      }
    },
    []
  )

  const cancelAction = useCallback((action: PendingEnquiryAction) => {
    setItems(prev => {
      const filtered = prev.filter(
        i => !(i.type === 'confirmation_gate' && i.id === action.id)
      )
      const cancelledItem: EnquiryChatMessageItem = {
        type: 'cancelled',
        summary: action.humanSummary,
        id: uid(),
      }
      return [...filtered, cancelledItem]
    })
    setPendingAction(null)
    setStatus('idle')
  }, [])

  const reset = useCallback(() => {
    setItems([])
    setStatus('idle')
    setError(null)
    setPendingAction(null)
  }, [])

  return { items, status, error, pendingAction, sendMessage, confirmAction, cancelAction, reset }
}
