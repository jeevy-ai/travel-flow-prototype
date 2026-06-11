export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ItineraryItem {
  time: string
  title: string
  detail: string
}

export interface ItineraryDay {
  day: string
  items: ItineraryItem[]
}

export interface Itinerary {
  destination: string
  dates: string
  days: ItineraryDay[]
  summary: string
}

export interface ConciergeResponse {
  reply: string
  itinerary: Itinerary | null
}

const ENDPOINT = 'https://ai-action-service.noahlaux.workers.dev/concierge/itinerary'

export async function sendToConcierge(messages: ChatMessage[]): Promise<ConciergeResponse> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }

  return res.json() as Promise<ConciergeResponse>
}
