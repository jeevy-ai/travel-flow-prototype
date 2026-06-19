import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendToConcierge, alterItinerary, type ChatMessage, type Itinerary } from '../lib/conciergeApi'

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

export function useButlerChat(): ButlerChatState {
  const navigate = useNavigate()
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
    } catch {
      navigate('/legacy?q=' + encodeURIComponent(text))
    }
  }, [messages, navigate])

  const alterPlan = useCallback(async (instruction: string) => {
    if (!itinerary) return
    setStatus('altering')
    setError(null)

    try {
      const result = await alterItinerary(instruction, itinerary, messages)
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
  }, [itinerary, messages])

  const reset = useCallback(() => {
    setMessages([])
    setStatus('idle')
    setError(null)
    setItinerary(null)
  }, [])

  return { messages, status, error, itinerary, sendMessage, alterPlan, reset }
}
