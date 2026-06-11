import { useState, useCallback } from 'react'
import { sendToConcierge, type ChatMessage, type Itinerary } from '../lib/conciergeApi'

export type ChatStatus = 'idle' | 'loading' | 'error'

export interface ButlerChatState {
  messages: ChatMessage[]
  status: ChatStatus
  error: string | null
  itinerary: Itinerary | null
  sendMessage: (text: string) => Promise<void>
  reset: () => void
}

export function useButlerChat(): ButlerChatState {
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
      const result = await sendToConcierge(next)
      setMessages(prev => [...prev, { role: 'assistant', content: result.reply }])
      if (result.itinerary) setItinerary(result.itinerary)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }, [messages])

  const reset = useCallback(() => {
    setMessages([])
    setStatus('idle')
    setError(null)
    setItinerary(null)
  }, [])

  return { messages, status, error, itinerary, sendMessage, reset }
}
