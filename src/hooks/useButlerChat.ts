import { useState, useCallback } from 'react'
import { sendToConcierge, alterItinerary, type ChatMessage, type Itinerary } from '../lib/conciergeApi'
import { sendToConciergeAuth, alterItineraryAuth } from '../lib/butlerApi'

export type ChatStatus = 'idle' | 'loading' | 'altering' | 'error'

export interface ButlerChatState {
  messages: ChatMessage[]
  status: ChatStatus
  error: string | null
  itinerary: Itinerary | null
  sendMessage: (text: string) => Promise<void>
  alterPlan: (instruction: string) => Promise<void>
  reset: () => void
}

interface ButlerChatOptions {
  // When provided, authenticated backend calls are made (trips saved to Neon)
  getToken?: () => Promise<string | null>
}

export function useButlerChat(opts: ButlerChatOptions = {}): ButlerChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setStatus('loading')
    setError(null)

    try {
      let result: { reply: string; itinerary: Itinerary | null }
      const token = opts.getToken ? await opts.getToken() : null
      if (token) {
        result = await sendToConciergeAuth(next, token) as typeof result
      } else {
        result = await sendToConcierge(next)
      }
      setMessages(prev => [...prev, { role: 'assistant', content: result.reply }])
      if (result.itinerary) setItinerary(result.itinerary)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.')
      setStatus('error')
    }
  }, [messages, opts])

  const alterPlan = useCallback(async (instruction: string) => {
    if (!itinerary) return
    setStatus('altering')
    setError(null)

    try {
      let result: { reply: string; itinerary: Itinerary | null }
      const token = opts.getToken ? await opts.getToken() : null
      if (token) {
        result = await alterItineraryAuth(instruction, itinerary, messages, token) as typeof result
      } else {
        result = await alterItinerary(instruction, itinerary, messages)
      }
      const assistantMsg = `Got it — I've updated the plan: ${result.reply}`
      setMessages(prev => [
        ...prev,
        { role: 'user', content: instruction },
        { role: 'assistant', content: assistantMsg },
      ])
      if (result.itinerary) setItinerary(result.itinerary)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update the plan')
      setStatus('error')
    }
  }, [itinerary, messages, opts])

  const reset = useCallback(() => {
    setMessages([])
    setStatus('idle')
    setError(null)
    setItinerary(null)
  }, [])

  return { messages, status, error, itinerary, sendMessage, alterPlan, reset }
}
